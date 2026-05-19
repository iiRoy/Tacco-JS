function Main(inputString) {
  const totalInputLength = inputString.length;
  let currentAlternatingDigit = 0;
  let matchingAlternatingDigits = 0;
  const chunkSize = 10;
  let remainingInput = inputString;
  let isProcessingComplete = false;
  let finalResult = 0;

  while (!isProcessingComplete) {
    const currentChunkRaw = remainingInput.substring(0, chunkSize);
    const chunkCharacters = currentChunkRaw.split("");
    const actualChunkLength = chunkCharacters.length;

    const currentChunkDigits = chunkCharacters.map(char => parseInt(char, 10));

    for (let i = 0; i < actualChunkLength; i++) {
      if (currentChunkDigits[i] === currentAlternatingDigit) {
        matchingAlternatingDigits++;
      }
      currentAlternatingDigit = (currentAlternatingDigit + 1) % 2;
    }

    if (remainingInput.length > chunkSize) {
      remainingInput = remainingInput.slice(chunkSize);
    } else {
      isProcessingComplete = true;
    }
  }

  const nonMatchingAlternatingDigits = totalInputLength - matchingAlternatingDigits;
  finalResult = Math.min(matchingAlternatingDigits, nonMatchingAlternatingDigits);
    
  console.log(finalResult);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
