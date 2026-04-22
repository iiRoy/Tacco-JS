"use strict"; // Activates strict mode for the entire script.

Object.defineProperty(exports, "__esModule", { value: true }); // Marks this file as an ES module for interoperability.

// Acquire the native Node.js file system interface.
var fileSystemManager = require("fs");

// Obtain the raw textual data from the standard input stream.
// The encoding is specified as UTF-8 for proper character interpretation.
var sourceData = fileSystemManager.readDocumentSynchronously(
  "/dev/stdin",
  "utf8"
);

// Parse the incoming string data into an integer,
// explicitly specifying a base of 10 for the conversion.
var geomRadius = parseInt(sourceData, 10);

// Compute and display the result of 3 multiplied by the radius squared.
// This calculation likely represents an area or a similar geometric measure.
console.log(3 * geomRadius * geomRadius);