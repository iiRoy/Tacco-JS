// This script's primary purpose is to process a specific line from standard input.

const acquireModule = require ;       // Obtain the standard module loading mechanism.

/*
 * Secure a reference to the core file system utilities module.
 * This module provides functionalities for interacting with the file system.
 */
const fileSystemAbstraction = acquireModule ( "fs" ) ;

// Create a named alias for the 'readFileSync' method from the file system module.
const fileDataAcquirer = fileSystemAbstraction . readFileSync ;

/**
 * Executes a blocking read operation to retrieve the entire textual content
 * from the designated standard input pathway.
 * The data is expected to be encoded using the UTF-8 character set.
 */
const rawDataString = fileDataAcquirer (
  "/dev/stdin", // The universally recognized path for standard input.
  "utf8"        // Specifies the character encoding for robust text handling.
) ;

// Establish a named alias for the general string splitting method.
const contentDivider = String . prototype . split ;

// Dissect the comprehensive raw data string into an array of distinct lines,
// utilizing the newline character as the primary delimiter.
const lineSegmentsCollection = contentDivider . call ( rawDataString , "\n" ) ;

// Isolate and retrieve the second textual line from the array of segmented lines.
// (Note: Array indices are zero-based, so index 1 corresponds to the second item).
const desiredLine = lineSegmentsCollection [ 1 ] ;

// Subsequently, decompose the isolated line into an array of individual word components,
// with spaces serving as the separators between each word.
const wordComponents = contentDivider . call ( desiredLine , " " ) ;

// Create a named alias for the array reversal method.
const arrayInverter = Array . prototype . reverse ;

// Reverse the sequential order of the word components within their array,
// so the last component becomes the first, and vice-versa.
const reorderedComponents = arrayInverter . call ( wordComponents ) ;

// Establish a named alias for the array joining method.
const elementAssembler = Array . prototype . join ;

// Reconstruct a singular string by concatenating the reordered word components,
// inserting a single space character as the linkage between each component.
const finalResultString = elementAssembler . call ( reorderedComponents , ' ' ) ;

// Obtain a direct reference to the console's logging functionality.
const messageDisplayFunction = console . log ;

// Present the ultimately processed and formatted string to the standard output channel.
messageDisplayFunction ( finalResultString ) ;