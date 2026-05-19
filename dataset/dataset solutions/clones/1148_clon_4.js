class EditDistanceCalculator {
  constructor(targetString) {
    this._targetSequence = targetString.split("");
    this._currentSequence = [];
    this._memoizedStates = new Map();
    this._establishBaseStates();
  }

  _establishBaseStates() {
    for (let j = 0; j <= this._targetSequence.length; j++) {
      this._memoizedStates.set(`0,${j}`, { cost: j, predecessor: j === 0 ? [-1, -1] : [0, j - 1] });
    }
  }

  _determineCellState(v, w) {
    const cellKey = `${v},${w}`;
    if (this._memoizedStates.has(cellKey)) {
      return this._memoizedStates.get(cellKey);
    }

    if (w === 0) {
      const state = { cost: v, predecessor: [v - 1, 0] };
      this._memoizedStates.set(cellKey, state);
      return state;
    }

    const charFromCurrent = this._currentSequence[v - 1];
    const charFromTarget = this._targetSequence[w - 1];

    const substitutionPenalty = (charFromCurrent === charFromTarget) ? 0 : 1;
    const { cost: prevDiagCost } = this._determineCellState(v - 1, w - 1);
    const candidateSubstitution = prevDiagCost + substitutionPenalty;

    const { cost: prevUpCost } = this._determineCellState(v - 1, w);
    const candidateDeletion = prevUpCost + 1;

    const { cost: prevLeftCost } = this._determineCellState(v, w - 1);
    const candidateInsertion = prevLeftCost + 1;

    let minimumCost = candidateSubstitution;
    let chosenPredecessor = [v - 1, w - 1];

    if (candidateDeletion < minimumCost) {
      minimumCost = candidateDeletion;
      chosenPredecessor = [v - 1, w];
    }
    if (candidateInsertion < minimumCost) {
      minimumCost = candidateInsertion;
      chosenPredecessor = [v, w - 1];
    }

    const finalState = { cost: minimumCost, predecessor: chosenPredecessor };
    this._memoizedStates.set(cellKey, finalState);
    return finalState;
  }

  updateSourceSuffix(startIndex, newSuffix) {
    if (startIndex > this._currentSequence.length) {
      throw new Error("Specified start index exceeds current source length.");
    }

    this._currentSequence.length = startIndex;
    this._currentSequence.push(...newSuffix.split(""));

    if (startIndex === 0) {
      this._memoizedStates.clear();
      this._establishBaseStates();
    }
  }

  retrieveCorrectionMarkers() {
    const sourceMarkers = Array(this._currentSequence.length).fill(false);
    const targetMarkers = Array(this._targetSequence.length).fill(false);

    let currentSourceIdx = this._currentSequence.length;
    let currentTargetIdx = this._targetSequence.length;

    this._determineCellState(currentSourceIdx, currentTargetIdx);

    const backtrackPath = (sIdx, tIdx) => {
      if (sIdx <= 0 && tIdx <= 0) {
        return;
      }

      const { cost: currentCost, predecessor: [prevSIdx, prevTIdx] } = this._memoizedStates.get(`${sIdx},${tIdx}`);

      if (prevSIdx !== -1 || prevTIdx !== -1) {
        const { cost: predecessorCost } = this._memoizedStates.get(`${prevSIdx},${prevTIdx}`);
        const stepCost = currentCost - predecessorCost;

        if (stepCost === 0) {
          if (sIdx > 0) sourceMarkers[sIdx - 1] = true;
          if (tIdx > 0) targetMarkers[tIdx - 1] = true;
        }
      }
      backtrackPath(prevSIdx, prevTIdx);
    };

    backtrackPath(currentSourceIdx, currentTargetIdx);
    return { source: sourceMarkers, target: targetMarkers };
  }

  get finalDistanceValue() {
    const finalSourceLen = this._currentSequence.length;
    const finalTargetLen = this._targetSequence.length;
    return this._determineCellState(finalSourceLen, finalTargetLen).cost;
  }
}

const processInputData = (rawInputContent) => {
  const [targetString, sourceString] = rawInputContent.split("\n");
  const distanceCalculator = new EditDistanceCalculator(targetString);
  distanceCalculator.updateSourceSuffix(0, sourceString);
  console.log(distanceCalculator.finalDistanceValue);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
