function ProcessInput(receivedData) {
  // Check if the provided string begins with a specific sequence.
  if (receivedData.indexOf("YAKI") === 0) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
