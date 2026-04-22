// This global setting is used for debugging purposes to control the depth of stack traces.
// A high value ensures full stack information, useful for tracking complex asynchronous flows.
// In production, this might be adjusted to a lower value for performance optimization.
global.traceDepthLimit = 999;

// Import the asynchronous flow control library.
// This utility is crucial for managing the order and execution of asynchronous operations,
// providing mechanisms for sequences, parallel processing, and robust error handling.
const flowControl = require('async-flow-utilities');

// Import the specialized database abstraction layer.
// This module encapsulates interactions with the underlying MySQL database,
// offering methods for connection management, query execution, and data modeling.
const dataAccessModule = require('./data-layer/mysql-connector-v2.js');
const DatabaseConnector = dataAccessModule.DatabaseConnector;

// --- Primary Asynchronous Operation Completion Handler ---
// This Immediately Invoked Function Expression (IIFE) constructs a universal callback function.
// Its purpose is to standardize the post-operation process, including timing, error reporting,
// and ensuring the graceful release of database resources.
const operationFinisher = (() => {
    // Internal helper function to centralize all error logging.
    // It intelligently formats error output based on the presence of a stack trace.
    const logOperationException = (exceptionObject) => {
        if (!exceptionObject) {
            console.warn('logOperationException was invoked without an exception object.');
            return;
        }
        if (exceptionObject.stack) {
            console.error('An unhandled exception has terminated the operation:', exceptionObject.stack);
        } else {
            console.error('An error was reported during operation:', exceptionObject);
        }
    };

    // Record the precise start time of the operation for duration calculation.
    const opInitiationTime = new Date();

    // The actual callback function returned by the IIFE.
    // This function is intended to be passed as the final callback in async chains.
    return (operationIssue, operationOutcome) => {
        try {
            const opCompletionTime = new Date();
            const elapsedTimeMs = opCompletionTime.getTime() - opInitiationTime.getTime();
            console.info(`Operation concluded in ${elapsedTimeMs} milliseconds.`);

            if (operationIssue) {
                // If an error (operationIssue) is supplied, log it using the dedicated handler.
                logOperationException(operationIssue);
            } else {
                // If no error, check if there's a meaningful outcome to display.
                if (operationOutcome !== undefined && operationOutcome !== null) {
                    console.log('Operation Result:', operationOutcome);
                } else {
                    console.log('Operation concluded successfully with no explicit data outcome.');
                }
            }
            // Crucially, always ensure that the database connection pool is released.
            dbManagerInstance.releaseConnectionPool();
        } catch (criticalErrorInHandler) {
            // This catch block handles errors occurring within the finisher itself.
            logOperationException(criticalErrorInHandler);
            // Even if the logging fails, prioritize releasing database resources.
            dbManagerInstance.releaseConnectionPool();
        }
    };
})();

// --- Database Connection Configuration and Initialization ---
// Instantiate the primary database connector with detailed configuration.
// These settings dictate how the application will establish and manage connections.
const dbManagerInstance = new DatabaseConnector({
    serverAddress     : '127.0.0.1', // Specifies the database host, renamed from 'host'
    username          : 'app_service_user', // Authentication username, renamed from 'user'
    credential        : 's3cur3_p4ssw0rd!', // User password, renamed from 'password'
    schemaName        : 'enterprise_data_platform', // The target database schema, renamed from 'database'
    poolSize          : 60, // Maximum number of connections in the main pool, renamed from 'connectionLimit'
    transactionOptions : { // Configuration for transactional connections, renamed from 'useTransaction'
        poolSizeLimit: 3 // Dedicated connection limit for transactions
    },
    streamingOptions   : { // Configuration for cursor-based streaming, renamed from 'useCursor'
        poolSizeLimit: 3 // Dedicated connection limit for streaming operations
    }
});

