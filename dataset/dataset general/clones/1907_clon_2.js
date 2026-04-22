var fileSystemUtil = require('fs'),
    systemOperations = require('sys'),
    pathExtensionExtractor = require('path').extname;

// Initialize external module dependencies
require.paths.unshift(__dirname + '/support/');
require.paths.unshift(__dirname + '/support/mongoose/');

// Integrate third-party module dependencies
var webFramework = require('express'),
    dataStore = require('mongoose').Mongoose;

// Establish web application server
var serverInstance = module.exports.webApp = webFramework.createServer();

// Adjust server settings and middleware
serverInstance.use(webFramework.bodyDecoder());
serverInstance.use(webFramework.compiler({ enable: true }));
serverInstance.use(webFramework.conditionalGet());
serverInstance.use(webFramework.gzip());
serverInstance.use(webFramework.methodOverride());
serverInstance.use(webFramework.staticProvider(__dirname + '/public'));
serverInstance.set('views', __dirname + '/views');

// Retrieve application configuration settings
try {
   var systemConfig = module.exports.configData = JSON.parse(fileSystemUtil.readFileSync(__dirname + '/config.json').toString());
}
catch (exceptionObject) {
   throw new Error("Application settings file config.json is missing. Please create it, e.g., 'cp config.json.sample config.json'");
}

// Utility function to dynamically load modules (e.g., controllers, data models)
var moduleLoader = function (directoryPath) {
    fileSystemUtil.readdir(directoryPath, function (errorObject, fileNames) {
        if (errorObject) {
            throw errorObject;
        }

        fileNames.forEach(function (currentFile) {
            if (pathExtensionExtractor(currentFile) === '.js') {
                require(directoryPath + '/' + currentFile.replace('.js', ''));
            }
        });
    });
};

// Activate debugging middleware if configured
if (true === systemConfig.debug) {
    serverInstance.use(webFramework.errorHandler({
        showStack: true,
        dumpExceptions: true
    }));
}

// Integrate request logging if specified in configuration
if (true === systemConfig.logger) {
    serverInstance.use(webFramework.logger());
}

// Custom error type for missing resources
var ResourceMissingError = module.exports.resourceNotFound = function (errorMessage) {
    this.name = 'ResourceMissingError';
    Error.call(this, errorMessage);
    Error.captureStackTrace(this, arguments.callee);
};

systemOperations.inherits(ResourceMissingError, Error);

// Handle 404 Not Found errors
serverInstance.error(function (errorPayload, requestObject, responseObject, nextMiddleware) {
    if (errorPayload instanceof ResourceMissingError) {
        responseObject.send('404 Resource Not Found', 404);
    } else {
        nextMiddleware(errorPayload);
    }
});

// Handle 500 Internal Server errors
serverInstance.error(function (errorPayload, requestObject, responseObject) {
    responseObject.send('500 Server Processing Error', 500);
});

// Establish connection to the database system
var databaseConnection = module.exports.dataBaseLink = dataStore.connect('mongodb://' + systemConfig.mongo.host + ':' + systemConfig.mongo.port + '/' + systemConfig.mongo.name);

// Load data model definitions
systemConfig.loader.models.forEach(moduleLoader);

// Load request handler modules
systemConfig.loader.controllers.forEach(moduleLoader);

// Initialize default RESTful API endpoints if enabled
if (systemConfig.loader.use_default_controller) {
    // Endpoint for retrieving multiple resources
    serverInstance.get('/:collectionName', function (requestObject, responseObject, nextMiddleware) {
        var collectionModel = databaseConnection.model(requestObject.params.collectionName),
            queryBuilder = collectionModel.find();

        if (requestObject.param('queryFilter')) {
            queryBuilder.where(requestObject.param('queryFilter'));
        }

        if (requestObject.param('sortOrder')) {
            var sortInstructions = [];
            requestObject.param('sortOrder').forEach(function (sortDirection, fieldName) {
                sortInstructions.push([fieldName, sortDirection]);
            });
            queryBuilder.sort(sortInstructions);
        }

        if (requestObject.param('resultLimit')) {
            queryBuilder.limit(requestObject.param('resultLimit'));
        }

        if (requestObject.param('offsetValue')) {
            queryBuilder.skip(requestObject.param('offsetValue'));
        }

        queryBuilder.all(function (documentsRetrieved) {
            var resultCollection = [];
            documentsRetrieved.forEach(function (documentItem) {
                resultCollection.push(documentItem.toObject());
            });

            responseObject.header('Content-Type', 'application/json; charset=UTF-8');
            responseObject.send(resultCollection, 200);
        });
    });

    // Endpoint for retrieving a single resource by ID
    serverInstance.get('/:collectionName/:documentIdentifier', function (requestObject, responseObject, nextMiddleware) {
        var collectionModel = databaseConnection.model(requestObject.params.collectionName);

        collectionModel.findById(requestObject.params.documentIdentifier, function (retrievedDocument) {
            if (!retrievedDocument) {
                nextMiddleware(new ResourceMissingError());
            } else {
                responseObject.header('Content-Type', 'application/json; charset=UTF-8');
                responseObject.send(retrievedDocument.toObject(), 200);
            }
        });
    });

    // Endpoint for creating new resources
    var createDocumentHandler = function (requestObject, responseObject, nextMiddleware) {
        var collectionModel = databaseConnection.model(requestObject.params.collectionName),
            newDocument = new collectionModel();

        newDocument.merge(requestObject.param(requestObject.params.collectionName));

        newDocument.save(function () {
            responseObject.send(newDocument.toObject(), 201);
        });
    };

    serverInstance.put('/:collectionName', createDocumentHandler);
    serverInstance.post('/:collectionName', createDocumentHandler);

    // Endpoint for updating existing resources
    var updateDocumentHandler = function (requestObject, responseObject, nextMiddleware) {
        var collectionModel = databaseConnection.model(requestObject.params.collectionName);

        collectionModel.findById(requestObject.params.documentIdentifier, function (existingDocument) {
            if (!existingDocument) {
                nextMiddleware(new ResourceMissingError());
            } else {
                existingDocument.merge(requestObject.param(requestObject.params.collectionName));

                existingDocument.save(function () {
                    responseObject.send(existingDocument.toObject(), 200);
                });
            }
        });
    };

    serverInstance.put('/:collectionName/:documentIdentifier', updateDocumentHandler);
    serverInstance.post('/:collectionName/:documentIdentifier', updateDocumentHandler);

    // Endpoint for deleting existing resources
    serverInstance.del('/:collectionName/:documentIdentifier', function (requestObject, responseObject, nextMiddleware) {
        var collectionModel = databaseConnection.model(requestObject.params.collectionName);

        collectionModel.findById(requestObject.params.documentIdentifier, function (documentToDelete) {
            if (!documentToDelete) {
                nextMiddleware(new ResourceMissingError());
            } else {
                documentToDelete.remove(function () {
                    responseObject.send('Operation Successful', 200);
                });
            }
        });
    });
}

// Initiate the web server to accept connections
serverInstance.listen(systemConfig.server.port /* , systemConfig.server.addr */);