function performOperation(initialDataInput) {
  let dataSegments = initialDataInput.split('\n');

  let numericLimit = parseInt(dataSegments[0], 10);
  let targetString = dataSegments[1];

  let preparedString = targetString.substring(0, Math.min(targetString.length, numericLimit));

  let suffixOptions = ['', '...'];
  let suffixIndex = Number(targetString.length > numericLimit);

  let finalOutputResult = preparedString + suffixOptions[suffixIndex];

  console.log(finalOutputResult);
}