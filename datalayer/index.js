var fs = require('fs-extra');
var CryptoJS = require("crypto-js");

var SECRETS_PATH = 'secrets.json';
var SECRET_KEY = 'nollaversio4700';


function DataLayer(mediator) {
	this.mediator = mediator;

	this.init = function() {
		try {
			fs.createFileSync(SECRETS_PATH);
		} catch (err) {
			console.log("ERROR CREATING SECRETS FILE");
			throw err;
		}
	}

	this.validateSecret = function(siteKey, siteSecret) {
		var secrets = fs.readJsonSync(SECRETS_PATH);
		if (!secrets.hasOwnProperty(siteKey)) return false;
		if (CryptoJS.AES.decrypt(secrets[siteKey], SECRET_KEY).toString() === siteSecret) {
			return true;
		}	
		return false;
	}

	this.addSecret = function(siteKey, siteSecret) {
		var secrets = fs.readJsonSync(SECRETS_PATH);
		secrets[siteKey] = CryptoJS.AES.encrypt(siteSecret, SECRET_KEY).toString();
		fs.writeJsonSync(SECRETS_PATH, secrets);

	}

	this.init();

}

module.exports = function(mediator) {
	return new DataLayer(mediator);
}