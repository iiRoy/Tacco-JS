function determineOutputDecision(lengthParityOdd, endsMatch) {
  // The original condition was (l & 1) ^ (s[0] === s[l-1])
  // This translates to: (length is odd XOR first char equals last char)
  // If true, print "First". If false, print "Second".
  if (lengthParityOdd ^ endsMatch) {
    return "First";
  } else {
    return "Second";
  }
}

function processStringData(inputStringContent) {
  const processedString = inputStringContent.trim();
  const currentStringLength = processedString.length;

  // Check if the length of the string is odd.
  // (currentStringLength & 1) is 1 if odd, 0 if even.
  const isLengthOdd = (currentStringLength % 2 !== 0);

  // Check if the first character is the same as the last character.
  // This handles empty strings (length 0) and single-character strings (length 1) correctly
  // because processedString[0] and processedString[currentStringLength - 1]
  // will both be undefined for an empty string, resulting in true for the comparison.
  // For a single-character string, both indices point to the same character, resulting in true.
  const areEndsIdentical = (processedString[0] === processedString[currentStringLength - 1]);

  const finalOutputMessage = determineOutputDecision(isLengthOdd, areEndsIdentical);
  console.log(finalOutputMessage);
}

processStringData(require("fs").readFileSync("/dev/stdin", "utf8"));
