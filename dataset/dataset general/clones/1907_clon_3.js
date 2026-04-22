const fileSystemOperations = require('fs');
const pathUtilities = require('path');
const compression = require('compression'); // New dependency for gzip
const express = require('express');
const mongoose = require('mongoose');

// --- Initial setup and dependency loading ---

// No longer using require.paths, as it's an outdated Node.js feature.
// Modern module resolution or NODE_PATH environment variable is preferred.

// Establish the primary application instance
const mainApplicationInstance = express();
module.exports.webApplication = mainApplicationInstance; // Exporting the app instance

// --- Core application configuration ---

// Define the root directory for relative path calculations
const applicationBaseDirectory = __dirname;

// Helper function to get file extension
const retrieveFileExtension = (fullPath) => pathUtilities.extname(fullPath);

// Middleware for parsing request bodies
mainApplicationInstance.use(express.json()); // Parses JSON payload
mainApplicationInstance.use(express.urlencoded({ extended: true })); // Parses URL-encoded payload

// Enable HTTP compression for all responses
mainApplicationInstance.use(compression());

// Enable conditional GET requests for caching optimization
mainApplicationInstance.use(express.conditionalGet());

// Allow HTTP method override (e.g., using _method query parameter)
mainApplicationInstance.use(express.methodOverride());

// Serve static assets from a designated folder
const staticAssetsPath = pathUtilities.join(applicationBaseDirectory, 'public_assets');
mainApplicationInstance.use(express.static(staticAssetsPath));

// Set view engine and views directory
mainApplicationInstance.set('view engine', 'ejs'); // Using EJS as an example view engine
mainApplicationInstance.set('views', pathUtilities.join(applicationBaseDirectory, 'views_templates'));

// Simple custom request logger middleware
mainApplicationInstance.use((request, response, nextMiddleware) => {
  console.log(`[${new Date().toISOString()}] Incoming request: ${request.method} ${request.url}`);
  nextMiddleware();
});

// --- Configuration file management ---

/**
 * Loads and parses a JSON configuration file.
 * @param {string} configFilePath - The absolute path to the configuration file.
 * @returns {object} The parsed configuration object.
 * @throws {Error} If the file is not found or is invalid JSON.
 */
const loadApplicationConfiguration = (configFilePath) => {
  try {
    const rawConfigFileContent = fileSystemOperations.readFileSync(configFilePath, 'utf8');
    const parsedConfiguration = JSON.parse(rawConfigFileContent);
    console.log(`Configuration loaded successfully from: ${configFilePath}`);
    return parsedConfiguration;
  } catch (errorDetails) {
    if (errorDetails.code === 'ENOENT') {
      throw new Error(`Critical: Configuration file not found at '${configFilePath}'. Please ensure 'app_settings.json' exists. Consider copying 'app_settings.json.sample'.`);
    }
    throw new Error(`Failed to parse configuration file '${configFilePath}': ${errorDetails.message}`);
  }
};

// Attempt to load application settings
let globalApplicationSettings = null;
try {
  const settingsFilePath = pathUtilities.join(applicationBaseDirectory, 'app_settings.json');
  globalApplicationSettings = loadApplicationConfiguration(settingsFilePath);
  module.exports.appConfig = globalApplicationSettings; // Export for external access
} catch (configError) {
  console.error("Application startup failed due to configuration issues:");
  throw configError; // Re-throw to halt execution
}

// --- Conditional middleware based on settings ---

// Enable detailed error handling in debug mode
if (globalApplicationSettings.applicationModes.enableDebuggingMode) {
  mainApplicationInstance.use(express.errorHandler({
    showStack: true, // Display stack traces
    dumpExceptions: true // Dump exception objects
  }));
  console.warn("Application is running in DEBUG mode. Stack traces and exceptions will be dumped.");
}

// --- Custom Error Definitions ---

/**
 * Custom error class for resource not found scenarios (HTTP 404).
 * @extends Error
 */
class ResourceNotFoundException extends Error {
  constructor(message = 'The requested resource could not be located.') {
    super(message);
    this.name = 'ResourceNotFoundException';
    this.statusCode = 404; // Standard HTTP status code for Not Found
    // Capture stack trace for better debugging in modern JS
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResourceNotFoundException);
    }
  }
}
module.exports.resourceNotFound = ResourceNotFoundException; // Export custom error

