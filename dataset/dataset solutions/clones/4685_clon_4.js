((sourceDataBlob) => {
  const lineSegments = sourceDataBlob.split('\n');
  const parameterSet = lineSegments[0].split(' ').map(parseFloat);
  const totalSubjects = parameterSet[0];
  const vehicleCapacity = parameterSet[1];
  const timeAllowance = parameterSet[2];

  let subjectArrivalTimings = lineSegments.slice(1).map(parseFloat).sort((valA, valB) => valA - valB);

  class DispatchOverseer {
    constructor(timingsList, overallSubjects, maxCapacity, allowedDelay) {
      this.arrivalSequences = timingsList;
      this.fullSubjectCount = overallSubjects;
      this.maxOccupants = maxCapacity;
      this.delayTolerance = allowedDelay;

      this.tripCount = 1;
      this.currentSubjectPointer = 0;
      this.tripInitiatorPointer = 0;
    }

    advanceOperation() {
      // Original loop termination condition: j < N - 1
      // Equivalent to: this.tripInitiatorPointer < this.fullSubjectCount - 1
      if (this.tripInitiatorPointer >= this.fullSubjectCount - 1) {
        return false; // Signal to stop processing
      }

      const initiatorTime = this.arrivalSequences[this.tripInitiatorPointer];
      const departureCutoff = initiatorTime + this.delayTolerance;

      let subjectExceedsTimeLimit;
      // Handle array out-of-bounds access for this.arrivalSequences[this.currentSubjectPointer]
      // T[i] >= limit -> undefined >= number is false
      if (this.currentSubjectPointer < this.fullSubjectCount) {
        subjectExceedsTimeLimit = this.arrivalSequences[this.currentSubjectPointer] >= departureCutoff;
      } else {
        subjectExceedsTimeLimit = false;
      }

      // Original condition: T[i] >= limit || i === C
      if (subjectExceedsTimeLimit || this.currentSubjectPointer === this.maxOccupants) {
        this.tripCount++;
        this.tripInitiatorPointer = this.currentSubjectPointer;
      }

      this.currentSubjectPointer++; // Original i++
      return true; // Signal to continue processing
    }

    retrieveFinalCount() {
      return this.tripCount;
    }
  }

  const manager = new DispatchOverseer(subjectArrivalTimings, totalSubjects, vehicleCapacity, timeAllowance);

  // Replicate the loop structure but using method calls
  while (manager.advanceOperation()) {
    // The core logic is inside advanceOperation
  }

  console.log(manager.retrieveFinalCount());

})(require("fs").readFileSync("/dev/stdin", "utf8"));