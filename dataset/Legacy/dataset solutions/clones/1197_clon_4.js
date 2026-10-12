class Cube {
    static #TOP_FACE_INDEX = 0;
    static #BACK_FACE_INDEX = 1;
    static #RIGHT_FACE_INDEX = 2;
    static #LEFT_FACE_INDEX = 3;
    static #FRONT_FACE_INDEX = 4;
    static #BOTTOM_FACE_INDEX = 5;

    static #ROTATION_PERMUTATIONS = {
        'W': [Cube.#RIGHT_FACE_INDEX, Cube.#BACK_FACE_INDEX, Cube.#BOTTOM_FACE_INDEX, Cube.#TOP_FACE_INDEX, Cube.#FRONT_FACE_INDEX, Cube.#LEFT_FACE_INDEX],
        'N': [Cube.#FRONT_FACE_INDEX, Cube.#TOP_FACE_INDEX, Cube.#RIGHT_FACE_INDEX, Cube.#LEFT_FACE_INDEX, Cube.#BOTTOM_FACE_INDEX, Cube.#BACK_FACE_INDEX],
        'E': [Cube.#LEFT_FACE_INDEX, Cube.#BACK_FACE_INDEX, Cube.#TOP_FACE_INDEX, Cube.#BOTTOM_FACE_INDEX, Cube.#FRONT_FACE_INDEX, Cube.#RIGHT_FACE_INDEX],
        'S': [Cube.#BACK_FACE_INDEX, Cube.#BOTTOM_FACE_INDEX, Cube.#RIGHT_FACE_INDEX, Cube.#LEFT_FACE_INDEX, Cube.#TOP_FACE_INDEX, Cube.#FRONT_FACE_INDEX],
        'R': [Cube.#TOP_FACE_INDEX, Cube.#LEFT_FACE_INDEX, Cube.#FRONT_FACE_INDEX, Cube.#BACK_FACE_INDEX, Cube.#RIGHT_FACE_INDEX, Cube.#BOTTOM_FACE_INDEX],
        'L': [Cube.#TOP_FACE_INDEX, Cube.#RIGHT_FACE_INDEX, Cube.#BACK_FACE_INDEX, Cube.#FRONT_FACE_INDEX, Cube.#LEFT_FACE_INDEX, Cube.#BOTTOM_FACE_INDEX]
    };

    #faceValues;

    constructor(initialLabels) {
        this.#faceValues = [...initialLabels];
    }

    get top() { return this.#faceValues[Cube.#TOP_FACE_INDEX]; }
    get back() { return this.#faceValues[Cube.#BACK_FACE_INDEX]; }
    get right() { return this.#faceValues[Cube.#RIGHT_FACE_INDEX]; }
    get left() { return this.#faceValues[Cube.#LEFT_FACE_INDEX]; }
    get front() { return this.#faceValues[Cube.#FRONT_FACE_INDEX]; }
    get bottom() { return this.#faceValues[Cube.#BOTTOM_FACE_INDEX]; }

    applyRotation(direction) {
        const permutation = Cube.#ROTATION_PERMUTATIONS[direction];
        const newFaceValues = new Array(6);
        for (let i = 0; i < 6; i++) {
            newFaceValues[i] = this.#faceValues[permutation[i]];
        }
        this.#faceValues = newFaceValues;
    }

    replicate() {
        return new Cube(this.#faceValues);
    }

    match(otherCube) {
        return this.#faceValues.every((val, idx) => val === otherCube.#faceValues[idx]);
    }

    #generateAllOrientations() {
        const allStates = [];
        let current = this.replicate();

        for (let k = 0; k < 4; k++) {
            allStates.push(current.replicate());
            current.applyRotation('R');
        }

        const majorTurns = ['N', 'E', 'E', 'E', 'N'];
        for (const majorDir of majorTurns) {
            current.applyRotation(majorDir);
            for (let k = 0; k < 4; k++) {
                allStates.push(current.replicate());
                current.applyRotation('R');
            }
        }
        return allStates;
    }

    isCongruent(otherCube) {
        const allMyOrientations = this.#generateAllOrientations();
        for (const myOrientedCube of allMyOrientations) {
            if (myOrientedCube.match(otherCube)) {
                return true;
            }
        }
        return false;
    }

    retrieveRightFace(targetTop, targetBack) {
        const allMyOrientations = this.#generateAllOrientations();
        for (const myOrientedCube of allMyOrientations) {
            if (myOrientedCube.top === targetTop && myOrientedCube.back === targetBack) {
                return myOrientedCube.right;
            }
        }
        return null;
    }
}

(function(inputData) {
    const lines = inputData.split('\n');
    let lineIndex = 0;

    const numberOfCubes = Number(lines[lineIndex++]);
    const cubeCollection = [];

    for (let i = 0; i < numberOfCubes; i++) {
        const faceLabels = lines[lineIndex++].split(' ').map(Number);
        const currentCube = new Cube(faceLabels);
        cubeCollection.push(currentCube);
    }

    let hasDuplicate = false;
    for (let i = 0; i < numberOfCubes; i++) {
        for (let j = i + 1; j < numberOfCubes; j++) {
            if (cubeCollection[i].isCongruent(cubeCollection[j])) {
                hasDuplicate = true;
                break;
            }
        }
        if (hasDuplicate) {
            break;
        }
    }

    console.log(hasDuplicate ? 'No' : 'Yes');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
