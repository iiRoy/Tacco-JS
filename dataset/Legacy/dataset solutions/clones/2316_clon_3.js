"use strict";
class ReaderInstance {
  constructor(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  // Helper to parse a token, handling number conversion
  _parseToken(tokenValue, asStringFlag) {
    return asStringFlag ? tokenValue : +tokenValue;
  }

  readToken(asStringFlag) {
    let currentLineTokens = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineTokens === "string") {
      // Lazily split and reverse for pop efficiency
      this._sourceLines[this._currentLineIndex] = currentLineTokens.split(" ").reverse();
    }
    let token = this._sourceLines[this._currentLineIndex].pop();
    if (!this._sourceLines[this._currentLineIndex].length) {
      this._currentLineIndex++;
    }
    return this._parseToken(token, asStringFlag);
  }

  readLineTokens(asStringFlag) {
    let lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStringFlag ? lineTokens : lineTokens.map(val => +val);
  }

  readMatrix(numRows, asStringFlag) {
    let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
    return asStringFlag ? matrixRows : matrixRows.map(row => row.map(val => +val));
  }

  readRawLines(numRows, asStringFlag) {
    let rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    return asStringFlag ? rawLines : rawLines.map(val => +val);
  }
}

const InputReader = (sourceString) => new ReaderInstance(sourceString);

var inputData = InputReader(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimCount = dimensions.length;
  // Start with the innermost dimension, decrementing dimCount for 0-based indexing
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(element => { return ${initialValue}; })`;

  // Build up outer dimensions
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(element => ${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

console.log(mainLogic());

function mainLogic(){
  const numCandidates = inputData.readToken();
  const voteIncreasePerCandidate = inputData.readToken();
  const requiredVotes = inputData.readToken();
  const protectedCandidatesCount = inputData.readToken();

  const candidateScores = inputData.readLineTokens();
  candidateScores.sort((scoreA, scoreB) => scoreA - scoreB);

  // Binary search for the lowest index 'k' such that candidate 'k' can pass
  // lowerBoundIndex represents a 'possible' index (ok in original)
  // upperBoundIndex represents an 'impossible' index (ng in original)
  let lowerBoundIndex = numCandidates - protectedCandidatesCount;
  let upperBoundIndex = -1;

  const lastNonProtectedCandidateIndex = numCandidates - protectedCandidatesCount;

  while (lowerBoundIndex - upperBoundIndex > 1){
    const midCandidateIndex = Math.floor((lowerBoundIndex + upperBoundIndex + 1) / 2);
    const targetScoreForMidCandidate = candidateScores[midCandidateIndex] + voteIncreasePerCandidate;

    const isMidCandidateScoreTooLow = targetScoreForMidCandidate < candidateScores[lastNonProtectedCandidateIndex];
    const areEnoughCandidatesProtected = requiredVotes <= midCandidateIndex + protectedCandidatesCount;

    if (isMidCandidateScoreTooLow){
      upperBoundIndex = midCandidateIndex;
    } else if (areEnoughCandidatesProtected){
      lowerBoundIndex = midCandidateIndex;
    } else {
      let remainingVotesRequired = (requiredVotes - midCandidateIndex - protectedCandidatesCount) * voteIncreasePerCandidate;

      // Iterate through candidates *after* midCandidateIndex up to the last non-protected candidate
      // to see if their scores can be raised enough to satisfy remainingVotesRequired
      for (let currentCandidateIndex = midCandidateIndex + 1; remainingVotesRequired > 0 && currentCandidateIndex <= lastNonProtectedCandidateIndex; currentCandidateIndex++){
        const scoreDifference = targetScoreForMidCandidate - candidateScores[currentCandidateIndex];
        remainingVotesRequired -= scoreDifference;
      }

      if (remainingVotesRequired <= 0){
        lowerBoundIndex = midCandidateIndex;
      } else {
        upperBoundIndex = midCandidateIndex;
      }
    }
  }
  // The result is the count of candidates that can pass, which is numCandidates - lowerBoundIndex.
  return numCandidates - lowerBoundIndex;
}
