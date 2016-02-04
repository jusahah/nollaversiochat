var fs = require('fs-extra');
var CryptoJS = require("crypto-js");
var _ = require('lodash');

var SECRETS_PATH = 'appdata/secrets.json';
var SECRET_KEY = 'nollaversio4700';


function DataLayer(mediator) {
	this.mediator = mediator;

	this.testCrypto = function() {
		var en1 = CryptoJS.AES.encrypt('secret', '123').toString();
		var en2 = CryptoJS.AES.encrypt('secret', '123').toString();

		var s1 = CryptoJS.AES.decrypt(en1, '123').toString(CryptoJS.enc.Utf8);
		var s2 = CryptoJS.AES.decrypt(en2, '123').toString(CryptoJS.enc.Utf8);

	}

	this.init = function() {
		//this.testCrypto();
		return;
		// FOR TESTING
		try {
			fs.outputJsonSync(SECRETS_PATH, {
				'abcd1234': CryptoJS.AES.encrypt('secret', SECRET_KEY).toString(),
				'abcd1235': CryptoJS.AES.encrypt('secret2', SECRET_KEY).toString(),
			});
		} catch (err) {
			console.log("ERROR CREATING SECRETS FILE");
			throw err;
		}
	}


	this.validateSecret = function(siteKey, siteSecret) {
		var secrets = fs.readJsonSync(SECRETS_PATH);
		if (!secrets.hasOwnProperty(siteKey)) return false;
		console.log(CryptoJS.AES.decrypt(secrets[siteKey], SECRET_KEY).toString(CryptoJS.enc.Utf8));
		if (CryptoJS.AES.decrypt(secrets[siteKey], SECRET_KEY).toString(CryptoJS.enc.Utf8) === siteSecret) {
			console.log("VALIDATION SUCCESS FOR SITE: " + siteKey);
			return true;
		}	
		return false;
	}

	this.addSecret = function(siteKey, siteSecret) {
		var secrets = fs.readJsonSync(SECRETS_PATH);
		secrets[siteKey] = CryptoJS.AES.encrypt(siteSecret, SECRET_KEY).toString();
		fs.writeJsonSync(SECRETS_PATH, secrets);

	}

	this.needSiteKeysFromDisk = function() {
		var secrets = fs.readJsonSync(SECRETS_PATH);
		if (!secrets) return [];
		var keys = _.keys(secrets);
		return keys;

	}

	this.init();

}

module.exports = function(mediator) {
	return new DataLayer(mediator);
}