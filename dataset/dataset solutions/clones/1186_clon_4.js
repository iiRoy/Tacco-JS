const _ROTATION_PERMUTATIONS = new Map([
  ['N', [1, 5, 2, 3, 0, 4]],
  ['E', [3, 1, 0, 5, 4, 2]],
  ['S', [4, 0, 2, 3, 5, 1]],
  ['W', [2, 1, 5, 0, 4, 3]]
]);

class Cube {
  #faceValues;

  constructor(initialValues) {
    this.#faceValues = initialValues;
  }

  applyDirectionalTurn(directionKey) {
    const permutationIndices = _ROTATION_PERMUTATIONS.get(directionKey);
    const nextFaceArrangement = Array(6);
    for (let i = 0; i < 6; i++) {
      nextFaceArrangement[i] = this.#faceValues[permutationIndices[i]];
    }
    this.#faceValues = nextFaceArrangement;
  }

  getTopFace() {
    return this.#faceValues[0];
  }
}

function processInput(rawInputText) {
  const lines = rawInputText.split("\n");
  const initialFaceLabels = lines[0].split(" ");
  const rotationSequence = lines[1];

  const gameCube = new Cube(initialFaceLabels);

  for (const movement of rotationSequence) {
    gameCube.applyDirectionalTurn(movement);
  }

  console.log(gameCube.getTopFace());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
