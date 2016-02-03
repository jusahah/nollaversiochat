var _ = require('lodash');
var Joi = require('joi');

var schemaForMsg = Joi.object().keys({
	isEntrepreneur: Joi.boolean().required(),
	siteKey: Joi.string().alphanum().min(8).max(8).required(),
	from: Joi.string().min(10).max(80).required(),
	msgObj: Joi.object(),
	tag: Joi.string().alphanum().min(1).max(128).required()
});

var siteConstructor = require('./site');

function DomainLayer(mediator) {

	this.mediator = mediator;

	this.sites = {};
	this.routingTable = {};

	this.init = function() {
		// We need to build up two data structures from files
		// 1) Site table, where sitekey maps into Site Object
		// 2) Routing table, where clientID maps into sitekey

		// For now a site can only have one entrepreneur at a time online
		var siteKeys = this.mediator.needSiteKeysFromDisk();
		//var routings = this.mediator.needRoutingDataFromDisk();

		this.initSiteTable(siteKeys);
		//this.initRoutingTable(routings); 
	}

	this.initSiteTable = function(siteKeys) {

		_.each(siteKeys, function(sitekey) {
			this.sites[sitekey] = new siteConstructor(sitekey, this.mediator);
		}.bind(this));

		this.mediator.logInfo('Site key built up for sitekeys: ' + siteKeys.join(", "));


	}
	this.initRoutingTable = function(routings) {

		// routings is an array of {clientID: id, sitekey: sitekey} pairs
		_.each(routings, function(routing) {
			this.routingTable[routing.clientID] = routing.sitekey; 
		}.bind(this));

		this.mediator.logInfo('Routing Table built up from routings: ' + JSON.stringify(routings));


	}

	this.validateCommandObject = function(cmd) {
		var success = true;
		Joi.validate(cmd, schemaForMsg, function(err, value) {
			if (err) {
				this.mediator.logError('Command object validation fails: ' + err);
				success = false;
			}
		}.bind(this));

		return success;
	}

	this.gateway = function(commandObject) {
		if (!this.validateCommandObject(commandObject)) {
			return false;
		}
		var userID = commandObject.from;
		var siteKey = commandObject.siteKey;
		var isEntrepreneur = commandObject.isEntrepreneur;
		var msg    = commandObject.msgObj;

		switch(commandObject.tag) {
		    case 'userLeft':
		        return this.userLeft(userID, siteKey, isEntrepreneur);
		        break;
		    case 'msgFromUser':
		        return this.msgFromUser(userID, siteKey, isEntrepreneur, msg);
		        break;
		    case 'userJoined':
		    	return this.userJoined(userID, siteKey, isEntrepreneur);
		    	break;    
		    default:
		        return false;
		}

		return false;
	}

	this.userJoined = function(userID, siteKey, isEntrepreneur) {
		if (!this.sites.hasOwnProperty(siteKey)) {
			this.mediator.logWarning('User join failed in domain layer: ' + userID + ", " + siteKey);
			return false;
		}
		var siteObject = this.sites[siteKey];

		if (!isEntrepreneur) {
			siteObject.clientJoin(userID);		
		} else {
			siteObject.registerAsAvailableEntrepreneur(userID);
		}



		return true;



	}
	this.userLeft = function(userID, siteKey, isEntrepreneur) {
		if (!this.sites.hasOwnProperty(siteKey)) {
			this.mediator.logWarning('User left failed in domain layer - no site exists: ' + userID + ", " + siteKey);
			return false;
		}	
		var siteObject = this.sites[siteKey];

		if (!isEntrepreneur) {
			siteObject.clientLeft(userID);	

		} else {			
			siteObject.unregisterAsAvailableEntrepreneur(userID);
		}
		return true;

	}
	this.msgFromUser = function(userID, siteKey, isEntrepreneur, msg) {
		if (isEntrepreneur) {
			// Msg contains routing info
			var clientID = msg.clientID;
			// Important that client does not get to know entrepreneurs user id!
			// Msg contains screenName already

			// We could perhaps check just in case that clientID is member of site object sitekey
			this.mediator.sendMsgToUserName(msg, clientID);

		} else {
			// Msg does not contain info, instead we do resolution from site object
			if (!this.sites.hasOwnProperty(siteKey)) {
				this.mediator.logWarning('Msg forwarding to entrepreneur failed in domain layer - no site exists: ' + userID + ", " + siteKey);
				return false;
			}

			var siteObject = this.sites[siteKey];
			siteObject.msgInFromClient(msg, userID);				

		}
	}






}

module.exports = function(mediator) {
	return new DomainLayer(mediator);

}