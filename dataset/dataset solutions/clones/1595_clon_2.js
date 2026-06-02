function ProcessInput(dataString) {
  // Check for the longest sequence first
  if (dataString.indexOf('RRR') !== -1) {
    // If 'RRR' is found, output 3
    console.log(3);
  }
  // Otherwise, check for a shorter sequence
  else if (dataString.indexOf('RR') !== -1) {
    // If 'RR' is found, output 2
    console.log(2);
  }
  // If neither of the above, check for the shortest sequence
  else if (dataString.indexOf('R') !== -1) {
    // If 'R' is found, output 1
    console.log(1);
  }
  // If no 'R' sequence is found at all
  else {
    // Output 0
    console.log(0);
  }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
