let collectedContent = '';

const dataReceiver = function(chunk) {
  collectedContent += chunk;
};

const initiateIngestion = function() {
  global.process.stdin.resume();
  global.process.stdin.setEncoding('utf8');
  global.process.stdin.on('data', dataReceiver);
};

const computeDigitSum = function(digitSequence, currentPosition = 0, currentTotal = 0) {
  if (currentPosition >= digitSequence.length) {
    return currentTotal;
  }
  const digitChar = digitSequence[currentPosition];
  const numericValue = digitChar.charCodeAt(0) - '0'.charCodeAt(0);
  return computeDigitSum(digitSequence, currentPosition + 1, currentTotal + numericValue);
};

const cleanAndSegment = function(rawText) {
  let startIdx = 0;
  let endIdx = rawText.length - 1;

  while (startIdx <= endIdx && (rawText[startIdx] === ' ' || rawText[startIdx] === '\n' || rawText[startIdx] === '\r' || rawText[startIdx] === '\t')) {
    startIdx++;
  }
  while (endIdx >= startIdx && (rawText[endIdx] === ' ' || rawText[endIdx] === '\n' || rawText[endIdx] === '\r' || rawText[endIdx] === '\t')) {
    endIdx--;
  }

  if (startIdx > endIdx) {
      return [];
  }
  const processedText = rawText.substring(startIdx, endIdx + 1);

  let segmentsCollection = [];
  let currentSegmentBuffer = '';
  for (let i = 0; i < processedText.length; i++) {
    if (processedText[i] === '\n') {
      segmentsCollection.push(currentSegmentBuffer);
      currentSegmentBuffer = '';
    } else {
      currentSegmentBuffer += processedText[i];
    }
  }
  segmentsCollection.push(currentSegmentBuffer);

  if (segmentsCollection.length > 0) {
      segmentsCollection.pop();
  }
  return segmentsCollection;
};

const processAllSegments = function(segmentArray, index = 0, collectedSums = []) {
  if (index >= segmentArray.length) {
    return collectedSums;
  }
  const currentSegment = segmentArray[index];
  const segmentSum = computeDigitSum(currentSegment);
  collectedSums.push(segmentSum);
  return processAllSegments(segmentArray, index + 1, collectedSums);
};

const presentOutput = function(sumsCollection) {
  let outputBuffer = '';
  for (let i = 0; i < sumsCollection.length; i++) {
    outputBuffer += sumsCollection[i].toString();
    if (i < sumsCollection.length - 1) {
      outputBuffer += '\n';
    }
  }
  global.console.log(outputBuffer);
};

const handleEndOfInput = function() {
  const allSegments = cleanAndSegment(collectedContent);
  const finalResults = processAllSegments(allSegments);
  presentOutput(finalResults);
};

global.process.stdin.on('end', handleEndOfInput);

initiateIngestion();