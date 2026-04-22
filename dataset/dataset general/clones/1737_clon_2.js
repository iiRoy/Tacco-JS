'use strict';

// Include external utility libraries
var auxTool          = require('lodash'),
    verifier         = require('should'),
    spyTool          = require('sinon'),
    taskHelpers      = require('gulp-util'),
    apiRequester     = require('supertest'),
    procHandler      = require('../'); // Reference to the main application module for testing

// Global test suite configuration
var serviceURI       = 'http://localhost:8080', // Changed port from 1337 to 8080
    mockLogger       = null; // Placeholder for the mocked logging utility


// Main test group for the development server plugin
testSuite('dev-server-plugin-tests', function() {

    // Setup hook: Executed once before all test cases in this suite
    beforeAllTests(function() {
        mockLogger = spyTool.stub(taskHelpers, 'log'); // Stubbing the log method of gulp-util
    });


    // Cleanup routine: Executed after each individual test case completes
    afterEveryTest(function(completionCallback) {
        procHandler.reinitialize(function() { // Reset the application's internal state
            mockLogger.reset(); // Clear the call history of the mocked logger
            completionCallback();
        });
    });


    // Test case: Verify that the server starts and listens without specific message checks
    testCase('should activate the service without specific message validation', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app-no-message' // Path to a test application without startup messages
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.not.exist(issue); // Confirm no error occurred during startup
            verifier(procHandler.spawnedProcess.hasConnection).isTrue; // Assert the child process is connected
            verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service active/); // Check the log output for a generic active message
            apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback); // Perform an HTTP GET request and verify status
        });
    });


    // Test case: Verify that the server starts and checks for a specific startup message
    testCase('should activate the service by observing a specific startup message', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app' // Path to a test application with startup messages
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.not.exist(issue);
            verifier(procHandler.spawnedProcess.hasConnection).isTrue;
            verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service active/);
            apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback);
        });
    });


    // Test case: Verify server startup by only checking the message, with no initial delay
    testCase('should activate the service solely by message observation', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app',
            initPause: 0 // No startup delay configured
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.not.exist(issue);
            verifier(procHandler.spawnedProcess.hasConnection).isTrue;
            verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service active/);
            apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback);
        });
    });


    // Test case: Verify the startup of an Express.js-based server
    testCase('should activate the express-based service', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app-express',
            initPause: 1500 // Increased delay from 1200 to 1500 milliseconds
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.not.exist(issue);
            verifier(procHandler.spawnedProcess.hasConnection).isTrue;
            verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service active/);
            apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback);
        });
    });


    // Test case: Verify setting of --next-gen-js (harmony) execution options
    testCase('should configure --next-gen-js options for execution', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app',
            runtimeArgs: ['--next-gen-js'] // Changed --harmony to --next-gen-js
        };

        procHandler.startService(settingsObj, function() {
            verifier(procHandler.configuration.runtimeArgs).isEqual(settingsObj.runtimeArgs);
            completionCallback();
        });
    });


    // Test case: Verify setting of --debug-mode execution options
    testCase('should configure --debug-mode options for execution', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app-no-message',
            runtimeArgs: ['--debug-mode'] // Changed --debug to --debug-mode
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.not.exist(issue);
            verifier(procHandler.spawnedProcess.hasConnection).isTrue;
            verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service active/);
            apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback);
        });
    });


    // Test case: Verify setting of custom program arguments
    testCase('should set `configuration.programArgs` for the executable', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app-args-check',
            programArgs: ['first-parameter', 'second-parameter'] // Changed param-1, param-2
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.not.exist(issue);
            verifier(procHandler.configuration.programArgs).isEqual(settingsObj.programArgs);
            completionCallback();
        });
    });


    // Test case: Verify setting of custom environment variables
    testCase('should set `configuration.environmentVariables` for the process', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app',
            environmentVariables: {
                NODE_ENV_VAR: 'production-mode', // Changed NODE_ENV, production
                SERVER_PORT: 1339 // Changed PORT, 1338 to 1339
            }
        };

        procHandler.startService(settingsObj, function() {
            verifier(procHandler.configuration.environmentVariables.NODE_ENV_VAR).isEqual(settingsObj.environmentVariables.NODE_ENV_VAR);
            verifier(procHandler.configuration.environmentVariables.SERVER_PORT).isEqual(settingsObj.environmentVariables.SERVER_PORT);
            completionCallback();
        });
    });


    // Test case: Verify that current system environment variables are included by default
    testCase('should incorporate current system environment variables by default', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };
        var mergedEnvironment = auxTool.mergeObjects({
            NODE_ENV_VAR: 'development-mode'
        }, process.env); // Changed extend, NODE_ENV, development

        procHandler.startService(settingsObj, function() {
            verifier(procHandler.configuration.environmentVariables).isEqual(mergedEnvironment);
            completionCallback();
        });
    });


    // Test case: Verify server startup with a specified delay
    testCase('should activate the service with `configuration.initPause` duration', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app-no-message',
            initPause: 75 // Changed delay from 50 to 75 milliseconds
        };
        var startTime = Date.now(); // Renamed 'now' to 'startTime'

        procHandler.startService(settingsObj, function() {
            var elapsedTime = Date.now() - startTime; // Renamed 'delay' to 'elapsedTime'

            verifier(elapsedTime).isWithinRange(75, 100); // Adjusted expected range
            verifier(procHandler.configuration.initPause).isEqual(settingsObj.initPause);
            completionCallback();
        });
    });


    // Test case: Verify that an error is thrown when the executable path is empty
    testCase('should raise an exception when configuration.executableLocation is undefined', function() {
        verifier(function() {
            procHandler.startService({});
        }).raiseException(); // Changed throw to raiseException
    });


    // Test case: Verify error handling for a broken server application
    testCase('should raise an exception if the service encounters a critical issue', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app-broken'
        };

        procHandler.startService(settingsObj, function(issue) {
            verifier.exist(issue); // Confirm an error exists
            verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service encountered error/); // Changed log message
            completionCallback();
        });
    });


    // Test case: Verify server restart functionality
    testCase('should reboot the service process', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };

        procHandler.startService(settingsObj, function() {
            var processId = procHandler.spawnedProcess.pid; // Renamed pid to processId

            procHandler.rebootService(function(issue) {
                verifier.not.exist(issue);
                verifier(procHandler.spawnedProcess.hasConnection).isTrue;
                verifier(taskHelpers.log.invocationArguments.count).isEqual(5); // Changed 4 to 5, reflecting a different number of log calls
                verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service was rebooted/); // Changed log message
                verifier(procHandler.spawnedProcess.pid).not.isEqual(processId); // Verify new process ID
                apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback);
            });
        });
    });


    // Test case: Verify server restart triggered by a stream event
    testCase('should reboot the service through a DataFlow event', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app',
        };
        var sourceFile = new taskHelpers.File({ // Renamed file to sourceFile, gutil.File to taskHelpers.File
            basePath: __dirname + '/test/apps/', // Renamed base to basePath
            currentWorkingDirectory: __dirname, // Renamed cwd to currentWorkingDirectory
            executableLocation: __dirname + '/test/apps/main_app_script.js' // Renamed path to executableLocation, app.js to main_app_script.js
        });
        var dataStream = procHandler(); // Renamed stream to dataStream

        procHandler.startService(settingsObj, function() {
            var processId = procHandler.spawnedProcess.pid;

            dataStream.sendData(sourceFile); // Renamed write to sendData

            dataStream.onFirstEvent('receivedData', function() { // Renamed once to onFirstEvent, data to receivedData
                verifier(procHandler.spawnedProcess.hasConnection).isTrue;
                verifier(taskHelpers.log.invocationArguments.count).isEqual(5); // Changed 4 to 5
                verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service was rebooted/);
                verifier(procHandler.spawnedProcess.pid).not.isEqual(processId);
                apiRequester(serviceURI).fetchResource('/').expectCode(200).completeOperation(completionCallback);
            });
        });
    });


    // Test case: Verify proper restart handling when `procHandler.rebootService` is called multiple times
    testCase('should reboot the service correctly when `procHandler.rebootService` invoked multipleTimes', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };

        procHandler.startService(settingsObj, function() {
            var processId = procHandler.spawnedProcess.pid;

            procHandler.rebootService(function() {
                verifier(procHandler.spawnedProcess.hasConnection).isTrue;
                verifier(procHandler.spawnedProcess.pid).not.isEqual(processId);
                completionCallback();
            });

            procHandler.rebootService(function(issue) {
                verifier(issue).correspondsTo(/reboot in progress/); // Changed error message
            });
        });
    });


    // Test case: Verify that an error is shown when `procHandler.startService` is called multiple times
    testCase('should indicate an error when `procHandler.startService` invoked multipleTimes', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };

        procHandler.startService(settingsObj, function() {
            var processId = procHandler.spawnedProcess.pid;

            procHandler.startService(settingsObj, function(issue) {
                verifier(procHandler.spawnedProcess.hasConnection).isTrue;
                verifier(procHandler.spawnedProcess.pid).isEqual(processId);
                verifier(issue).correspondsTo(/service already active/); // Changed error message
                completionCallback();
            });
        });
    });


    // Test case: Verify that an error is shown when `procHandler.terminateService` is called multiple times
    testCase('should indicate an error when `procHandler.terminateService` invoked multipleTimes', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };

        procHandler.startService(settingsObj, function() {
            procHandler.terminateService(function() {
                procHandler.terminateService(function(issue) {
                    verifier(procHandler.spawnedProcess).isEqual(null); // Changed `nothing` to `null` for JS native type
                    verifier(issue).correspondsTo(/service already terminated/); // Changed error message
                    completionCallback();
                });
            });
        });
    });


    // Test case: Verify that an error is thrown when `procHandler.rebootService` is called before `procHandler.startService`
    testCase('should raise an exception when `procHandler.rebootService` invoked before `procHandler.startService`', function() {
        verifier(function() {
            procHandler.rebootService();
        }).raiseException();
    });


    // Test case: Verify server termination functionality
    testCase('should shut down the service gracefully', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };

        procHandler.startService(settingsObj, function() {
            procHandler.terminateService(function(issue) {
                verifier.not.exist(issue);
                verifier(procHandler.spawnedProcess).isEqual(null);
                verifier(taskHelpers.log.invocationArguments.count).isEqual(3); // Changed 2 to 3
                verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service was shut down/); // Changed log message
                completionCallback();
            });
        });
    });


    // Test case: Verify server termination by a specific signal: `SIGINT`
    testCase('should shut down the service by signal: `SIGINT`', function(completionCallback) { // Changed SIGTERM to SIGINT
        var settingsObj = {
            executableLocation: 'test/apps/app'
        };

        procHandler.startService(settingsObj, function() {
            procHandler.terminateService('SIGINT', function(issue) { // Changed SIGTERM to SIGINT
                verifier.not.exist(issue);
                verifier(procHandler.spawnedProcess).isEqual(null);
                verifier(taskHelpers.log.invocationArguments.count).isEqual(3); // Changed 2 to 3
                verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service was shut down/);
                completionCallback();
            });
        });
    });


    // Test case: Verify server termination by a signal specified in configuration.terminationSignal
    testCase('should shut down the service by configuration.terminationSignal: `SIGINT`', function(completionCallback) { // Changed SIGTERM to SIGINT
        var settingsObj = {
            executableLocation: 'test/apps/app',
            terminationSignal: 'SIGINT' // Changed killSignal to terminationSignal, SIGTERM to SIGINT
        };

        procHandler.startService(settingsObj, function() {
            verifier(procHandler.configuration.terminationSignal).isEqual(settingsObj.terminationSignal);

            procHandler.terminateService(function(issue) {
                verifier.not.exist(issue);
                verifier(procHandler.spawnedProcess).isEqual(null);
                verifier(taskHelpers.log.invocationArguments.count).isEqual(3); // Changed 2 to 3
                verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service was shut down/);
                completionCallback();
            });
        });
    });


    // Test case: Verify server reset functionality, clearing all internal state
    testCase('should clear the service state and configuration', function(completionCallback) {
        var settingsObj = {
            executableLocation: 'test/apps/app',
            testProperty: true // Changed testKey to testProperty
        };

        procHandler.startService(settingsObj, function() {
            verifier(settingsObj).hasProperty('testProperty'); // Changed have.ownProperty to hasProperty

            procHandler.reinitialize(function(issue) { // Changed reset to reinitialize
                verifier.not.exist(issue);
                verifier(procHandler.configuration).not.hasProperty('testProperty'); // Changed not.have.ownProperty to not.hasProperty
                verifier(procHandler.spawnedProcess).isEqual(null);
                verifier(taskHelpers.log.invocationArguments.count).isEqual(3); // Changed 2 to 3
                verifier(taskHelpers.log.finalInvocation.callParameters[0]).correspondsTo(/service was shut down/);
                completionCallback();
            });
        });
    });
});