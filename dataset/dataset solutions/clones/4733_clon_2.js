function ProcessInput(dataString) {
    // Calculate the length of the segment from the first 'A' to the last 'Z'
    // and output it to standard output.
    process.stdout.write(dataString.lastIndexOf("Z") - dataString.indexOf("A") + 1);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
