let inputLines = [];

let seenWordsMap = {};

const DEFAULT_SUCCESS_MESSAGE = "Yes";
let currentStatusMessage = DEFAULT_SUCCESS_MESSAGE;

let priorWordTruncated = null;

const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', function(receivedLine) {
  inputLines.push(receivedLine);
});

lineProcessor.on('close', function() {
  seenWordsMap = {};

  const numberOfWordsToExamine = parseInt(inputLines[0], 10);

  const WORD_SEEN_MARKER = 'marked';

  for (let idx = 1; idx < numberOfWordsToExamine; idx++) {
    const currentCandidateWord = inputLines[idx];

    const hasCandidateBeenSeen = seenWordsMap[currentCandidateWord] !== undefined;

    const candidateFirstChar = currentCandidateWord.slice(0, 1);

    const isConnectionBroken = priorWordTruncated !== null && candidateFirstChar !== priorWordTruncated;

    if (hasCandidateBeenSeen || isConnectionBroken) {
      console.log(currentCandidateWord);
      currentStatusMessage = "No";
      break;
    }

    seenWordsMap[currentCandidateWord] = WORD_SEEN_MARKER;

    priorWordTruncated = currentCandidateWord.slice(0, -1);
  }

  console.log(currentStatusMessage);
});
