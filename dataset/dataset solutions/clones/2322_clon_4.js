function processInputData(sourceData) {
  const firstSourceString = sourceData[1];
  const secondSourceString = sourceData[2];
  const commonLength = firstSourceString.length;

  const combinedCharacters = Array.from({ length: commonLength }, (unused, charIndex) => {
    return firstSourceString[charIndex] + secondSourceString[charIndex];
  });

  const finalResult = combinedCharacters.join('');

  console.log('%s', finalResult);
}
