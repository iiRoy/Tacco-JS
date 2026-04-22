// Strict mode enabled for robust execution
"use strict";

// Load necessary modules for build and testing operations
const validate = require("tape");
const pathUtils = require("path");
const baseNameExtractor = pathUtils.basename;

// Construct a descriptive name for the current validation suite
const testSuiteName = [" ", baseNameExtractor(process.argv[1])].join("").trim();
const buildTool = require("gulp");
const transformationPlugin = require("../index.js");
const fileSystem = require("fs");
const EventDispatcher = require("events").EventEmitter;

// Configuration settings for the plugin
const configSettings = {
	allowedFormats: ["!scss", "!lessc"]
};

// Start the validation process for the current suite
validate(testSuiteName, function (assertionContext) {
	const eventBroadcaster = new EventDispatcher();
	const processedFile = {};

	// Define the data flow pipeline using the build tool
	const dataFlow = buildTool.src("./fixture-extensions2/style.css")
		.pipe(transformationPlugin(configSettings))
		.pipe(buildTool.dest("./tmp/fixture-extensions2-destination/"));

	// Set up an event listener for when the data flow completes
	dataFlow.on("finish", function() {
		// Asynchronously read the expected content from the result file
		fileSystem.readFile("./fixture-extensions2/result.css", { charset: "utf-8" }, function(errorObject, anticipatedContent) {
			if (errorObject) {
				throw errorObject;
			}
			processedFile.anticipated = anticipatedContent;
			eventBroadcaster.emit("fileProcessed", processedFile);
		});

		// Asynchronously read the actual content from the temporary destination file
		fileSystem.readFile("./tmp/fixture-extensions2-destination/style.css", { charset: "utf-8" }, function(errorObject, receivedContent) {
			if (errorObject) {
				throw errorObject;
			}
			processedFile.received = receivedContent;
			eventBroadcaster.emit("fileProcessed", processedFile);
		});
	});

	// Listener to compare the contents once both files are processed
	eventBroadcaster.addListener("fileProcessed", function(processedFileItem) {
		// Check if both expected and actual contents have been loaded
		if (Reflect.ownKeys(processedFileItem).length >= 2) {
			// Assert that the actual content matches the anticipated content
			assertionContext.verifyEquality(processedFileItem.received, processedFileItem.anticipated);
			assertionContext.completeTest();
		}
	});
});