// --- Global Error Handling Middleware ---

// Generic error handler for known custom exceptions (e.g., ResourceNotFoundException)
mainApplicationInstance.use((errorObject, request, response, nextMiddleware) => {
  if (errorObject instanceof ResourceNotFoundException) {
    console.warn(`404 Not Found: ${request.originalUrl} - ${errorObject.message}`);
    response.status(errorObject.statusCode).send(`<h1>${errorObject.statusCode} - Resource Not Found</h1><p>${errorObject.message}</p>`);
  } else {
    // Pass to the next error handler for other types of errors
    nextMiddleware(errorObject);
  }
});

// Final error handler for all other unhandled exceptions (HTTP 500)
mainApplicationInstance.use((errorObject, request, response, nextMiddleware) => {
  console.error(`Unhandled Server Error (500) on ${request.originalUrl}:`, errorObject);
  response.status(500).send(`<h1>500 - Internal Server Error</h1><p>An unexpected error occurred on the server. Please try again later.</p>`);
});


// --- Database Connection ---

const databaseConnectionDetails = globalApplicationSettings.databaseSettings.mongo;
const mongoDbUri = `mongodb://${databaseConnectionDetails.host}:${databaseConnectionDetails.port}/${databaseConnectionDetails.databaseName}`;

// Mongoose connection options (example)
const mongooseConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Establish MongoDB connection
mongoose.connect(mongoDbUri, mongooseConnectionOptions)
  .then(() => {
    console.log(`Successfully connected to MongoDB at: ${mongoDbUri}`);
    module.exports.dbConnector = mongoose.connection; // Export the connection object
  })
  .catch(connectionError => {
    console.error(`Failed to connect to MongoDB at ${mongoDbUri}:`, connectionError.message);
    // Optionally, exit the process if DB connection is critical for app functionality
    // process.exit(1);
  });

// --- Dynamic Module Loading Utility ---

/**
 * Dynamically loads JavaScript modules from a specified directory.
 * Only loads files with a '.js' extension.
 * @param {string} directoryPath - The path to the directory containing modules.
 */
const dynamicModuleLoader = (directoryPath) => {
  if (!fileSystemOperations.existsSync(directoryPath)) {
    console.warn(`Skipping module loading for non-existent directory: ${directoryPath}`);
    return;
  }

  fileSystemOperations.readdir(directoryPath, (readError, fileNames) => {
    if (readError) {
      console.error(`Error reading directory '${directoryPath}':`, readError.message);
      return;
    }

    fileNames.forEach((currentFileName) => {
      const fileExtension = retrieveFileExtension(currentFileName);
      if (fileExtension === '.js') {
        const moduleName = currentFileName.replace(fileExtension, '');
        const moduleFullPath = pathUtilities.join(directoryPath, moduleName);
        try {
          require(moduleFullPath);
          console.log(`Loaded module: ${moduleFullPath}`);
        } catch (loadError) {
          console.error(`Failed to load module '${moduleFullPath}':`, loadError.message);
        }
      }
    });
  });
};

// --- Load Application Components (Models, Controllers) ---

// Load Mongoose models from configured paths
const modelLoadingPaths = globalApplicationSettings.moduleLoadingPaths.models;
if (Array.isArray(modelLoadingPaths)) {
  modelLoadingPaths.forEach(pathSegment => {
    const fullPath = pathUtilities.join(applicationBaseDirectory, pathSegment);
    dynamicModuleLoader(fullPath);
  });
} else {
  console.warn("No model loading paths configured or invalid format.");
}


// Load Express controllers from configured paths
const controllerLoadingPaths = globalApplicationSettings.moduleLoadingPaths.controllers;
if (Array.isArray(controllerLoadingPaths)) {
  controllerLoadingPaths.forEach(pathSegment => {
    const fullPath = pathUtilities.join(applicationBaseDirectory, pathSegment);
    dynamicModuleLoader(fullPath);
  });
} else {
  console.warn("No controller loading paths configured or invalid format.");
}


// --- Default CRUD API Endpoints (if enabled) ---

