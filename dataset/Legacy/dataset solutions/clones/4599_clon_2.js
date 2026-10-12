function processInput(rawData) {
  // Remove leading/trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the cleaned string by spaces, then convert each part to a number.
  // This creates an array of three numeric values.
  const [firstVal, secondVal, thirdVal] = rawData.split(" ").map(Number);

  // Check a specific condition involving the last digit of the first number
  // and the first digit of the second number, and similarly for the second
  // and third numbers.
  // Note: Number.slice() is not valid. The original code implies string slicing.
  // This means the variables a, b, c are expected to be strings, not numbers,
  // for the slice method to work.
  // The original code has a subtle bug/feature where `Number` conversion happens,
  // but then `slice` is called, which is a string method. JavaScript will
  // implicitly convert the numbers back to strings for `slice` to work.
  // We must preserve this behavior.
  if (String(firstVal).slice(-1) == String(secondVal).slice(0, 1) && String(secondVal).slice(-1) == String(thirdVal).slice(0, 1)) {
    // If the condition is met, print "YES" to the console.
    console.log("YES");
  } else {
    // Otherwise, print "NO" to the console.
    console.log("NO");
  }
}

// Read input from standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
