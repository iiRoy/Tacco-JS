// External requirements for the application.

var  fileSystemHandler = require('fs'),
     appManifestData = JSON.parse(fileSystemHandler.readFileSync(__dirname + '/../package.json')),
     codeMinifier = require('uglify-js');

// Copyright notices and module wrapping definitions.
// @internal

var licensePattern = '/*! dataflow.%ext% release:' + appManifestData.version +
    ', %variant%. Copyright(c) 2013 J. Leganés C. "Piranna" <piranna@gmail.com> */'
  , moduleWrapperStart = '\n(function(outputObject){\n'
  , devHeader = licensePattern.replace('%variant%', 'development').replace('%ext%', 'js')
  , prodHeader = licensePattern.replace('%variant%', 'production').replace('%ext%', 'min.js')
  , moduleWrapperEnd = '\n})(this);\n';

// Conditional compilation markers for environment-specific code removal.
// These allow excluding server-side code from client builds.
// @private

var nodeBlockBeginMarker = '// if node'
  , nodeBlockEndMarker = '// end node';

// Core components required to form the foundational client-side build.
// @constant
// @type {Array<string>}
// @private

var coreComponents = [
    '../lib/EventTarget.js',
    '../lib/reliable.min.js',
    'dataflow.js'
];

var DESTINATION_DIR = '/../dist/';
var SOURCE_DIR      = '/../src/';
var BUILD_FILE_PREFIX = 'dataflow';


// Main compilation and bundling function for generating client-side code.
// @param {Array<string>} componentPaths The specific components to include.
// @param {object} [buildOptions] Configuration options for the build process.
// @param {Function} resultCallback The function invoked upon completion.
// @callback {Error|null} processingError An optional error object if an issue occurred.
// @callback {string} outputCode The generated code string.
// @public

var codeGenerator = module.exports = function () {
    var configOpts, completionHandler, operationError = null,
        inputArguments = Array.prototype.slice.call(arguments, 0),
        compilationConfig = {
            minimizeOutput: true,
            excludeNodeSpecific: false,
            additionalContent: []
        };

    // Flexible argument parsing to support various input patterns.
    inputArguments.forEach(function (currentArg) {
        var argumentType = Object.prototype.toString.call(currentArg)
            .replace(/\[object\s(\w+)\]/gi, '$1').toLowerCase();

        switch (argumentType) {
            case 'object':
                return configOpts = currentArg;
            case 'function':
                return completionHandler = currentArg;
        }
    });

    // Initialize configuration if not provided.
    configOpts = configOpts || {};

    // Merge provided options into the default compilation configuration.
    for (var configKey in configOpts) {
        compilationConfig[configKey] = configOpts[configKey];
    }

    var sourceFilesToProcess = [];
    coreComponents.forEach(function (currentFile) {
        sourceFilesToProcess.push(__dirname + SOURCE_DIR + currentFile);
    });

    var fileContentsMap = {};
    sourceFilesToProcess.forEach(function (currentFile) {
        fileSystemHandler.readFile(currentFile, function (readErr, fileContent) {
            if (readErr) operationError = readErr;
            fileContentsMap[currentFile] = fileContent;

            // Check if all files have been read by comparing map size to file list size.
            if (Object.keys(fileContentsMap).length !== sourceFilesToProcess.length) return;


            // Concatenate file contents in the specified order.
            var finalGeneratedCode = devHeader,
                skipLineCount = 0;

            finalGeneratedCode += moduleWrapperStart;

            sourceFilesToProcess.forEach(function (currentFile) {
                finalGeneratedCode += fileContentsMap[currentFile];
            });

            // Append any custom code provided in the configuration.
            if (compilationConfig.additionalContent.length) {
                compilationConfig.additionalContent.forEach(function (additionalPiece) {
                    finalGeneratedCode += additionalPiece;
                });
            }

            // If node-specific code is to be excluded, filter it out.
            if (!compilationConfig.excludeNodeSpecific) {
                finalGeneratedCode = finalGeneratedCode.split('\n').filter(function (currentLine) {
                    // Determine if node-specific block markers are present on the line.
                    var isStartTagPresent = currentLine.indexOf(nodeBlockBeginMarker) >= 0,
                        isEndTagPresent = currentLine.indexOf(nodeBlockEndMarker) >= 0,
                        lineInclusionStatus = skipLineCount;

                    // If a start tag is found, increment the skip counter.
                    if (isStartTagPresent) {
                        skipLineCount++;
                        lineInclusionStatus = skipLineCount;
                    }

                    // If an end tag is found, decrement the skip counter for subsequent lines.
                    if (isEndTagPresent) {
                        skipLineCount--;
                    }

                    return lineInclusionStatus == 0; // Only include lines if not within a skipped block.
                }).join('\n');
            }

            finalGeneratedCode += moduleWrapperEnd;

            // Apply minification if configured.
            if (compilationConfig.minimizeOutput) {
                var abstractSyntaxTree = codeMinifier.parser.parse(finalGeneratedCode);
                abstractSyntaxTree = codeMinifier.uglify.ast_mangle(abstractSyntaxTree);
                abstractSyntaxTree = codeMinifier.uglify.ast_squeeze(abstractSyntaxTree);

                finalGeneratedCode = prodHeader + codeMinifier.uglify.gen_code(abstractSyntaxTree, { ascii_only: true });
            }

            completionHandler(operationError, finalGeneratedCode);
        });
    });
};

// Exposes the current product version string.
// @type {string}
// @public

codeGenerator.productVersion = appManifestData.version;

// Command-line interface support, enabling standalone build generation.

if (!module.parent) {
    // The first two elements are 'node' and the script path, which are not needed for custom arguments.
    var cliArguments = process.argv.slice(2);

    // Generate a development-oriented build.
    codeGenerator(cliArguments.length ? cliArguments : false, { minimizeOutput: false }, function (buildErr, generatedContent) {
        if (buildErr) return console.error(buildErr);
        console.log(__dirname); // Debug output for current directory.
        fileSystemHandler.write(
            fileSystemHandler.openSync(__dirname + DESTINATION_DIR + BUILD_FILE_PREFIX + '.js', 'w'),
            generatedContent,
            0,
            'utf8'
        );
        console.log('Successfully generated the development build: ' + BUILD_FILE_PREFIX + '.js');
    });

    // Subsequently, generate a production-ready minified build.
    codeGenerator(cliArguments.length ? cliArguments : false, function (buildErr, generatedContent) {
        if (buildErr) return console.error(buildErr);

        fileSystemHandler.write(
            fileSystemHandler.openSync(__dirname + DESTINATION_DIR + BUILD_FILE_PREFIX + '.min.js', 'w'),
            generatedContent,
            0,
            'utf8'
        );
        console.log('Successfully generated the production build: ' + BUILD_FILE_PREFIX + '.min.js');
    });
}