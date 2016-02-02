var mediator = new FakeMediator();

var domainLayer   = require('./domainlayer')(mediator);


mediator.registerLayers({
	domain: domainLayer
});

function FakeMediator() {

	this.layers;

	this.launch = function() {
		this.layers.domain.init();
	}	

	this.registerLayers = function(layers) {

		this.layers = layers;
	}

	this.validateSecret = function(siteKey, siteSecret) {
		// Always validated straight in data layer
		console.log("VALIDATION REQUEST: " + siteKey + ", " + siteSecret);
		return true;
	}

	this.sendMsgToUserName = function(msgObj, toUserName) {
		console.log('Msg to: ' + toUserName + " | Contents: " + JSON.stringify(msgObj));
	}

	this.msgFromSocket = function(fromUserName, toSite, isEntrepreneur, msgObj) {
		return this.layers.domain.gateway({tag: 'msgFromUser', siteKey: toSite, from: fromUserName, isEntrepreneur: isEntrepreneur, msg: msgObj});
	}

	// Logging facade
	this.logInfo = function(msg) {
		console.log(msg);
	}

	this.logWarning = function(msg) {
		console.log(msg);
	}

	this.logError = function(msg, isFatal) {
		console.log(msg);
		if (isFatal) {
			// We are fucked.
			return;
			this.prepareForControlledShutDown();
		}		
	}

	this.prepareForControlledShutDown = function() {
		// Do something
		// Must be everything in sync because we throw soon
		// But then again, at this point doing in sync makes no difference anyway
		// as we are going down.
	}

	this.needSiteKeysFromDisk = function() {
		return ['abcd1234', 'abcd1235', 'abcd1236'];

	}

	this.needRoutingDataFromDisk = function() {

	}

	this.userJoined = function(userID, siteKey, isEntrepreneur) {
		return this.layers.domain.gateway({tag: 'userJoined', from: userID, siteKey: siteKey, isEntrepreneur: isEntrepreneur});

	}
	this.userDisconnected = function(userID, siteKey, isEntrepreneur) {
		return this.layers.domain.gateway({tag: 'userLeft', from: userID, siteKey: siteKey, isEntrepreneur: isEntrepreneur});
	}	
}

setTimeout(function() {
	mediator.launch();
}, 500);

setTimeout(function() {
	console.log("------------------- 1")

	mediator.userJoined('abcd1_178878_e', 'abcd1234', true);
	mediator.userJoined('abcd1_728382_c', 'abcd1234', false);
	mediator.userJoined('abcd1_728383_c', 'abcd1234', false);
	mediator.userJoined('abcd1_728384_c', 'abcd1235', false);		
	console.log("-------------------")

}, 750);

setTimeout(function() {
	console.log("------------------- 2")

	mediator.msgFromSocket('abcd1_728384_c', 'abcd1235', false, {msg: 'NoGoer' + Math.floor(Math.random()*1000)});
	mediator.msgFromSocket('abcd1_728383_c', 'abcd1234', false, {msg: 'YesGoer' + Math.floor(Math.random()*1000)});
	mediator.msgFromSocket('abcd1_178878_e', 'abcd1234', true, {clientID: 'abcd1_728382_c', msg: 'Testi' + Math.floor(Math.random()*1000)});
	console.log("-------------------")
}, 900);

setTimeout(function() {
	console.log("------------------- 3")
	mediator.userDisconnected('abcd1_728382_c', 'abcd1234', false);	
	mediator.userDisconnected('abcd1_178878_e', 'abcd1234', true);
	console.log("-------------------")

}, 1500);




