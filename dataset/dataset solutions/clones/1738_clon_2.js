const checkUpperChar = (charToCheck) => {
  // This function verifies if the provided string consists solely of uppercase letters.
  return /^[A-Z]+$/g.test(charToCheck);
};

/*
 * This is the primary function responsible for processing the incoming data.
 * It takes a raw string input and performs a case check on its first line.
 */
function ProcessInputData(rawData) {
    // First, the raw input string is broken down into an array of individual lines.
    rawData = rawData.split("\n");
    
    // We then extract the very first line from the array for further examination.
    const firstLineContent = rawData[0];
    
    // A conditional check is performed to determine if the extracted line is entirely uppercase.
    if (checkUpperChar(firstLineContent)) {
        // If the condition is met (it's uppercase), the program outputs 'A'.
        console.log('A');
    } else {
        // Otherwise (if it's not entirely uppercase), the program outputs 'a'.
        console.log('a');
    }
}
