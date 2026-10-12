function processInputAndTransform(rawInput) {
  const relevantSegment = rawInput.split('\n')[0].split(' ')[0];

  if (relevantSegment.length === 1 && relevantSegment[0] === '?') {
    return 'D';
  }

  const transformedCharacters = relevantSegment.split('').reduce((processedChars, currentItem, itemIndex, originalItems) => {
    if (currentItem !== '?') {
      processedChars.push(currentItem);
    } else {
      let replacementItem;
      if (itemIndex === 0) {
        const nextOriginalItem = originalItems[itemIndex + 1];
        const firstItemRules = {
          'P': 'D',
          'D': 'P',
          '?': 'P'
        };
        replacementItem = firstItemRules[nextOriginalItem];
      } else {
        const previousProcessedItem = processedChars[itemIndex - 1];
        const subsequentItemRules = {
          'P': 'D',
          'D': 'P'
        };
        replacementItem = subsequentItemRules[previousProcessedItem];
      }
      processedChars.push(replacementItem);
    }
    return processedChars;
  }, []);

  return transformedCharacters.join('');
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const result = processInputAndTransform(inputData);
console.log(result);
