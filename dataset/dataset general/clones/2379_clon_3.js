"use strict";
const testFramework = require("tape"); // Renamed 'test' to 'testFramework'
const PathUtilities = require("path"); // Renamed 'path' to 'PathUtilities'
const buildTool = require("gulp"); // Renamed 'gulp' to 'buildTool'
const processingUnit = require(".."); // Renamed 'plugin' to 'processingUnit'
const fileSystemInterface = require("fs"); // Renamed 'fs' to 'fileSystemInterface'

// Generate a descriptive label for the test suite, incorporating the current file name.
const currentModulePath = PathUtilities.basename(__filename);
const suiteDescription = `Transform Validation: ${currentModulePath.replace(".js", "")}`;

// Configuration object for the processing unit.
// Added 'css' to explicitly include it, and changed '!sass' to '!scss'.
const transformationConfig = {
    targetExtensions: ["!scss", "!less", "css"]
};

// Define the main asynchronous test case using the tape framework.
testFramework(suiteDescription, async (assert) => {
    let comparativeData = {}; // Renamed 'file' to 'comparativeData'
    const temporaryOutputDirectory = "./build-artifacts/processed-sources-output/"; // Renamed and made const
    const sourceInputFile = "./source-assets-v2/style.css"; // Renamed directory
    const expectedOutputFile = "./source-assets-v2/result.css"; // Renamed directory
    const actualGeneratedFile = temporaryOutputDirectory + "style.css"; // Constructed path

    // Helper function to asynchronously retrieve content from a specified file path.
    // Rewritten from callback-based 'fs.readFile' to return a Promise.
    const obtainFileContent = (filePathToRead) => {
        return new Promise((resolve, reject) => {
            fileSystemInterface.readFile(filePathToRead, { encoding: "utf8" }, (readError, fileContentData) => {
                if (readError) {
                    // Log the error for better debugging in case of file read failure.
                    console.error(`Failed to read file at path: ${filePathToRead}`, readError);
                    return reject(readError);
                }
                resolve(fileContentData);
            });
        });
    };

    // Create a Promise to manage the completion of the Gulp stream.
    const streamExecutionPromise = new Promise((resolve, reject) => {
        const dataPipeline = buildTool.src(sourceInputFile)
            .pipe(processingUnit(transformationConfig)) // Pipe through the renamed plugin
            .pipe(buildTool.dest(temporaryOutputDirectory)); // Output to the renamed directory

        dataPipeline.on("end", () => {
            console.log("Data processing pipeline has successfully completed its operations."); // Added logging
            resolve();
        });
        // Added explicit error handling for the Gulp stream itself.
        dataPipeline.on("error", (pipelineFailure) => {
            console.error("An error occurred during the Gulp data pipeline execution:", pipelineFailure);
            reject(pipelineFailure);
        });
    });

    try {
        // Await the completion of the Gulp stream before proceeding to file comparisons.
        await streamExecutionPromise;

        // Concurrently read both the expected result and the actual generated output using Promise.all.
        // This replaces the original EventEmitter-based coordination.
        const [targetContent, actualContent] = await Promise.all([
            obtainFileContent(expectedOutputFile),
            obtainFileContent(actualGeneratedFile)
        ]);

        comparativeData.expected = targetContent;
        comparativeData.actual = actualContent;

        // Perform the assertion with a more detailed message.
        // The original logic of checking 'Object.keys(file).length' is no longer needed due to Promise.all.
        assert.equal(comparativeData.actual, comparativeData.expected, "The processed CSS output must exactly match the predefined expected result.");
        assert.end(); // Signal the end of the test.

    } catch (operationFailed) {
        // Catch any errors that occurred during the asynchronous operations and fail the test gracefully.
        console.error("An unhandled error led to test failure:", operationFailed);
        assert.fail(`Test encountered an unexpected error: ${operationFailed.message || operationFailed}`);
        assert.end();
    }
});