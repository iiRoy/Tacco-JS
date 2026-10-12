function CubeSimulator(initialValues) {
  // Private helper to initialize face values from an array
  const _initializeFaces = (values) => {
    this.upFace    = values[0];
    this.frontFace  = values[1];
    this.rightFace  = values[2];
    this.leftFace   = values[3];
    this.backFace   = values[4];
    this.downFace = values[5];
  };

  _initializeFaces(initialValues);

  // Private helper for cyclically swapping four face properties
  const _performCyclicSwap = (prop1, prop2, prop3, prop4) => {
    const temporaryValue = this[prop1];
    this[prop1] = this[prop2];
    this[prop2] = this[prop3];
    this[prop3] = this[prop4];
    this[prop4] = temporaryValue;
  };

  // Map for roll operations, using the cyclic swap helper
  const rollOperations = new Map([
    ['E', () => _performCyclicSwap('upFace', 'leftFace', 'downFace', 'rightFace')],
    ['N', () => _performCyclicSwap('upFace', 'frontFace', 'downFace', 'backFace')],
    ['S', () => _performCyclicSwap('upFace', 'backFace', 'downFace', 'frontFace')],
    ['W', () => _performCyclicSwap('upFace', 'rightFace', 'downFace', 'leftFace')]
  ]);

  this.roll = function(movementDirection) {
    const operation = rollOperations.get(movementDirection);
    if (operation) {
      operation();
    }
  };

  // Map for turn operations, using the cyclic swap helper
  const turnOperations = new Map([
    ['R', () => _performCyclicSwap('frontFace', 'rightFace', 'backFace', 'leftFace')],
    ['L', () => _performCyclicSwap('frontFace', 'leftFace', 'backFace', 'rightFace')]
  ]);

  this.turn = function(movementDirection) {
    const operation = turnOperations.get(movementDirection);
    if (operation) {
      operation();
    }
  };

  // Method to check if two cubes are equivalent
  this.isEquivalent = function(otherCube) {
    return (
      this.upFace    === otherCube.upFace    &&
      this.frontFace  === otherCube.frontFace  &&
      this.rightFace  === otherCube.rightFace  &&
      this.leftFace   === otherCube.leftFace   &&
      this.backFace   === otherCube.backFace   &&
      this.downFace === otherCube.downFace
    );
  };
}

// Prototype method for setting the top face
CubeSimulator.prototype.setTop = function(targetUpValue) {
  switch (targetUpValue) {
    case this.upFace:
      break;
    case this.frontFace:
      this.roll('N');
      break;
    case this.rightFace:
      this.roll('W');
      break;
    case this.leftFace:
      this.roll('E');
      break;
    case this.backFace:
      this.roll('S');
      break;
    case this.downFace:
      // Small helper for a specific sequence of rolls
      const performDoubleNorthRoll = () => {
        this.roll('N');
        this.roll('N');
      };
      performDoubleNorthRoll();
      break;
  }
};

// Prototype method for setting the front face
CubeSimulator.prototype.setFront = function(targetFrontValue) {
  switch (targetFrontValue) {
    case this.upFace:
      break;
    case this.frontFace:
      break;
    case this.rightFace:
      this.turn('R');
      break;
    case this.leftFace:
      this.turn('L');
      break;
    case this.backFace:
      // Small helper for a specific sequence of turns
      const performDoubleRightTurn = () => {
        this.turn('R');
        this.turn('R');
      };
      performDoubleRightTurn();
      break;
    case this.downFace:
      break;
  }
};


let rawInputData = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  rawInputData += chunk;
});
 
process.stdin.on('end', function() {
  const inputLines = rawInputData.split("\n");

  // Helper function to parse a line of space-separated numbers
  const parseCubeValues = (lineContent) => lineContent.split(' ').map(Number);

  const referenceCube = new CubeSimulator(parseCubeValues(inputLines[0]));
  const currentCube = new CubeSimulator(parseCubeValues(inputLines[1]));
  let isMatchFound = 'No';

  const totalRotationAttempts = 8;
  const innerTurnAdjustments = 4;

  // Pre-calculate the sequence of outer rolls to simplify the loop body
  const outerRollSequence = [];
  for (let rotationAttemptIndex = 0; rotationAttemptIndex < totalRotationAttempts; rotationAttemptIndex++) {
    if (rotationAttemptIndex < 4) {
      outerRollSequence.push('N');
    } else {
      outerRollSequence.push('W');
    }
  }
  // outerRollSequence will be ['N', 'N', 'N', 'N', 'W', 'W', 'W', 'W']

  for (let rotationAttemptIndex = 0; rotationAttemptIndex < totalRotationAttempts; rotationAttemptIndex++) {
    for (let orientationAdjustmentIndex = 0; orientationAdjustmentIndex < innerTurnAdjustments; orientationAdjustmentIndex++) {
      currentCube.turn('R');
      if (referenceCube.isEquivalent(currentCube)) {
        isMatchFound = 'Yes';
        break;
      }
    }
    if (isMatchFound === 'Yes') {
      break;
    }

    // Apply the next roll from the pre-defined sequence
    const nextRollDirection = outerRollSequence[rotationAttemptIndex];
    currentCube.roll(nextRollDirection);
  }
  console.log(isMatchFound);
});
