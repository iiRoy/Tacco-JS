(function(rawInput) {
  const processHandLine = (lineContent) => {
    const currentHandValues = lineContent.split(',').map(Number);

    const valueOccurrences = currentHandValues.reduce((accumulator, cardVal) => {
      accumulator[cardVal] = (accumulator[cardVal] || 0) + 1;
      return accumulator;
    }, {});

    const groupedByFrequency = Object.entries(valueOccurrences).reduce((accumulator, [cardVal, count]) => {
      accumulator[count] = (accumulator[count] || []).concat(Number(cardVal));
      return accumulator;
    }, {});

    return evaluateHand(groupedByFrequency);
  };

  const evaluateHand = (frequencyMap) => {
    const handClassificationRules = [
      (fm) => fm[4] ? 'four card' : undefined,
      (fm) => (fm[3] && fm[2]) ? 'full house' : undefined,
      (fm) => {
        if (fm[1] && fm[1].length === 5) {
          const sortedUniqueCards = fm[1].map(Number).sort((valA, valB) => valA - valB);
          if (sortedUniqueCards[0] > 9) {
            return 'null';
          }
          if (sortedUniqueCards[1] === 10) {
            return 'straight';
          }
          const isConsecutiveSequence = sortedUniqueCards.every((cardValue, index, arrayRef) =>
            index === 0 || cardValue === arrayRef[index - 1] + 1
          );
          if (isConsecutiveSequence) {
            return 'straight';
          }
        }
        return undefined;
      },
      (fm) => fm[3] ? 'three card' : undefined,
      (fm) => (fm[2] && fm[2].length === 2) ? 'two pair' : undefined,
      (fm) => fm[2] ? 'one pair' : undefined,
    ];

    for (const classificationFn of handClassificationRules) {
      const classificationResult = classificationFn(frequencyMap);
      if (classificationResult !== undefined) {
        return classificationResult;
      }
    }

    return 'null';
  };

  const inputLines = rawInput.replace(/\n$/, '').split('\n');
  inputLines.forEach(line => {
    console.log(processHandLine(line));
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
