var mediator = require('./Mediator')();

var domainLayer   = require('./domainlayer')(mediator);
var internetLayer = require('./internetlayer')(mediator);
var dataLayer     = require('./datalayer')(mediator);

mediator.registerLayers({
	domain: domainLayer,
	internet: internetLayer,
	data: dataLayer
});

mediator.launch();

