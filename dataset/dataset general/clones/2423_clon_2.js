'use strict'; /* Enforce strict JavaScript parsing rules for cleaner code. */

// Dependencies required for testing and file system operations.
var verifier         =  require('assert')  ;
var pledges          =  require('vows')    ;
var diskIO           =  require('fs')      ;
var ultimateDiskIO   =  require('final-fs');

// Our custom code generation utility.
var CodeBuilder      =  require('../lib/codegen').CodeGen;

// Initialize a collection for our test cases.
var testCollection = {};

// Read all API definition files from the specified directory.
var apiFilesList = ultimateDiskIO.readdirSync('tests/apis');

// Iterate through each API file to create individual test cases.
apiFilesList.forEach(  function  (  currentApiFile  )   {

    // Construct the full path to the current API definition file.
    var fullPathToApi = 'tests/apis/' + currentApiFile;

    // Define a new test case within the collection, using the file path as key.
    testCollection[fullPathToApi] = function ()   {

        // Parse the API definition from the file content.
        var apiDefinition = JSON.parse(diskIO.readFileSync(fullPathToApi, 'UTF-8'));

        // First, generate Node.js specific code.
        var generationResult = CodeBuilder.produceNodeJSCode({
            serviceIdentifier: 'Test', // A generic identifier for the service.
            apiDefinition: apiDefinition
        });
        // Assert that the generated output is a string.
        verifier(typeof(generationResult), 'string');

        // Next, generate Angular specific client code.
        generationResult = CodeBuilder.produceAngularCode({
            clientModule: 'Test',     // Module name for the Angular application.
            serviceIdentifier: 'Test', // Class name for the Angular service.
            apiDefinition: apiDefinition
        });
        // Verify the Angular code generation also produces a string.
        verifier(typeof(generationResult), 'string');

        // Finally, generate code using custom templates.
        generationResult = CodeBuilder.produceCustomCode({
            clientModule: 'Test',       // Custom module name for the output.
            serviceIdentifier: 'Test',   // Custom class name.
            apiDefinition: apiDefinition,
            templateSet: { // Define paths to custom template files.
                classBlueprint: diskIO.readFileSync(__dirname + '/../templates/angular-class.mustache', 'utf-8'),
                methodBlueprint: diskIO.readFileSync(__dirname + '/../templates/method.mustache', 'utf-8'),
                requestBlueprint: diskIO.readFileSync(__dirname + '/../templates/angular-request.mustache', 'utf-8')
            }
        });
        // Confirm the custom code generation also yields a string.
        verifier(typeof(generationResult), 'string');
    }; // End of test case function definition.
}  ); // End of apiFilesList.forEach loop.

// Use the pledges framework to define and run the tests.
pledges
    .evaluate('API Code Generation Validation') // Describe the overall test suite.
    .appendCollection(testCollection)           // Add all generated test cases.
    .publish(module);                           // Export the test suite for execution.