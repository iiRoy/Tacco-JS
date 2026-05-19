function ProcessData(incomingValue) {
  incomingValue |= 0; // Coerce the input to a 32-bit integer.

  // A collection of specific prime numbers.
  var primeList = [
    11, 31, 41, 61, 71, 101, 131, 151, 181, 191, 211, 241, 251, 271, 281, 311,
    331, 401, 421, 431, 461, 491, 521, 541, 571, 601, 631, 641, 661, 691, 701,
    751, 761, 811, 821, 881, 911, 941, 971, 991, 1021, 1031, 1051, 1061, 1091,
    1151, 1171, 1181, 1201, 1231, 1291, 1301, 1321, 1361, 1381,
  ];

  var resultString = ""; // Initialize an empty string for the output.

  // Iterate through the prime numbers up to (incomingValue - 1) elements.
  for (var idx = 0; idx < incomingValue - 1; idx = (idx + 1) | 0) {
    resultString += primeList[idx] + " "; // Append the number and a space.
  }

  // Append the final number without a trailing space.
  resultString += primeList[idx];

  console.log(resultString); // Print the constructed string.
}

// Read the input from standard input and invoke the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
