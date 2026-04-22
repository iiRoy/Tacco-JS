// This function processes the entire incoming data as a single text block.
function ExecuteCipher(sourceData) {

  // For testing purposes: const sampleInput = "2\nABC";
  const parsedLines = sourceData.split('\n');

  const rotationValue = parseInt(parsedLines[0], 10);
  const originalLetters = parsedLines[1].split('');

  const characterSet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  const transformedString = originalLetters.reduce( (outputBuffer, inputChar) => {
    const positionInSet = (characterSet.indexOf(inputChar) + rotationValue) % 26;
    return outputBuffer + characterSet[positionInSet];
  }, '' );

  // Output the processed string to the console.
  console.log(transformedString);
}

// The following line handles input/output and should not be modified.
ExecuteCipher( require('fs').readFileSync('/dev/stdin', 'utf8') );