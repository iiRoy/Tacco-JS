// This function is designed to process a given string of text.
function ProcessInput(rawData) {
  // We locate the final occurrence of a specific keyword within the provided data.
  let lastKeywordPosition = rawData.lastIndexOf("FESTIVAL");

  // A segment of the raw data is extracted, starting from the beginning
  // and ending just before the identified keyword's position.
  let relevantSegment = rawData.slice(0, lastKeywordPosition);

  // The extracted text segment is then printed to the standard output.
  console.log(relevantSegment);
}

// The 'fs' module is required to interact with the file system.
const fileSystemUtility = require("fs");

// The path to the standard input file is defined.
const standardInputFile = "/dev/stdin";

// The character encoding for reading the file is specified.
const textEncoding = "utf8";

// The entire content of the standard input file is read synchronously.
let fileContents = fileSystemUtility.readFileSync(standardInputFile, textEncoding);

// The main processing function is invoked with the content read from the file.
ProcessInput(fileContents);
