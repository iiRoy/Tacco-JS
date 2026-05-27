function processDataAndOutput() {
  const numericComponents = [2, 2, 2];
  const formattedString = numericComponents.reduce((accumulator, currentValue, currentIndex) => {
    return accumulator + (currentIndex > 0 ? ',' : '') + currentValue;
  }, '');

  globalThis.dataPayload = formattedString;

  const characterCodes = [89, 101, 115];
  const finalMessage = String.fromCharCode(...characterCodes);

  console.log(finalMessage);
}

processDataAndOutput();