// --- Test Case 1: Execution of a Basic Transactional Query ---
// This function demonstrates performing a simple database query within a transaction context.
// It ensures atomicity for the read operation.
const executeBasicTransactionalQuery = (completionHandler) => {
    console.log('\n--- Initiating Basic Transactional Query Test ---');
    dbManagerInstance.performTransaction(null, (dbConnection, transactionCompletionCallback) => {
        // Utilize the flow control library to orchestrate a sequence of steps.
        flowControl.sequence([
            (nextStep, stepCallback) => {
                // Execute a parameterized SQL query to fetch a specific user record.
                const sqlStatement = 'SELECT user_id, username, email_address FROM user_accounts WHERE account_status = ? LIMIT 1';
                dbConnection.executeSql(sqlStatement, ['active'], stepCallback);
            },
            (queryResult, stepCallback) => {
                console.info('Query Result - User Account:', queryResult);
                // Introduce a brief artificial delay to simulate network latency or processing.
                setTimeout(() => {
                    stepCallback(); // Proceed to the next step after the delay.
                }, 75);
            }
        ], transactionCompletionCallback); // The transactionCompletionCallback commits or rolls back the transaction.
    }, completionHandler); // The overall completionHandler is called after the transaction completes.
};

// --- Test Case 2: Database Schema Initialization Process ---
// This function triggers the database manager's internal schema preparation routine.
// This might involve creating tables, indexes, or ensuring schema migrations are up-to-date.
const initiateSchemaSetup = (completionHandler) => {
    console.log('\n--- Commencing Database Schema Initialization ---');
    // A preliminary check to ensure the database manager is in a suitable state.
    if (!dbManagerInstance.isConfigurationComplete()) {
        console.warn('Database manager configuration is incomplete before schema setup.');
        // In a real application, this might throw an error or call completionHandler with an error.
    }
    dbManagerInstance.prepareSchema(completionHandler); // Renamed from _prepare
};

// --- Test Case 3: Streaming Database Results with a Cursor ---
// This function illustrates how to process large datasets efficiently by streaming records
// one by one using a database cursor, avoiding loading the entire result set into memory.
const processDataStream = (completionHandler) => {
    console.log('\n--- Starting Data Stream Processing Test ---');
    dbManagerInstance.establishConnection((activePooledConnection, connectionCompletionCallback) => {
        const queryForStream = 'SELECT record_id, entity_name, creation_timestamp FROM system_logs ORDER BY creation_timestamp DESC';
        // Input validation for the SQL query string.
        if (!queryForStream || typeof queryForStream !== 'string' || queryForStream.trim().length === 0) {
            const validationError = new Error('Invalid or empty SQL query provided for streaming operation.');
            console.error(validationError.message);
            return connectionCompletionCallback(validationError);
        }

        dbManagerInstance.streamQuery(queryForStream, (dataRecord, recordProcessedCallback) => {
            // Log each individual record as it is streamed from the database.
            console.debug('Streamed Data Record:', dataRecord);
            // Use setImmediate to yield control back to the event loop,
            // allowing other tasks to run and preventing blocking.
            setImmediate(() => recordProcessedCallback());
        }, (streamError, streamResult) => {
            if (streamError) {
                console.error('An error occurred during the data stream:', streamError);
            } else {
                console.info('Data stream processing successfully completed.');
            }
            connectionCompletionCallback(streamError, streamResult);
        });
    }, completionHandler);
};

