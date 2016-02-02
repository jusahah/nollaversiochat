var _ = require('lodash');

function Site(sitekey, mediator) {
	this.mediator = mediator;
	this.sitekey = sitekey;

	this.availables = []; // Entrepreneur at index zero is always the active one, others are passive
	this.clients = [];

	this.msgInFromClient = function(msg, clientID) {
		if (this.hasEntrepreneur()) {
			this.mediator.sendMsgToUserName(msg, this.getEntrepreneur());
			return true;
		}
		return false;
	}

	this.clientJoin = function(userName) {
		this.clients.push(userName);
		this.mediator.logInfo('Client ' + userName + ' joined site object ' + this.sitekey);
		this.mediator.logInfo('Clients currently: ' + this.clients.join(', '));

	}

	this.clientLeft = function(userName) {
		var i = this.clients.indexOf(userName);
		if (i === -1) return false;
		this.clients.splice(i, 1);
		this.informEntrepreneur({tag: 'clientLeft', clientID: userName});
		this.mediator.logInfo('Client ' + userName + ' left site object ' + this.sitekey);
		this.mediator.logInfo('Clients currently: ' + this.clients.join(', '));

		return true;
	}

	this.registerAsAvailableEntrepreneur = function(userName) {
		this.availables.push(userName);
		if (this.availables.length === 1) {
			// It was empty previously, inform clients that there are entrepreneur online now
			this.mediator.logInfo('First Entrepreneur joined site object ' + this.sitekey + '-> inform clients');
			this.informClients({tag: 'entrepreneurJoined', sitekey: this.sitekey});
		}
		this.mediator.logInfo('Entrepreneur ' + userName + ' joined site object ' + this.sitekey);
		this.mediator.logInfo('Site object now has following entrepreneurs: ' + this.availables.join(", "));

	}

	this.unregisterAsAvailableEntrepreneur = function(userName) {
		var i = this.availables.indexOf(userName);

		if (i === -1) {
			this.mediator.logWarn('Trying to unregister entrepreneur but he is not part of site: ' + userName);
			return false;
		} 

		this.availables.splice(i, 1); // Remove entrepreneur from site availables
		if (!this.hasEntrepreneur()) {
			// Nobody is left
			this.mediator.logInfo('Last Entrepreneur left site object ' + this.sitekey + '-> inform clients');
			this.informClients({tag: 'noEntrepreneursAvailable', sitekey: this.sitekey});
		}
		else if (i === 0) {
			// Leading entrepreneur is going away but somebody is still there
			this.informClients({tag: 'entrepreneurChange', sitekey: this.sitekey});
		}
		this.mediator.logInfo('Entrepreneur ' + userName + ' left site object ' + this.sitekey);
		this.mediator.logInfo('Site object now has following entrepreneurs: ' + this.availables.join(", "));		

		return true;


	}

	this.hasEntrepreneur = function() {
		return this.availables.length !== 0;
	}

	this.informClients = function(msg) {
		_.each(this.clients, function(client) {
			this.mediator.sendMsgToUserName(msg, client);
		}.bind(this));
	}

	this.informEntrepreneur = function(msg) {
		if (this.hasEntrepreneur()) {
			this.mediator.sendMsgToUserName(msg, this.getEntrepreneur());
			return true;
		}
		return false;
	}

	this.getEntrepreneur = function() {
		return this.availables[0];
	}


}

module.exports = Site;