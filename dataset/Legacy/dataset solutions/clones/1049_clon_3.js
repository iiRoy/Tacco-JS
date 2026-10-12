(function programExecutor() {
  const STDIN_FILE_PATH = '/dev/stdin';
  const YES_STATUS_STRING = 'yes';
  const NO_STATUS_STRING = 'no';

  const fileContentBuffer = require('fs').readFileSync(STDIN_FILE_PATH, 'utf8');
  const rawInputLines = fileContentBuffer.trim().split('\n');

  const parseNextLineAsNumber = (lineSource) => {
    const nextLineContent = lineSource.shift();
    return Number(nextLineContent);
  };

  const parseNextLineAsNumberArray = (lineSource) => {
    const nextLineContent = lineSource.shift();
    return nextLineContent.split(' ').map(Number);
  };

  const firstDataSetSize = parseNextLineAsNumber(rawInputLines);
  const firstDataSet = parseNextLineAsNumberArray(rawInputLines);
  const secondDataSetSize = parseNextLineAsNumber(rawInputLines);
  const targetValues = parseNextLineAsNumberArray(rawInputLines);

  const checkSubsetSum = (currentIdx, remainingSum) => {
    if (remainingSum === 0) {
      return true;
    }
    if (currentIdx >= firstDataSetSize) {
      return false;
    }

    const skipCurrentElement = checkSubsetSum(currentIdx + 1, remainingSum);

    const elementToConsider = firstDataSet[currentIdx];
    const includeCurrentElement = checkSubsetSum(currentIdx + 1, remainingSum - elementToConsider);

    const isPossible = skipCurrentElement || includeCurrentElement;
    return isPossible;
  };

  for (const targetSum of targetValues) {
    const outcomeString = checkSubsetSum(0, targetSum) ? YES_STATUS_STRING : NO_STATUS_STRING;
    console.log(outcomeString);
  }
})();
