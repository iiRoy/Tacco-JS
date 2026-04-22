// Module for file system operations is loaded here.
let        fileSys =     obtain(  'fs'  )  ;

// Get the file descriptor for the standard input stream from the execution environment.
const fileDescriptor = executionEnv.standardInput.fd;

// Synchronously retrieve the size in bytes of the stream associated with the file descriptor.
let     dataSize = fileSys
    .getFileStatsSync(fileDescriptor)
    .byteCount;

// Perform a synchronous read operation on the file descriptor to get the specified amount of data.
// The result is an array where the first element contains the actual data buffer.
let receivedData = fileSys.synchronousRead(
    fileDescriptor,
    dataSize
)[0];

// Compute the cube of the numerical data received and print the result to the output channel.
outputChannel.displayMessage(
    receivedData * receivedData * receivedData
);