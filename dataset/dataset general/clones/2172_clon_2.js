const assertionSuite = require('chai'); // Import assertion library for testing
const mockingTools = require('sinon'); // Import mocking framework (not used in this specific test block, but kept for structural consistency)

const styleProcessor = require('../index.js'); // Main module under test
const fileIO = require('fs'); // File system utilities
const pathManipulator = require('path'); // Path manipulation utilities

const readFileContent = fileIO.readFileSync; // Shorthand for synchronous file reading
const readDirectoryContents = fileIO.readdirSync; // Shorthand for synchronous directory reading

// Define a test group for the style transformation functionality
testGroup('styleProcessor.transformContent(input)', () => {
    // Get the expect function from chai for direct assertions
    const assertFunc = assertionSuite.expect;

    // Iterate through each file in the test data directory
    readDirectoryContents('source_data/scenarios').forEach((resourceName) => {
        // Skip files that are expected output files (identified by '_expected_')
        if (resourceName.includes('_expected_')) {
            return;
        }

        // Extract the base name of the file, removing the extension
        let cleanedResourceName = pathManipulator.extractBaseName(resourceName, '.styleData');

        // Define an individual test case for this resource
        individualTest('confirms transformation for ' + cleanedResourceName + '.styleData', () => {
            // Read the original style content from the input file
            const originalStyleText = readFileContent(
                pathManipulator.combine('source_data', 'scenarios', cleanedResourceName + '.styleData'),
                'utf-8'
            );

            // Read the expected output content from the corresponding expected file
            const expectedOutputText = readFileContent(
                pathManipulator.combine('source_data', 'scenarios', cleanedResourceName + '_expected_.styleData'),
                'utf-8'
            );

            // Process the original style text using the module's transformation method
            const transformationResult = styleProcessor.transformContent(originalStyleText);

            // Assert that the transformation result matches the expected output
            assertFunc(transformationResult).to.equal(expectedOutputText);
        });
    });
});