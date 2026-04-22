class SequenceAlignmentProcessor {
  constructor(targetSequenceChars) {
    this.targetChars = Array.from(targetSequenceChars);
    this.currentSourceChars = [];
    this.distanceGrid = null;
    this.predecessorGrid = null;
  }

  evaluateEditPath(sourceSequenceChars) {
    this.currentSourceChars = Array.from(sourceSequenceChars);

    const sourceLen = this.currentSourceChars.length;
    const targetLen = this.targetChars.length;

    this.distanceGrid = Array.from({
      length: sourceLen + 1
    }, (_, r) => Array(targetLen + 1).fill(0));
    this.predecessorGrid = Array.from({
      length: sourceLen + 1
    }, (_, r) => Array(targetLen + 1).fill(null));

    // Initialize the first row and column
    for (let c = 0; c <= targetLen; c++) {
      this.distanceGrid[0][c] = c;
      if (c > 0) this.predecessorGrid[0][c] = [0, c - 1]; // Insertion into target
    }
    for (let r = 0; r <= sourceLen; r++) {
      this.distanceGrid[r][0] = r;
      if (r > 0) this.predecessorGrid[r][0] = [r - 1, 0]; // Deletion from source
    }
    this.predecessorGrid[0][0] = [-1, -1]; // Sentinel for origin

    for (let r = 1; r <= sourceLen; r++) {
      for (let c = 1; c <= targetLen; c++) {
        const costOfSubstitution = (this.currentSourceChars[r - 1] === this.targetChars[c - 1]) ? 0 : 1;

        const pathFromMatchOrSub = this.distanceGrid[r - 1][c - 1] + costOfSubstitution;
        const pathFromDeletion = this.distanceGrid[r - 1][c] + 1;
        const pathFromInsertion = this.distanceGrid[r][c - 1] + 1;

        let minimumCost = pathFromMatchOrSub;
        let chosenPredecessor = [r - 1, c - 1];

        if (pathFromInsertion < minimumCost) {
          minimumCost = pathFromInsertion;
          chosenPredecessor = [r, c - 1];
        }

        if (pathFromDeletion < minimumCost) {
          minimumCost = pathFromDeletion;
          chosenPredecessor = [r - 1, c];
        }

        this.distanceGrid[r][c] = minimumCost;
        this.predecessorGrid[r][c] = chosenPredecessor;
      }
    }
  }

  getFinalDistance() {
    if (!this.distanceGrid) {
      throw new Error("Evaluation not performed. Call evaluateEditPath first.");
    }
    return this.distanceGrid[this.currentSourceChars.length][this.targetChars.length];
  }

  getAlignmentMarkers() {
    if (!this.predecessorGrid) {
      throw new Error("Evaluation not performed. Call evaluateEditPath first.");
    }

    const sourceMarkers = new Array(this.currentSourceChars.length).fill(false);
    const targetMarkers = new Array(this.targetChars.length).fill(false);

    let currentR = this.currentSourceChars.length;
    let currentC = this.targetChars.length;

    while (currentR > 0 || currentC > 0) {
      const [prevR, prevC] = this.predecessorGrid[currentR][currentC];

      // If it was a match or substitution operation (diagonal move)
      if (currentR - prevR === 1 && currentC - prevC === 1) {
        // If the cost was 0, it means a perfect match
        if (this.distanceGrid[prevR][prevC] === this.distanceGrid[currentR][currentC]) {
          sourceMarkers[currentR - 1] = true;
          targetMarkers[currentC - 1] = true;
        }
      }
      currentR = prevR;
      currentC = prevC;
    }
    return {
      source: sourceMarkers,
      target: targetMarkers
    };
  }
}

const processInputAndOutput = (streamData) => {
  const [firstLine, secondLine] = streamData.split("\n");
  const processor = new SequenceAlignmentProcessor(firstLine);
  processor.evaluateEditPath(secondLine);
  console.log(processor.getFinalDistance());
};

processInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));