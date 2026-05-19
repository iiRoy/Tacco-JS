let receivedData = '';
const inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');

function toggleCharacterCase(charInput) {
  const charCodeValue = charInput.charCodeAt(0);
  const isLowerAlpha = (charCodeValue >= 'a'.charCodeAt(0) && charCodeValue <= 'z'.charCodeAt(0));
  const isUpperAlpha = (charCodeValue >= 'A'.charCodeAt(0) && charCodeValue <= 'Z'.charCodeAt(0));

  if (isLowerAlpha) {
    return charInput.toUpperCase();
  } else if (isUpperAlpha) {
    return charInput.toLowerCase();
  } else {
    return charInput;
  }
}

inputSource.on('data', function(dataBlock) {
  receivedData += dataBlock;

  let transformedSegments = [];
  for (let currentIdx = 0; currentIdx < receivedData.length; currentIdx++) {
    const charToModify = receivedData[currentIdx];
    const modifiedCharResult = toggleCharacterCase(charToModify);
    transformedSegments.push(modifiedCharResult);
  }
  console.log(transformedSegments.join(''));
});
