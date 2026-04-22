const lineReader = require('readline').createInterface({
  input: process.stdin
});

let collectedInputSegments = [];
lineReader.on('line', (line) => {
  collectedInputSegments.push(line);
});

lineReader.on('close', () => {
  processPerformance(collectedInputSegments);
});

let memoizationCache;
let allAvailablePhrases;

function retrieveOptimalValue(phraseIndexIdentifier, currentMelodyDuration) {
  if (currentMelodyDuration === 0) {
    return 0;
  }
  if (phraseIndexIdentifier < 0) {
    return -Infinity;
  }

  const cacheKey = `${phraseIndexIdentifier},${currentMelodyDuration}`;
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }

  // Path 1: Do not incorporate the current phrase
  let maximalScore = retrieveOptimalValue(phraseIndexIdentifier - 1, currentMelodyDuration);

  // Path 2: Attempt to incorporate the current phrase
  const [minimumStartDuration, actualPhraseDuration, scoreGain] = allAvailablePhrases[phraseIndexIdentifier];

  if (currentMelodyDuration >= minimumStartDuration) {
    let maxPreviousSegmentScore = -Infinity;
    // The current phrase can connect to any previous segment whose duration 'prevLen'
    // falls within the range [max(0, currentMelodyDuration - actualPhraseDuration), currentMelodyDuration - minimumStartDuration]
    for (let prevLen = Math.max(0, currentMelodyDuration - actualPhraseDuration); prevLen <= currentMelodyDuration - minimumStartDuration; prevLen++) {
      maxPreviousSegmentScore = Math.max(maxPreviousSegmentScore, retrieveOptimalValue(phraseIndexIdentifier, prevLen));
    }

    if (maxPreviousSegmentScore !== -Infinity) {
      maximalScore = Math.max(maximalScore, maxPreviousSegmentScore + scoreGain);
    }
  }

  memoizationCache.set(cacheKey, maximalScore);
  return maximalScore;
}

function determineMaxPerformance(targetDuration, musicalSegments) {
  allAvailablePhrases = musicalSegments;
  memoizationCache = new Map(); // Clear cache for each new target duration calculation

  const finalCalculatedScore = retrieveOptimalValue(musicalSegments.length - 1, targetDuration);
  return finalCalculatedScore < 0 ? 0 : finalCalculatedScore; // Convert negative infinity (unreachable) to 0 as per original
}

function processPerformance(sourceData) {
  let dataPointer = 0;
  const extractNextLine = () => sourceData[dataPointer++];

  let segmentCount = parseInt(extractNextLine(), 10);
  let musicalSegments = [];
  for (let i = 0; i < segmentCount; i++) {
    musicalSegments.push(extractNextLine().split(' ').map(Number));
  }

  // Sort phrases by their score gain in ascending order
  musicalSegments.sort((a, b) => a[2] - b[2]);

  let requestedDurationCount = parseInt(extractNextLine(), 10);
  let requestedDurations = [];
  for (let i = 0; i < requestedDurationCount; i++) {
    requestedDurations.push(parseInt(extractNextLine(), 10));
  }

  let resultingScores = [];
  let indicatorZeroScore = false;

  for (const currentTargetDuration of requestedDurations) {
    const highestAchievedScore = determineMaxPerformance(currentTargetDuration, musicalSegments);
    if (highestAchievedScore === 0) {
      indicatorZeroScore = true;
    } else {
      resultingScores.push(highestAchievedScore);
    }
  }

  if (indicatorZeroScore) {
    console.log(-1);
  } else {
    resultingScores.forEach(score => console.log(score));
  }
}