if (globalApplicationSettings.apiEndpoints.enableDefaultCrudEndpoints) {
  console.log("Default CRUD API endpoints are enabled.");

  /**
   * Retrieves a Mongoose model by its name.
   * Throws ResourceNotFoundException if the model does not exist.
   * @param {string} modelName - The name of the model.
   * @returns {mongoose.Model} The Mongoose model instance.
   */
  const getMongooseModel = (modelName) => {
    try {
      const model = mongoose.model(modelName);
      if (!model) { // mongoose.model() might return undefined if not registered
        throw new ResourceNotFoundException(`Data collection '${modelName}' not found.`);
      }
      return model;
    } catch (e) {
      // Mongoose throws if model is not registered, so catch and re-throw as custom error
      if (e.name === 'MissingSchemaError') {
        throw new ResourceNotFoundException(`Data collection '${modelName}' schema not registered.`);
      }
      throw e; // Re-throw other errors
    }
  };

  // --- API Endpoint: Retrieve Multiple Resources (FIND) ---
  mainApplicationInstance.get('/:collectionName', async (request, response, nextMiddleware) => {
    try {
      const targetCollection = getMongooseModel(request.params.collectionName);
      let queryBuilder = targetCollection.find();

      // Apply query filters if provided
      if (request.query.filter) {
        try {
          const parsedFilter = JSON.parse(request.query.filter);
          queryBuilder = queryBuilder.where(parsedFilter);
        } catch (parseError) {
          return response.status(400).json({ error: 'Invalid filter query parameter.', details: parseError.message });
        }
      }

      // Apply sorting if provided
      if (request.query.sort) {
        try {
          const parsedSort = JSON.parse(request.query.sort);
          // Assuming sort format like: { "fieldName": 1 } or { "fieldName": -1 }
          queryBuilder = queryBuilder.sort(parsedSort);
        } catch (parseError) {
          return response.status(400).json({ error: 'Invalid sort query parameter.', details: parseError.message });
        }
      }

      // Apply limit for pagination
      const recordsLimit = parseInt(request.query.limit, 10);
      if (!isNaN(recordsLimit) && recordsLimit > 0) {
        queryBuilder = queryBuilder.limit(recordsLimit);
      } else if (request.query.limit) {
        return response.status(400).json({ error: 'Invalid "limit" parameter. Must be a positive integer.' });
      }

      // Apply offset for pagination
      const recordsOffset = parseInt(request.query.offset, 10);
      if (!isNaN(recordsOffset) && recordsOffset >= 0) {
        queryBuilder = queryBuilder.skip(recordsOffset);
      } else if (request.query.offset) {
        return response.status(400).json({ error: 'Invalid "offset" parameter. Must be a non-negative integer.' });
      }

      const retrievedDocuments = await queryBuilder.exec();

      if (!retrievedDocuments || retrievedDocuments.length === 0) {
        return response.status(200).json([]); // Return empty array for no results
      }

      // Convert Mongoose documents to plain JavaScript objects
      const plainObjects = retrievedDocuments.map(doc => doc.toObject({ getters: true, virtuals: true }));
      response.status(200).json(plainObjects);

    } catch (errorDetails) {
      nextMiddleware(errorDetails); // Pass to error handling middleware
    }
  });

  // --- API Endpoint: Retrieve Single Resource by ID (READ) ---
  mainApplicationInstance.get('/:collectionName/:resourceIdentifier', async (request, response, nextMiddleware) => {
    try {
      const targetCollection = getMongooseModel(request.params.collectionName);
      const resourceId = request.params.resourceIdentifier;

      // Basic ID validation (e.g., Mongoose ObjectId format)
      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return response.status(400).json({ error: 'Invalid resource identifier format.' });
      }

      const foundDocument = await targetCollection.findById(resourceId).exec();

      if (!foundDocument) {
        throw new ResourceNotFoundException(`Resource with ID '${resourceId}' not found in collection '${request.params.collectionName}'.`);
      }

      response.status(200).json(foundDocument.toObject({ getters: true, virtuals: true }));

    } catch (errorDetails) {
      nextMiddleware(errorDetails);
    }
  });

  // --- API Endpoint: Create New Resource (CREATE) ---
  const handleResourceCreation = async (request, response, nextMiddleware) => {
    try {
      const targetCollection = getMongooseModel(request.params.collectionName);
      const incomingResourceData = request.body;

      if (!incomingResourceData || Object.keys(incomingResourceData).length === 0) {
        return response.status(400).json({ error: 'Request body cannot be empty for resource creation.' });
      }

      const newResourceInstance = new targetCollection(incomingResourceData);

      // Mongoose automatically validates on save, but we can pre-validate
      const validationError = newResourceInstance.validateSync();
      if (validationError) {
        return response.status(422).json({ error: 'Validation failed for new resource.', details: validationError.errors });
      }

      const savedResource = await newResourceInstance.save();
      response.status(201).json(savedResource.toObject({ getters: true, virtuals: true }));

    } catch (errorDetails) {
      // Mongoose unique index errors or other save errors
      if (errorDetails.name === 'MongoError' && errorDetails.code === 11000) {
        return response.status(409).json({ error: 'Duplicate key error.', details: errorDetails.message });
      }
      nextMiddleware(errorDetails);
    }
  };

  mainApplicationInstance.put('/:collectionName', handleResourceCreation);
  mainApplicationInstance.post('/:collectionName', handleResourceCreation);


  // --- API Endpoint: Update Existing Resource (MODIFY) ---
  const handleResourceUpdate = async (request, response, nextMiddleware) => {
    try {
      const targetCollection = getMongooseModel(request.params.collectionName);
      const resourceId = request.params.resourceIdentifier;
      const updatePayload = request.body;

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return response.status(400).json({ error: 'Invalid resource identifier format.' });
      }

      if (!updatePayload || Object.keys(updatePayload).length === 0) {
        return response.status(400).json({ error: 'Request body cannot be empty for resource update.' });
      }

      // Find by ID and update directly, returning the modified document
      const updatedDocument = await targetCollection.findByIdAndUpdate(
        resourceId,
        updatePayload,
        { new: true, runValidators: true } // Return the updated document, run schema validators
      ).exec();

      if (!updatedDocument) {
        throw new ResourceNotFoundException(`Resource with ID '${resourceId}' not found for update.`);
      }

      response.status(200).json(updatedDocument.toObject({ getters: true, virtuals: true }));

    } catch (errorDetails) {
      if (errorDetails.name === 'ValidationError') {
        return response.status(422).json({ error: 'Validation failed for resource update.', details: errorDetails.errors });
      }
      nextMiddleware(errorDetails);
    }
  };

  mainApplicationInstance.put('/:collectionName/:resourceIdentifier', handleResourceUpdate);
  mainApplicationInstance.post('/:collectionName/:resourceIdentifier', handleResourceUpdate); // POST for update is also common


  // --- API Endpoint: Delete Resource (REMOVE) ---
  mainApplicationInstance.delete('/:collectionName/:resourceIdentifier', async (request, response, nextMiddleware) => {
    try {
      const targetCollection = getMongooseModel(request.params.collectionName);
      const resourceId = request.params.resourceIdentifier;

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return response.status(400).json({ error: 'Invalid resource identifier format.' });
      }

      const deletedResult = await targetCollection.findByIdAndDelete(resourceId).exec();

      if (!deletedResult) {
        throw new ResourceNotFoundException(`Resource with ID '${resourceId}' not found for deletion.`);
      }

      // 204 No Content is standard for successful DELETE with no response body
      response.status(204).send();

    } catch (errorDetails) {
      nextMiddleware(errorDetails);
    }
  });
} else {
  console.log("Default CRUD API endpoints are disabled by configuration.");
}


// --- Start the Web Server ---

const serverListeningPort = globalApplicationSettings.network.port;
const serverListeningAddress = globalApplicationSettings.network.address || '0.0.0.0'; // Default to all interfaces

// Ensure port is a valid number
if (typeof serverListeningPort !== 'number' || serverListeningPort <= 0) {
  console.error(`Invalid server port configured: ${serverListeningPort}. Please check app_settings.json.`);
  process.exit(1);
}

mainApplicationInstance.listen(serverListeningPort, serverListeningAddress, () => {
  console.log(`Web server successfully initialized and listening on http://${serverListeningAddress}:${serverListeningPort}`);
  console.log('Press Ctrl+C to terminate the server.');
}).on('error', (serverError) => {
  if (serverError.code === 'EADDRINUSE') {
    console.error(`Error: Port ${serverListeningPort} is already in use. Please choose a different port or stop the other process.`);
  } else {
    console.error(`Server failed to start due to an unexpected error:`, serverError.message);
  }
  process.exit(1);
});