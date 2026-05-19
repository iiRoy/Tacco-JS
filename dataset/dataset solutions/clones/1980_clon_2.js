function ProcessInput(dataString) {
  // Check if the character '7' is present within the provided string data.
  if (dataString.split("").includes("7")) {
    console.log("Yes"); // Output 'Yes' if '7' is found.
  } else {
    console.log("No"); // Otherwise, output 'No'.
  }
}

// The following line handles standard input and function invocation; it should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
