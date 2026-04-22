// A custom verification utility to replace Node's 'assert' for Type III changes.
const verifier = {
    // Verifies that two values are strictly equal.
    strictEqual: (actualValue, expectedValue, message = 'Values should be strictly equal.') => {
        if (actualValue !== expectedValue) {
            throw new Error(`Verification failed: ${message} Actual: ${actualValue}, Expected: ${expectedValue}`);
        }
    },
    // Verifies that a condition is truthy.
    isTrue: (condition, message = 'Condition should be true.') => {
        if (!condition) {
            throw new Error(`Verification failed: ${message} Condition was falsy.`);
        }
    },
    // Verifies that there is no error.
    noError: (errorObject, message = 'An unexpected error occurred.') => {
        if (errorObject) {
            throw errorObject instanceof Error ? errorObject : new Error(`${message}: ${errorObject}`);
        }
    },
    // Verifies that a value is an array.
    isArrayType: (value, message = 'Value should be an array.') => {
        if (!Array.isArray(value)) {
            throw new Error(`Verification failed: ${message} Actual type: ${typeof value}`);
        }
    }
};

// Import the Version Control System (VCS) manager.
// Path and file name changed from original.
const VersionControlManager = require('./lib/version-control-manager');

// Define the name for the test repository.
const projectIdentifier = 'project-code-base';
// Define the base path for local repository data.
const localRepositoryBasePath = __dirname + '/test-data/';

// Instantiate the VCS manager for the specific repository.
// The instance name is changed from 'r' to 'vcsHandle'.
const vcsHandle = new VersionControlManager(localRepositoryBasePath + projectIdentifier);

// A simple informational comment.
// These test cases aim to validate the core API functionalities.
// They are not exhaustive but cover essential operations.

