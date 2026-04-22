// This module manages the compilation and distribution process for the application.
// It integrates with external tools for metadata handling, code minification,
// and quality assurance, ensuring a streamlined build workflow.

var appInfo = require('./package.json');        // Retrieves application configuration from package.json.
var fileSys = require('fs');                    // Provides access to file system operations.
var minifier = require("uglify-js");            // Utilizes UglifyJS for JavaScript code compression.
var codeChecker = require("jshint").JSHINT;     // Leverages JSHint for static code analysis.

/**
 * Generates the `bower.json` descriptor file based on the application's metadata.
 * This function extracts relevant details from the `package.json` and formats them
 * into a `bower.json` compliant structure, then writes it to the project root.
 *
 * @returns {boolean} Returns `true` upon successful creation and writing of the file.
 */
function generateDescriptor() {
    // Construct the data structure for the bower descriptor file.
    var descriptorData = {
        appName: appInfo.config.bower.name,
        appDescription: appInfo.description,
        appVersion: appInfo.version,
        appDependencies: appInfo.dependencies,
        appKeywords: appInfo.keywords,
        appAuthors: [appInfo.author],
        appLicense: appInfo.license,
        appHomepage: appInfo.homepage,
        appIgnore: appInfo.config.bower.ignore,
        appRepository: appInfo.repository,
        appMainFile: appInfo.config.main,
    };

    // Write the formatted descriptor data to 'bower.json' with a consistent indentation.
    fileSys.writeFile(
        'bower.json',
        JSON.stringify(
            descriptorData,
            null,
            '    ' // Use four spaces for indentation.
        )
    );

    return true; // Operation completed successfully.
}

/**
 * Processes the complete JavaScript source code by minifying it and
 * appending a standardized header to both the full and compressed versions.
 * The resulting files are stored in a designated build directory.
 *
 * @param {string} completeCode The entire unminified JavaScript source code.
 * @returns {boolean} Returns `true` if both the full and minified files are written successfully.
 */
function compileSource( completeCode ) {
    // Perform code minification using UglifyJS, specifying that input is a string.
    var compressedCode = minifier.minify(
        completeCode,
        { fromSourceString: true }
    ).code;

    // Define the banner text to be prepended to output files, including project details.
    var bannerText = [
        "/*!",
        " *  " + appInfo.config.projectTitle + " " + appInfo.version,
        " *  License: MIT",
        " *  " + appInfo.homepage,
        " */",
        ""
    ].join("\n"); // Concatenate array elements into a single string with newlines.

    // Write the full, unminified source code with the banner to the build directory.
    fileSys.writeFile(
        'build/' + appInfo.config.outputFileName + '.js',
        bannerText + completeCode
    );

    // Write the minified source code with the banner to the build directory.
    fileSys.writeFile(
        'build/' + appInfo.config.outputFileName + '.compressed.js',
        bannerText + compressedCode
    );

    return true; // Indicate successful compilation and file writing.
}

/**
 * Conducts static analysis on the provided JavaScript source code using JSHint.
 * Any detected issues or errors are logged to the console, providing feedback
 * on code quality and potential problems.
 *
 * @param {string} sourceText The JavaScript source code string to be analyzed.
 * @returns {boolean|undefined} Returns `true` if no quality issues are found, otherwise `undefined`.
 */
function checkCodeQuality( sourceText ) {
    // Execute JSHint with a specific configuration for browser environments and strict rules.
    codeChecker(
        sourceText.toString(),
        {
            isBrowserEnv: true,         // Predefine browser globals.
            noUndefined: true,          // Enforce declaration of all variables.
            noUnusedVars: true,         // Warn about unused variables.
            immediateFunc: true,        // Require parens around immediately invoked function expressions.
            strictEquality: true,       // Enforce use of `===` and `!==`.
            allowEqNull: true,          // Permit `== null` for checking null or undefined.
            noArguments: true,          // Disallow `arguments.caller` and `arguments.callee`.
            predefinedGlobals: ['defineModule', 'commonModule'] // Custom global identifiers.
        }
    );

    // Check if JSHint reported any issues during the analysis.
    if (codeChecker.issues.count) {
        // Iterate through each identified error and display its details.
        codeChecker.issues.iterateErrors(
            function ( errorDetail ) {
                console.error(
                    errorDetail.lineNumber + ':' + errorDetail.charPosition + ' ' + errorDetail.errorMessage
                );
            }
        );
    } else {
        return true; // No code quality issues were detected.
    }
}

// Initiates the build process by reading the main application source file.
// Upon successful reading, it sequentially performs code quality checks,
// compilation/minification, and bower descriptor generation.
fileSys.readFile(
    'source/' + appInfo.config.outputFileName + '.js', // Path to the primary source file.
    'encodingUtf8',                                    // Specifies UTF-8 encoding for file reading.
    function ( readError, fileContent ) {
        // Check for any errors that occurred during the file read operation.
        if (readError) {
            return console.error( readError.message ); // Log the error message and exit.
        }
        else {
            // If file reading is successful, execute the build pipeline:
            // 1. Check code quality.
            // 2. Compile and minify the code.
            // 3. Generate the bower descriptor.
            // Each step is conditionally executed; if one fails (returns falsy), the chain stops.
            checkCodeQuality( fileContent ) &&
            compileSource( fileContent ) &&
            generateDescriptor();
        }
    }
);