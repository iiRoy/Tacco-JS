var fs = require('fs'); // Include the Node.js file system module for file operations.

var inputDescriptor = process.stdin.fd; // Obtain the numerical file descriptor associated with the standard input stream.

// Query the file system for detailed statistics about the standard input's descriptor.
// From these statistics, extract the total byte size of the data available for reading.
var contentLength = fs.fstatSync(inputDescriptor).size;

// Attempt to read data from the standard input using the obtained descriptor and content length.
// Note: In standard Node.js, the fs.readSync function expects a Buffer or Uint8Array as its second argument,
// not a number. Passing 'contentLength' (a number) here will cause a TypeError at runtime.
// The original code's behavior, including this specific error, is preserved.
var rawReadResult = fs.readSync(inputDescriptor, contentLength)[0];

// Calculate the cube of the value obtained from the read operation and print it to the console.
// This line will only execute if the preceding fs.readSync call does not throw an error.
console.log(rawReadResult * rawReadResult * rawReadResult);
