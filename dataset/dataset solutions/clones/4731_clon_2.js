'use strict'


// This function serves as the primary entry point for the program's execution,
// taking raw input data as its argument.
const processIncomingRequest =   (requestPayload) => {


  // First, the raw input payload is processed:
  // - Leading and trailing whitespace characters are removed.
  // - The clean string is then split into an array of individual lines,
  //   using the newline character as the delimiter.
  const  parsedContentLines = requestPayload.trim().split("\n");


  // From the array of parsed lines, we focus on the very first line.
  // That line is further split by space characters, and the very first
  // resulting token is then converted into a numerical value.
  let  evaluatedNumericDatum = Number(parsedContentLines[0].split(' ')[0]);


  // A conditional check is performed on the obtained numeric datum.
  // If the value is greater than or equal to 1200, 'ARC' is printed.
  // Otherwise, 'ABC' is printed to the standard output.
  console.log(
    evaluatedNumericDatum >= 1200
      ? 'ARC' // Output for values meeting or exceeding the threshold.
      : 'ABC' // Output for values below the threshold.
  );
};


// Initiate the program by acquiring input data.
// The Node.js 'fs' (file system) module is used to synchronously
// read the entire content of the standard input file ('/dev/stdin').
// The content is expected to be encoded in UTF-8.
// This raw, UTF-8 encoded content is then passed to our main processing function.
processIncomingRequest(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);