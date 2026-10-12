class DataFeeder {
  constructor() {
    this.currentLineIndex = 0;
    this.allInputLines = this.acquireAllInputContent();
  }

  acquireAllInputContent() {
    return (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
  }

  retrieveLines(count) {
    if (count) {
      const segment = this.allInputLines.slice(this.currentLineIndex, this.currentLineIndex + count);
      this.currentLineIndex += count;
      return segment;
    }
    return this.allInputLines[this.currentLineIndex++];
  }

  fetchSingleInteger() { return parseInt(this.retrieveLines()); }
  fetchIntegerArray() { return this.retrieveLines().split(' ').map(Number); }
  fetchIntegerMatrix(count) {
    return this.retrieveLines(count).map(line => line.split(' ').map(Number));
  }
}
const dataProvider = new DataFeeder();

class AntSimulation {
  runSimulation() {
    const simulationParameters = dataProvider.fetchIntegerArray();
    const totalAnts = simulationParameters[0];
    const trackLength = simulationParameters[1];
    const timeDuration = simulationParameters[2];

    const initialAntStates = dataProvider.fetchIntegerMatrix(totalAnts);

    const ghostAntFinalPositions = initialAntStates.map(antState => {
      const currentPosition = antState[0];
      const currentDirection = antState[1];
      const displacement = currentDirection === 1 ? timeDuration : -timeDuration;
      const rawFinalPosition = currentPosition + displacement;
      return ((rawFinalPosition % trackLength) + trackLength) % trackLength;
    });

    const antZeroInitialState = initialAntStates[0];
    const antZeroPosition = antZeroInitialState[0];
    const antZeroDirection = antZeroInitialState[1];

    const antZeroCollisionCount = initialAntStates.slice(1).reduce((accumulator, otherAntState) => {
      const otherAntPosition = otherAntState[0];
      const otherAntDirection = otherAntState[1];

      if (otherAntDirection === antZeroDirection) {
        return accumulator;
      }

      let initialRelativeDistance;
      if (antZeroDirection === 1) {
        initialRelativeDistance = otherAntPosition - antZeroPosition;
      } else {
        initialRelativeDistance = (trackLength - otherAntPosition) + antZeroPosition;
      }

      const crossings = Math.floor((2 * timeDuration + trackLength - initialRelativeDistance) / trackLength);
      
      return (accumulator + crossings + totalAnts) % totalAnts;
    }, 0);

    const sortedGhostFinalPositions = ghostAntFinalPositions.slice().sort((a, b) => a - b);

    const antZeroEffectiveIndex = (0 + (antZeroDirection === 1 ? antZeroCollisionCount : -antZeroCollisionCount) + totalAnts) % totalAnts;

    const finalAntPositions = Array.from({ length: totalAnts }, (_, i) => {
      const targetIndexInSortedGhosts = (antZeroEffectiveIndex + i) % totalAnts;
      return sortedGhostFinalPositions[targetIndexInSortedGhosts];
    });

    return finalAntPositions.join('\n');
  }
}

const DisplayResult = (outcome) => {
  let formattedOutput;
  if (outcome === true) { formattedOutput = 'Yes'; }
  else if (outcome === false) { formattedOutput = 'No'; }
  else { formattedOutput = outcome; }
  console.log(formattedOutput);
};

DisplayResult(new AntSimulation().runSimulation());
