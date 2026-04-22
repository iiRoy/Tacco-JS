const _TRANSFORM_PERMUTATIONS_ = {
  'E': [3, 1, 0, 5, 4, 2], // East roll: Upper -> Left, Left -> Lower, Lower -> Right, Right -> Upper
  'N': [1, 5, 2, 3, 0, 4], // North roll: Upper -> Forward, Forward -> Lower, Lower -> Backward, Backward -> Upper
  'S': [4, 0, 2, 3, 5, 1], // South roll: Upper -> Backward, Backward -> Lower, Lower -> Forward, Forward -> Upper
  'W': [2, 1, 5, 0, 4, 3], // West roll: Upper -> Right, Right -> Lower, Lower -> Left, Left -> Upper
  'R': [0, 3, 1, 4, 2, 5], // Right turn: Forward -> Left, Left -> Backward, Backward -> Right, Right -> Forward
  'L': [0, 2, 4, 1, 3, 5]  // Left turn: Forward -> Right, Right -> Backward, Backward -> Left, Left -> Forward
};

function _applyTransformation_(currentFaceValues, operationKey) {
  const permutation = _TRANSFORM_PERMUTATIONS_[operationKey];
  if (!permutation) {
    throw new Error('Unrecognized operation key: ' + operationKey);
  }
  const nextFaceValues = new Array(6);
  for (let i = 0; i < 6; i++) {
    nextFaceValues[i] = currentFaceValues[permutation[i]];
  }
  return nextFaceValues;
}

const _UPPER_ADJUST_SEQUENCE_ = {
  0: [],          // Already on upper face
  1: ['N'],       // Forward face to upper
  2: ['W'],       // Rightward face to upper
  3: ['E'],       // Leftward face to upper
  4: ['S'],       // Backward face to upper
  5: ['N', 'N']   // Lower face to upper (two North rolls)
};

const _FORWARD_ADJUST_SEQUENCE_ = {
  0: [],          // N/A, assuming upper face is fixed
  1: [],          // Already on forward face
  2: ['R'],       // Rightward face to forward
  3: ['L'],       // Leftward face to forward
  4: ['R', 'R'],  // Backward face to forward (two Right turns)
  5: []           // N/A, assuming upper face is fixed
};

function _createPolyhedron_(initialMarks) {
  let currentMarks = initialMarks;

  return {
    get currentOrientation() {
      return [...currentMarks]; // Return a defensive copy
    },

    performMovement(key) {
      currentMarks = _applyTransformation_(currentMarks, key);
      return this; // For chaining operations
    },

    positionUpperFace(desiredMark) {
      const markLocations = {};
      currentMarks.forEach((value, index) => { markLocations[value] = index; });
      const targetIndex = markLocations[desiredMark];

      const movements = _UPPER_ADJUST_SEQUENCE_[targetIndex] || [];
      for (const move of movements) {
        this.performMovement(move);
      }
      return this;
    },

    positionForwardFace(desiredMark) {
      const markLocations = {};
      currentMarks.forEach((value, index) => { markLocations[value] = index; });
      const targetIndex = markLocations[desiredMark];

      const movements = _FORWARD_ADJUST_SEQUENCE_[targetIndex] || [];
      for (const move of movements) {
        this.performMovement(move);
      }
      return this;
    }
  };
}

let _incomingStream_ = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunkData) {
  _incomingStream_ += chunkData;
});

process.stdin.on('end', function() {
  _incomingStream_ = _incomingStream_.split("\n");

  const _firstPoly_ = _createPolyhedron_(_incomingStream_[0].split(' ').map(Number));
  const _secondPoly_ = _createPolyhedron_(_incomingStream_[1].split(' ').map(Number));
  let _foundMatch_ = false;

  const _firstPolyString_ = JSON.stringify(_firstPoly_.currentOrientation);

  const _exploredOrientations_ = new Set();

  function _recursivelyExplore_(currentPoly, visitedSet) {
    const configString = JSON.stringify(currentPoly.currentOrientation);
    if (visitedSet.has(configString)) {
      return;
    }
    visitedSet.add(configString);

    // Apply a minimal set of transformations to reach all 24 unique orientations
    // E.g., 'E', 'N', 'R' are sufficient to cover the entire rotation group.
    _recursivelyExplore_(_createPolyhedron_(currentPoly.currentOrientation).performMovement('E'), visitedSet);
    _recursivelyExplore_(_createPolyhedron_(currentPoly.currentOrientation).performMovement('N'), visitedSet);
    _recursivelyExplore_(_createPolyhedron_(currentPoly.currentOrientation).performMovement('R'), visitedSet);
  }

  _recursivelyExplore_(_secondPoly_, _exploredOrientations_);

  for (const orientationStr of _exploredOrientations_) {
    if (orientationStr === _firstPolyString_) {
      _foundMatch_ = true;
      break;
    }
  }

  console.log(_foundMatch_ ? 'Yes' : 'No');
});