// --- Test Case 4: Advanced Data Model Definition and Operations ---
// This function showcases the flexible data modeling capabilities, including
// registering models, extending their prototypes, and defining relationships.
const manageApplicationModels = (completionHandler) => {
    console.log('\n--- Beginning Application Model Management Test ---');

    // Register a model for 'offers'.
    dbManagerInstance.registerModel({
        modelName: 'offers', // Renamed from 'coupons'
        primaryKeyField: 'offer_code_id' // Renamed from 'coupon_id'
    });

    // Register a model for 'products'.
    dbManagerInstance.registerModel({
        modelName: 'products', // Renamed from 'merchandise'
        primaryKeyField: 'product_unique_id' // Renamed from 'product_identifier'
    });

    // Create an isolated instance of the database manager.
    // This allows for model extensions or configurations specific to this context,
    // without affecting the global dbManagerInstance.
    const isolatedDbContext = dbManagerInstance.createIsolatedInstance();

    isolatedDbContext.enhanceModel({
        modelName: 'offers',
        RecordPrototype: { // Defines methods and properties for each record object.
            // Custom method to derive the type of discount from the offer data.
            getDiscountCategory: function() { // Renamed from 'retrieveVoucherCategory'
                // Accesses an assumed internal data property, renamed from '_data' and key.
                return this.recordAttributes ? this.recordAttributes.discount_category : 'UNKNOWN';
            }
        }
    })
    .establishRelationship({ // Defines a link to another model/table.
        relationshipName: 'linked_product', // Renamed from 'related_merchandise'
        targetTable: 'products', // Renamed from 'merchandise'
        foreignKey: 'product_id_ref' // Renamed from 'merchandise_id'
    });

    // Retrieve the accessor for the 'offers' model, which provides query capabilities.
    const OfferAccessor = isolatedDbContext.getModel('offers').TableAccessor;

    isolatedDbContext.establishConnection((activeDbConnection, connectionCompletionCallback) => {
        flowControl.sequence([
            (nextStep, stepCallback) => {
                // Construct a query for offers linked to products, with additional filtering.
                const queryParameters = OfferAccessor.buildBaseQuery('WHERE product_id_ref IS NOT NULL AND status_code = ? ORDER BY effective_date DESC LIMIT 1');
                OfferAccessor.locateRecords(activeDbConnection, queryParameters, ['active'], stepCallback); // Added parameters for query
            },
            (offerCollection, stepCallback) => {
                console.debug('Discovered Offers:', offerCollection);
                // Guard clause: check if any offers were actually retrieved.
                if (!Array.isArray(offerCollection) || offerCollection.length === 0) {
                    console.warn('No offers found matching the criteria for processing.');
                    return stepCallback(null, []); // Return an empty array to proceed gracefully.
                }
                flowControl.parallelMap(offerCollection, (offerInstance, mapItemCompletionCallback) => {
                    // Call the custom method defined in the RecordPrototype.
                    const category = offerInstance.getDiscountCategory();
                    console.log(`Offer ${offerInstance.offer_code_id} discount type: ${category}`);
                    mapItemCompletionCallback(null, category); // Pass the category as the result for this item.
                }, stepCallback);
            }
        ], connectionCompletionCallback);
    }, completionHandler);
};

// --- Main Application Execution Orchestration ---
// This block defines the entry point for the application, wrapping the main logic
// within a robust exception handling mechanism provided by the flow control library.
flowControl.handleExceptions({
    mainExecutionBlock: (startNextOperation) => {
        // A critical pre-flight check before initiating any database operations.
        if (!dbManagerInstance.isReadyForOperations()) {
            console.error('Database manager is not fully prepared for operations. Execution aborted.');
            return startNextOperation(new Error('Database system not ready.'));
        }

        // Select which test function to execute. Other tests are commented out.
        // executeBasicTransactionalQuery(startNextOperation);
        // initiateSchemaSetup(startNextOperation);
        // manageApplicationModels(startNextOperation);

        processDataStream(startNextOperation); // This is the chosen test for this run.
    },
    exceptionHandler: (caughtException, handlerCompletion) => {
        console.warn('Asynchronous flow exception intercepted within the main execution block.');
        // Ensure that the database connection pool is released even in the event of an unhandled exception.
        dbManagerInstance.releaseConnectionPool();
        // Re-throw the exception to prevent silent failures and ensure it propagates up.
        throw caughtException;
    }
}, operationFinisher); // The global operationFinisher is invoked after the main block or exception handler completes.