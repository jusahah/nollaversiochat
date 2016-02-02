var siteConstructor = require('./site');
var routingTableConstructor = require('./routingTable');

function DomainLayer(mediator) {

	this.init = function() {
		// We need to build up two data structures from files
		// 1) Site table, where sitekey maps into Site Object
		// 2) Routing table, where clientID maps into sitekey

		// For now a site can only have one entrepreneur at a time online
		var siteKeys = this.mediator.needSiteKeysFromDisk();
		var routings = this.mediator.needRoutingDataFromDisk();

		this.initSiteTable(siteKeys);
		this.initRoutingTable(routings); 
	}

	this.initSiteTable = function(siteKeys) {

	}
	this.initRoutingTable = function(routings) {
		
	}

	this.gateway = function(commandObject) {
		var userID = commandObject.from;
		var msg    = commandObject.msg;

		switch(commandObject.tag) {
		    case 'userLeft':
		        this.userLeft(userID);
		        break;
		    case 'msgFromUser':
		        this.msgFromUser(userID, msg);
		        break;
		    case: 'userJoined':
		    	this.userJoined(userID);
		    	break;    
		    default:
		        default code block
		}
	}

	this.userJoined = function(userID) {

	}
	this.userLeft = function(userID) {

	}
	this.msgFromUser = function(userID, msg) {

	}




}

module.exports = function(mediator) {
	return new DomainLayer(mediator);

}