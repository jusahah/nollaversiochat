var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8090);

function handler (req, res) {
  return true;
}

function InternetLayer(mediator) {
	this.mediator = mediator;

	this.namesToSocketsTable = {};

	this.randomPortionGeneration = function(len) {

		var CHARS = 'abcdefghijklmnopqrstuwxzy';
		var s = '';
		var l = CHARS.length;

		for (var i = len - 1; i >= 0; i--) {
			s += CHARS[Math.floor(Math.random()*l)];
		}

		return s;

	}

	this.generateID = function(sitekey, isEntrepreneur) {

		var postfix = isEntrepreneur ? 'e' : 'c'; // e as entrepreneur, c as client
		var timePortion = Date.now();
		var randomPortion = this.randomPortionGeneration(6);

		return randomPortion + "_" + timePortion + "_" + sitekey + "_" + postfix;

	}

	this.msgToSocket = function(msgObj, clientID) {
		if (!this.namesToSocketsTable.hasOwnProperty(clientID)) {
			this.mediator.logWarning('Trying to send msg to user who has no socket in the table: ' + clientID);
			return false;
		}

		var s = this.namesToSocketsTable[clientID];
		s.emit('msgFromServer', msgObj);
	}

	this.init = function() {
		io.on('connection', function(socket) {
			console.log("CONNECTION IN");
			socket.on('reconnect', function() {
				console.log("RECONNECT IN SERVER");
			});
			socket.on('userIdentification', function(identificationObject) {
				if (!identificationObject.clientID || identificationObject.clientID == 0) {
					// Client has no clientID yet

					if (identificationObject.sitesecret) {
						// Tries to log in as entrepreneur
						// Need validation
						// Validation done sync for simplicity
						var result = this.mediator.validateSecret(identificationObject.sitekey, identificationObject.sitesecret);
						if (result === true) {
							// Validation success
							socket.isEntrepreneur = true;
						} else {
							// Validation fail
							this.mediator.logWarning('Tried to login as entrepreneur but failed! ' + JSON.stringify(identificationObject));
							socket.emit('authorizationFailed');
							// No need to add him to the sockets table
							return false;
						}
					} else {
						// Tries to be a normal client
						socket.isEntrepreneur = false;
					}
					var id = this.generateID(identificationObject.sitekey, socket.isEntrepreneur);
					// Add new record to sockets table
					if (this.namesToSocketsTable.hasOwnProperty(id)) {
						// Something is very wrong in the universe
						this.mediator.logError('Random ID generated already exists in the sockets table: ' + id, true);
						throw "RANDOM ID GENERATED TWICE";
					}

				} else {
					// We need this to work
					// When server crashes, client must remember its clientID so that
					// when server comes up and new (re)connection is made, client can provide that 
					// for socket creation
					if (identificationObject.sitesecret) {
						// Only clients need to provide clientID
						this.mediator.logWarning('Client ID and siteSecret must not be in a same identification msg: ' + identificationObject.clientID);
						return false;
					}
					// He tries to identify as client which is correct
					socket.isEntrepreneur = false;
					var id = identificationObject.clientID;
					// That is it! Now rest of the layers know how to handle this socket's messages
					
					//this.mediator.logWarning('User identification object contains clientID -> should not contain as feature is not implemented yet');
					//return; // Unsupported as of 2.2.2016 -> developer later this reconnecting feature
					// Already has clientID
					/*
					if (this.namesToSocketsTable.hasOwnProperty(identificationObject.clientID)) {
						this.mediator.logWarning('Client providing identification but is already in sockets table: ' + JSON.stringify(identificationObject))
						return false; // Do nothing
					}
					var id = identificationObject.clientID;
					*/
				}

				var res = this.mediator.userJoined(id, identificationObject.sitekey, socket.isEntrepreneur);
				if (!res) {
					socket.emit('siteNotSupported');
					return;
				}

				this.namesToSocketsTable[id] = socket;
				// Attach rest of the relevant info directly to socket itself
				socket.nollaversioClientID = id;
				socket.nollaversioSitekey  = identificationObject.sitekey;
				socket.initializationDone  = true;				
				socket.emit('welcomeIn', {id: id, sitekey: identificationObject.sitekey, isEntrepreneur: socket.isEntrepreneur});


			}.bind(this));

			socket.on('incomingMsg', function(msgObj) {
				console.log("MSG IN");
				if (!socket.initializationDone) {
					this.mediator.logWarning('Socket tries to send msg before initializationDone: ' + JSON.stringify(msgObj));
					socket.emit('identifyYourSelf');
					return false; // Just ditch the message
				} 
				this.mediator.msgFromSocket(socket.nollaversioClientID, socket.nollaversioSitekey, socket.isEntrepreneur, msgObj);


			}.bind(this));

			socket.on('disconnect', function() {
				this.mediator.userDisconnected(socket.nollaversioClientID, socket.nollaversioSitekey, socket.isEntrepreneur);
			}.bind(this));

			socket.emit('identifyYourSelf');

		}.bind(this));


	}
}

module.exports = function(mediator) {
	return new InternetLayer(mediator);

}