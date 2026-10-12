"use strict";

const _normalizeRotationValue = (rotationAmount) => {
    if (rotationAmount < 0) {
        return rotationAmount + 4 * Math.floor(-rotationAmount / 4) + 4;
    }
    return rotationAmount;
};

class Cube {
    /**
     *    +--+
     *    |0 |
     * +--+--+--+--+
     * |3 |1 |2 |4 |
     * +--+--+--+--+
     *    |5 |
     *    +--+
     */
    constructor(initialFaces) {
        this.faces = initialFaces.slice(0, 6);
    }

    _applyRotationToIndices(rotationAmount, initialIndices) {
        const normalizedAmount = _normalizeRotationValue(rotationAmount);
        const rotatedIndices = [
            normalizedAmount,
            normalizedAmount + 1,
            normalizedAmount + 2,
            normalizedAmount + 3
        ].map((element) => initialIndices[element % 4]);

        const tempFace0 = this.faces[rotatedIndices[0]];
        const tempFace1 = this.faces[rotatedIndices[1]];
        const tempFace2 = this.faces[rotatedIndices[2]];
        const tempFace3 = this.faces[rotatedIndices[3]];

        this.faces[initialIndices[0]] = tempFace0;
        this.faces[initialIndices[1]] = tempFace1;
        this.faces[initialIndices[2]] = tempFace2;
        this.faces[initialIndices[3]] = tempFace3;
    }

    rot(rotationAmount) {
        const initialIndices = [1, 2, 4, 3];
        this._applyRotationToIndices(rotationAmount, initialIndices);
    }

    rot_ns(rotationAmount) {
        const initialIndices = [0, 1, 5, 4];
        this._applyRotationToIndices(rotationAmount, initialIndices);
    }

    rot_we(rotationAmount) {
        const initialIndices = [0, 2, 5, 3];
        this._applyRotationToIndices(rotationAmount, initialIndices);
    }

    alignFaces(upperFace, forwardFace) {
        const currentTopFaceIndex = this.faces.indexOf(upperFace);

        const topFaceRotations = new Map([
            [1, () => this.rot_ns(1)],
            [2, () => this.rot_we(1)],
            [3, () => this.rot_we(-1)],
            [4, () => this.rot_ns(-1)],
            [5, () => this.rot_ns(2)],
        ]);

        const rotationAction = topFaceRotations.get(currentTopFaceIndex);
        if (rotationAction) {
            rotationAction();
        }

        const maxRotations = 4;
        for (let k = 0; k < maxRotations; ++k) {
            if (this.faces[1] === forwardFace) {
                return true;
            }
            this.rot(1);
        }
        return false;
    }

    clone() {
        return new Cube(this.faces.slice());
    }

    static _areFacesIdentical(cubeA, cubeB) {
        if (cubeA.faces.length !== cubeB.faces.length) {
            return false;
        }
        return cubeA.faces.every((faceValue, index) => faceValue === cubeB.faces[index]);
    }

    isEquivalentTo(otherCube) {
        const currentCubeState = this.clone();
        const numOrientationsPerAxis = 4;

        for (let i = 0; i < numOrientationsPerAxis; ++i) {
            if (Cube._areFacesIdentical(currentCubeState, otherCube)) {
                return true;
            }

            currentCubeState.rot_ns(1);

            for (let j = 0; j < numOrientationsPerAxis; ++j) {
                if (Cube._areFacesIdentical(currentCubeState, otherCube)) {
                    return true;
                }
                currentCubeState.rot(1);
            }

            currentCubeState.rot_ns(-1);
            currentCubeState.rot(1);
        }

        currentCubeState.rot_ns(2);

        for (let j = 0; j < numOrientationsPerAxis; ++j) {
            if (Cube._areFacesIdentical(currentCubeState, otherCube)) {
                return true;
            }
            currentCubeState.rot(1);
        }

        return false;
    }
}

new Promise(function (fulfill, deny) {
    let allInputContent = "";
    process.stdin.on("data", (dataChunk) => {
        allInputContent += dataChunk;
    });
    process.stdin.on("end", () => {
        fulfill([allInputContent, process.stdout]);
    });
    process.stdin.on("error", (err) => {
        deny(err);
    });
}).then(function ([inputContent, outputStream]) {
    const inputLines = inputContent.split("\n");
    const parsedNumbers = inputLines.map((line) =>
        line.split(" ").map((strNum) => Number(strNum))
    );

    const [numCubesArray] = parsedNumbers;
    const numCubes = numCubesArray[0];

    const inputDataForCubes = parsedNumbers.slice(1, numCubes + 1);
    const cubesCollection = inputDataForCubes.map((faceValues) => new Cube(faceValues));

    const checkForDuplicateCubes = (cubes) => {
        const totalCubes = cubes.length;
        for (let idx1 = 0; idx1 < totalCubes; ++idx1) {
            for (let idx2 = idx1 + 1; idx2 < totalCubes; ++idx2) {
                if (cubes[idx1].isEquivalentTo(cubes[idx2])) {
                    return true;
                }
            }
        }
        return false;
    };

    if (checkForDuplicateCubes(cubesCollection)) {
        outputStream.write("No\n");
    } else {
        outputStream.write("Yes\n");
    }
}).catch(function(error) {
    process.stderr.write(`An error occurred: ${error.message}\n`);
    process.exit(1);
});
