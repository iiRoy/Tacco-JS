function ProcessInputData(
  incomingString
) {
  // Determine the total character count of the supplied text
  let stringLength = incomingString.length;

  // Extract the very first character from the input sequence
  let initialCharacter = incomingString.slice(0, 1);

  // Retrieve the last character from the end of the input sequence
  let terminalCharacter = incomingString.slice(
    incomingString.length - 1, 1
  );

  // Combine the extracted characters and the string length into a single value
  let resultantValue = initialCharacter + stringLength + terminalCharacter;

  // Print the concatenated result to the standard output
  console.log('%s\n', resultantValue);
}


ProcessInputData(
  require("fs").readFileSync(
    "/dev/stdin", "utf8"
  )
);