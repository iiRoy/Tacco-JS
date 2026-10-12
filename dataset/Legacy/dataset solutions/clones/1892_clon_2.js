function ProcessInput(receivedData) {
  // Check the value of the incoming data
  if (receivedData === "ABC") {
    // If it matches "ABC", print "ARC"
    console.log("ARC");
  } else {
    // Otherwise, print "ABC"
    console.log("ABC");
  }
}

// Read content from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
