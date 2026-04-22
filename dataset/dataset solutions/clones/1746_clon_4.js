const processData = (rawData) => {
  const numericString = rawData.split('\n')[0];
  const initialValue = Number.parseInt(numericString, 10);

  if (initialValue === 0) {
    console.log("");
    return;
  }

  const determineCharacterSequence = (val) => {
    if (val === 0) {
      return [];
    }
    let currentRemainder = val % 26;
    if (currentRemainder === 0) {
      currentRemainder = 26;
    }
    const characterAsciiCode = 97 + currentRemainder - 1;
    const nextValueForProcessing = (val - currentRemainder) / 26;
    return determineCharacterSequence(nextValueForProcessing).concat(String.fromCharCode(characterAsciiCode));
  };

  const constructedString = determineCharacterSequence(initialValue).join('');
  console.log(constructedString);
};
processData("123456789");