function ProcessInput(rawData) {
  // This function takes a raw string as input and performs a numerical comparison.
  rawData = rawData.split(" "); // Split the input string by spaces into an array.

  const firstVal = Number(rawData[0]); // Convert the first array element to a number.
  const secondVal = Number(rawData[1]); // Convert the second array element to a number.
  const thirdVal = Number(rawData[2]); // Convert the third array element to a number.

  // Evaluate a condition based on the square roots of the numerical values.
  if (Math.sqrt(thirdVal) > Math.sqrt(firstVal) + Math.sqrt(secondVal)) {
    console.log("Yes"); // Print "Yes" if the condition holds true.
  } else if (Math.sqrt(thirdVal) <= Math.sqrt(firstVal) + Math.sqrt(secondVal)) {
    console.log("No"); // Otherwise, print "No".
  }
}

// Do not modify the line below; it handles reading from standard input and calling the primary function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