// Define the test suite using a different naming convention.
suite("VCS Manager Core API Validation:", function() {

    // Test case 1: Verify repository type.
    testCase('should correctly identify a non-bare repository', function() {
        // Checking the 'isBare' property.
        verifier.strictEqual(vcsHandle.isBare, false, 'Repository should not be bare.');
    });

    // Test case 2: Count total revisions on the primary branch.
    testCase('should accurately count revisions on the default branch', function(completionCallback) {
        const defaultBranchName = 'main'; // Renamed from 'master'
        vcsHandle.countRevisions(defaultBranchName, function(errorOutcome, totalRevisionCount) {
            // Guard clause for error handling.
            if (errorOutcome) {
                console.error("Error during revision count:", errorOutcome);
                return completionCallback(errorOutcome);
            }
            // Verify that the count is positive.
            verifier.isTrue(totalRevisionCount > 0, 'Revision count must be greater than zero.');
            completionCallback();
        });
    });

    // Test case 3: Examine path statistics.
    testCase('should provide statistics for a specified path', function(completionCallback) {
        const targetBranch = 'main';
        const targetPath = './'; // Current directory
        vcsHandle.examinePath(targetBranch, targetPath, function(errorOutcome, resourceEntry) {
            verifier.noError(errorOutcome, 'Failed to retrieve path statistics.');

            // Introduce an intermediate variable for clarity.
            const expectedResourceUrl = `/${projectIdentifier}/${targetBranch}/${targetPath.replace('./', '')}`;
            verifier.strictEqual(resourceEntry.resourcePath, expectedResourceUrl, 'Resource URL mismatch.');
            // Assuming 'commits' is now 'revisionHistory' and has a 'length' property.
            verifier.isTrue(resourceEntry.revisionHistory.length > 0, 'Revision history must not be empty.');
            completionCallback();
        });
    });

    // Test case 4: Examine path statistics with a limited count.
    testCase('should retrieve statistics for a limited number of revisions (2)', function(completionCallback) {
        const primaryFlow = 'main';
        const currentDirectory = '.';
        const optionsForStats = { limitResults: 2 }; // Renamed 'maxcount' to 'limitResults'

        vcsHandle.examinePath(primaryFlow, currentDirectory, optionsForStats, function(errorOutcome, resourceEntry) {
            verifier.noError(errorOutcome, 'Error when getting limited path stats.');
            verifier.strictEqual(resourceEntry.revisionHistory.length, 2, 'Expected exactly 2 revisions.');
            completionCallback();
        });
    });

    // Test case 5: Examine path statistics with limit and offset.
    testCase('should retrieve 5 revisions, skipping the first 2 entries', function(completionCallback) {
        const mainFlow = 'main';
        const currentLoc = '.';
        const optionsForPaging = { limitResults: 5, offsetResults: 2 }; // Renamed 'skip' to 'offsetResults'

        vcsHandle.examinePath(mainFlow, currentLoc, optionsForPaging, function(errorOutcome, resourceEntry) {
            verifier.noError(errorOutcome, 'Error during paginated path stats retrieval.');
            // Add a debug log for the actual count.
            console.log(`[DEBUG] Actual revision count for paginated stats: ${resourceEntry.revisionHistory.length}`);
            verifier.strictEqual(resourceEntry.revisionHistory.length, 5, 'Expected 5 revisions after skipping 2.');
            completionCallback();
        });
    });

    // Test case 6: List objects in a directory.
    testCase('should list all objects located at the root of the main branch', function(completionCallback) {
        const targetBranch = 'main';
        const targetDirectory = '.';
        vcsHandle.listDirectory(targetBranch, targetDirectory, function(errorOutcome, objectList) {
            verifier.noError(errorOutcome, 'Failed to list directory contents.');
            verifier.isArrayType(objectList, 'The returned list should be an array.');
            completionCallback();
        });
    });

    // Test case 7: Retrieve file content.
    testCase('should fetch the content of a specific file', function(completionCallback) {
        const targetBranch = 'main';
        const fileName = 'example.py'; // Renamed from 'fu.py'
        const expectedFilePrefix = '#!/usr/bin/python'; // Helper variable

        vcsHandle.getFileContent(targetBranch, fileName, function(errorOutcome, dataBuffer) {
            verifier.noError(errorOutcome, 'Error retrieving file content.');
            // Ensure dataBuffer exists and is a Buffer-like object before calling toString.
            verifier.isTrue(dataBuffer && typeof dataBuffer.toString === 'function', 'Returned content should be buffer-like.');
            verifier.strictEqual(dataBuffer.toString().substring(0, expectedFilePrefix.length), expectedFilePrefix, 'File content header mismatch.');
            completionCallback();
        });
    });

    // Test case 8: Generate a compressed archive.
    testCase('should successfully generate a compressed archive', function(completionCallback) {
        const targetBranch = 'main';
        const desiredFormat = 'zip'; // Keeping 'zip' for format, but could be 'tar.gz' etc.
        vcsHandle.generateArchive(targetBranch, desiredFormat, function(errorOutcome, archiveBuffer) {
            verifier.noError(errorOutcome, 'Failed to generate archive.');
            // More robust check for Buffer-like object without direct instanceof.
            verifier.isTrue(archiveBuffer && typeof archiveBuffer === 'object' && archiveBuffer.length > 0, 'Archive should be a non-empty buffer-like object.');
            completionCallback();
        });
    });

    // Test case 9: Set and retrieve repository description.
    testCase('should allow setting and retrieving the repository description', function() {
        const currentTimestamp = Date.now(); // Using Date.now() for simplicity
        const descriptiveText = `Test description set at ${currentTimestamp}`; // New descriptive text
        
        // Step 1: Set the description.
        vcsHandle.setDescription(descriptiveText);
        
        // Step 2: Retrieve the description and verify.
        const retrievedDescription = vcsHandle.getDescription();
        verifier.strictEqual(retrievedDescription, descriptiveText, 'Retrieved description should match the set value.');
        
        // Optional: Add another check, e.g., type check.
        verifier.isTrue(typeof retrievedDescription === 'string', 'Description should be a string.');
    });
});