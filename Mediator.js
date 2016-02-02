var winston = require('winston');

function Mediator(logger) {

	this.logger = logger;
	this.layers;

	this.launch = function() {
		this.layers.data.init();
		this.layers.internet.init();
		this.layers.domain.init();
	}

	this.validateSecret = function(siteKey, siteSecret) {
		// Always validated straight in data layer
		return this.layers.data.validateSecret(siteKey, siteSecret);
	}

	this.registerLayers = function(layers) {
		this.layers = layers;
	}

	this.sendMsgToUserName = function(msgObj, toUserName) {
		this.logInfo('Msg to: ' + toUserName + " | Contents: " + JSON.stringify(msgObj));
		this.layers.internet.msgToSocket(msgObj, toUserName);

	}

	this.msgFromSocket = function(fromUserName, toSite, isEntrepreneur, msgObj) {
		this.logInfo('Msg from: ' + fromUserName + " | Contents: " + JSON.stringify(msgObj));
		return this.layers.domain.gateway({tag: 'msgFromUser', from: fromUserName, isEntrepreneur: isEntrepreneur, msgObj: msgObj});

	}

	// Logging facade
	this.logInfo = function(msg) {
		this.logger.log('info', msg);
	}

	this.logWarning = function(msg) {
		this.logger.log('warn', msg);
	}

	this.logError = function(msg, isFatal) {
		this.logger.log('error', msg);
		if (isFatal) {
			// We are fucked.
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
		return this.layers.data.needSiteKeysFromDisk();

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

module.exports = function(logger, testMode) {
	logger = logger || winston;
	var mediator = new Mediator(logger);

	if (testMode) {
		// Monkey patch like hell some suitable methods
		mediator.needSiteKeysFromDisk = needSiteKeysFromDiskFake;
		mediator.needRoutingDataFromDisk = needRoutingDataFromDiskFake;

	}

	return mediator;
}

function needSiteKeysFromDiskFake() {
	return ['aaa1', 'bbb2', 'ccc3', 'ddd4'];
}
function needRoutingDataFromDiskFake() {
	return [];

}