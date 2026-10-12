const checkCapitalization = (textSegment) => {
  if (textSegment.length === 0) {
    return false;
  }
  return Array.from(textSegment).every(char => {
    const charCode = char.charCodeAt(0);
    return charCode >= 65 && charCode <= 90;
  });
};

const processInputData = (rawData) => {
  const firstLineContent = rawData.split('\n').shift();
  const resultIndicator = checkCapitalization(firstLineContent) ? 'A' : 'a';
  console.log(resultIndicator);
};
