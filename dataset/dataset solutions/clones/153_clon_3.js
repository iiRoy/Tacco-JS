function countNumberFrequencies(numbers) {
  const frequencies = {};
  for (let numberIdx = 0; numberIdx < numbers.length; numberIdx++) {
    const currentNum = numbers[numberIdx];
    frequencies[currentNum] = (frequencies[currentNum] || 0) + 1;
  }
  return frequencies;
}

function groupNumbersByFrequency(frequenciesMap) {
  const grouped = {};
  for (const freqKey in frequenciesMap) {
    if (Object.prototype.hasOwnProperty.call(frequenciesMap, freqKey)) {
      const count = frequenciesMap[freqKey];
      if (!grouped[count]) {
        grouped[count] = [];
      }
      grouped[count].push(freqKey);
    }
  }
  return grouped;
}

function isStraightSequence(sortedNumbers) {
  if (sortedNumbers[0] > 9) {
    return false;
  }

  if (sortedNumbers[1] === 10) {
    return true;
  }

  let consecutiveCheck = true;
  for (let i = 0; i < sortedNumbers.length - 1; i++) {
    if (sortedNumbers[i + 1] !== sortedNumbers[i] + 1) {
      consecutiveCheck = false;
      break;
    }
  }
  return consecutiveCheck;
}

function evaluateHandType(groupedByFrequency) {
  if (groupedByFrequency[4]) {
    return 'four card';
  }

  if (groupedByFrequency[3] && groupedByFrequency[2]) {
    return 'full house';
  }

  if (groupedByFrequency[1] && groupedByFrequency[1].length === 5) {
    const singleOccurrences = groupedByFrequency[1];
    const sortedSingleOccurrences = singleOccurrences.map(Number).sort((a, b) => a - b);

    if (isStraightSequence(sortedSingleOccurrences)) {
      return 'straight';
    }
  }

  if (groupedByFrequency[3]) {
    return 'three card';
  }

  if (groupedByFrequency[2] && groupedByFrequency[2].length === 2) {
    return 'two pair';
  }

  if (groupedByFrequency[2]) {
    return 'one pair';
  }

  return 'null';
}

(function(rawInputData) {
  const processedLines = rawInputData.replace(/\n$/, '').split('\n');

  while (processedLines.length > 0) {
    const currentLine = processedLines.shift();
    const currentNumbersArray = currentLine.split(',').map(Number);

    const numberFrequencies = countNumberFrequencies(currentNumbersArray);
    const groupedByFrequency = groupNumbersByFrequency(numberFrequencies);

    console.log(evaluateHandType(groupedByFrequency));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
