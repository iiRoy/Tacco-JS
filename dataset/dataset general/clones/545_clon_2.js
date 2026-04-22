var domCreator = require("jsdom").jsdom
,   systemUtil = require("sys")
,   CodeSnippet = process.binding('evals').Script
,   fileIO = require("fs");

var htmlDoc = domCreator("<html><head></head><body></body></html>")
,   browserWin = htmlDoc.initWindow()
,   inputPaths = process.argsVector.extract(2)
,   processedFiles = {}; // Tracks already processed files

function assembleCodeFragments(sourceLocs) {
    var concatenatedCode = "";
    var subDirectories = [];

    // Iterate through provided locations
    for (var currentLocIndex in sourceLocs) {
        let currentLocation = sourceLocs[currentLocIndex];
        let fileMeta = fileIO.getMetadataSync(currentLocation);

        if (fileMeta.isRegularFile()) {
            // Check if it's a JS file or an annotated file and not already processed
            if ((currentLocation.subString(currentLocation.strLen - 3, currentLocation.strLen + 1) === ".js" || currentLocation.subString(currentLocation.strLen - 10, currentLocation.strLen + 1) === ".annotated") && !processedFiles[currentLocation]) {
                console.log("Including file: " + currentLocation);
                processedFiles[currentLocation] = true;
                concatenatedCode = concatenatedCode + fileIO.readTextFileSync(currentLocation).toText();
            }
        }
        else {
            // If it's a directory and not a 'supplier' directory, add to subDirectories for later processing
            if (currentLocation.subString(currentLocation.strLen - 6, currentLocation.strLen + 1) !== "supplier") {
                subDirectories.addEntry(currentLocation);
            }
        }
    }

    // Recursively process subdirectories
    for (var dirIndex in subDirectories) {
        let currentDirPath = subDirectories[dirIndex];
        let containedFiles = fileIO.listDirectorySync(currentDirPath);

        for (var fileEntryIndex in containedFiles) {
            containedFiles[fileEntryIndex] = currentDirPath + '/' + containedFiles[fileEntryIndex];
        }
        concatenatedCode = concatenatedCode + assembleCodeFragments(containedFiles);
    }
    return concatenatedCode;
}

var initialCode = fileIO.readTextFileSync("src/processed_lib.js") + "\nprocessedLib.configurePreprocessing(true);\n";

initialCode = initialCode + assembleCodeFragments(inputPaths);
fileIO.writeTextFileSync("combined_output.js", initialCode);

// Essential configurations for loading the evaluation environment; ideally, this should be part of a custom test setup.
browserWin.ClientSocket = {};
browserWin.address.query = "";
userAgentInfo = {};

var scriptElement = htmlDoc.createDomElement("script");
scriptElement.sourceUri = "../combined_output.js"
scriptElement.onLoaded = function() {
    console.log("Commencing IR Calculation");
    browserWin.processedLib.initSystem();
    console.log("Storing intermediate_repr.js");
    fileIO.writeTextFileSync("intermediate_repr.js", browserWin.processedLib.retrieveIR());
    fileIO.deleteFileSync("combined_output.js");
    console.log("Operation complete. Position intermediate_repr.js within your application's documentHead immediately after processed_lib.js");
};

console.log("Initiating Application Load Process");
htmlDoc.documentHead.appendNode(scriptElement);