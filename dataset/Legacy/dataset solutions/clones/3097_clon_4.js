const processSequence = (textData) => {
  const processedText = textData.trim();
  let longestSegment = 0;
  let currentSegment = 0;
  const validChars = 'ATCG';

  for (let k = 0; k < processedText.length; k++) {
    const char = processedText[k];
    if (validChars.includes(char)) {
      currentSegment++;
    } else {
      longestSegment = Math.max(longestSegment, currentSegment);
      currentSegment = 0;
    }
  }
  longestSegment = Math.max(longestSegment, currentSegment);
  console.log(longestSegment);
};

processSequence(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
