var winston = require('winston');

function Mediator(logger) {

	this.logger = logger;
	this.layers;

	this.launch = function() {
		this.layers.data.init();
		this.layers.internet.init();
		this.layers.domain.init();
	}

	this.registerLayers = function(layers) {
		this.layers = layers;
	}

	this.socketDisconnected = function(clientID) {
		this.logInfo('User left: ' + clientID);		
		this.layers.domain.gateway({tag: 'userLeft', from: clientID});
	}

	this.sendMsgToUserName = function(msgObj, toUserName) {
		this.logInfo('Msg to: ' + toUserName + " | Contents: " + JSON.stringify(msgObj));
		this.layers.internet.msgToSocket(msgObj, toUserName);

	}

	this.msgFromSocket = function(romUserName, toSite, msgObj) {
		this.logInfo('Msg from: ' + fromUserName + " | Contents: " + JSON.stringify(msgObj));
		this.layers.domain.gateway({tag: 'msgFromUser', from: fromUserName, msgObj: msgObj});

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

	}

	this.needRoutingDataFromDisk = function() {

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
}

function needSiteKeysFromDiskFake() {
	return ['aaa1', 'bbb2', 'ccc3', 'ddd4'];
}
function needRoutingDataFromDiskFake() {
	return [];

}