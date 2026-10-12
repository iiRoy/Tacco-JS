function CubeModel(initialFaceValues) {
    this.faceUp = initialFaceValues[0];
    this.faceRear = initialFaceValues[1];
    this.faceStarboard = initialFaceValues[2];
    this.facePort = initialFaceValues[3];
    this.faceFore = initialFaceValues[4];
    this.faceDown = initialFaceValues[5];
}

CubeModel.prototype.performRotation = function(rotationCommand) {
    const rotationActions = {
        'W': () => {
            const temporaryHolder = this.facePort;
            this.facePort = this.faceUp;
            this.faceUp = this.faceStarboard;
            this.faceStarboard = this.faceDown;
            this.faceDown = temporaryHolder;
        },
        'N': () => {
            const temporaryHolder = this.faceFore;
            this.faceFore = this.faceUp;
            this.faceUp = this.faceRear;
            this.faceRear = this.faceDown;
            this.faceDown = temporaryHolder;
        },
        'E': () => {
            const temporaryHolder = this.faceStarboard;
            this.faceStarboard = this.faceUp;
            this.faceUp = this.facePort;
            this.facePort = this.faceDown;
            this.faceDown = temporaryHolder;
        },
        'S': () => {
            const temporaryHolder = this.faceRear;
            this.faceRear = this.faceUp;
            this.faceUp = this.faceFore;
            this.faceFore = this.faceDown;
            this.faceDown = temporaryHolder;
        },
        'R': () => {
            const temporaryHolder = this.faceStarboard;
            this.faceStarboard = this.faceFore;
            this.faceFore = this.facePort;
            this.facePort = this.faceRear;
            this.faceRear = temporaryHolder;
        },
        'L': () => {
            const temporaryHolder = this.facePort;
            this.facePort = this.faceFore;
            this.faceFore = this.faceStarboard;
            this.faceStarboard = this.faceRear;
            this.faceRear = temporaryHolder;
        }
    };

    const action = rotationActions[rotationCommand];
    if (action) {
        action();
    }
};

CubeModel.prototype.createCopy = function() {
    return new CubeModel([this.faceUp, this.faceRear, this.faceStarboard, this.facePort, this.faceFore, this.faceDown]);
};

CubeModel.prototype.areFacesIdentical = function(anotherCube) {
    return this.faceUp === anotherCube.faceUp &&
           this.faceRear === anotherCube.faceRear &&
           this.faceStarboard === anotherCube.faceStarboard &&
           this.facePort === anotherCube.facePort &&
           this.faceFore === anotherCube.faceFore &&
           this.faceDown === anotherCube.faceDown;
};

const iterateAllOrientations = function(cubeInstance, callback) {
    const orientationSequence = 'NEEEN';
    let workingCubeInstance = cubeInstance.createCopy();

    for (let outerIndex = 0; outerIndex < orientationSequence.length; outerIndex++) {
        for (let innerIndex = 0; innerIndex < 4; innerIndex++) {
            const result = callback(workingCubeInstance);
            if (result !== undefined) {
                return result;
            }
            workingCubeInstance.performRotation('R');
        }
        workingCubeInstance.performRotation(orientationSequence[outerIndex]);
    }
    return undefined;
};

CubeModel.prototype.canOrientToMatch = function(anotherCube) {
    const matchResult = iterateAllOrientations(this, (currentCubeState) => {
        if (currentCubeState.areFacesIdentical(anotherCube)) {
            return true;
        }
        return undefined;
    });
    return matchResult === true;
};

CubeModel.prototype.retrieveStarboardFace = function(targetUp, targetRear) {
    const foundFace = iterateAllOrientations(this, (currentCubeState) => {
        if (currentCubeState.faceUp === targetUp && currentCubeState.faceRear === targetRear) {
            return currentCubeState.faceStarboard;
        }
        return undefined;
    });
    return foundFace !== undefined ? foundFace : null;
};

(function(rawInputData) {
    const parseCubeData = (inputString) => {
        const inputLines = inputString.split('\n');
        const numberOfCubes = Number(inputLines.shift());
        const cubeCollection = [];

        for (let i = 0; i < numberOfCubes; i++) {
            const currentFaceLabels = inputLines.shift().split(' ').map(Number);
            const newCubeInstance = new CubeModel(currentFaceLabels);
            cubeCollection.push(newCubeInstance);
        }
        return cubeCollection;
    };

    const checkForDuplicateOrientations = (cubes) => {
        const count = cubes.length;
        if (count <= 1) {
            return false;
        }
        for (let outerIndex = 0; outerIndex < count; outerIndex++) {
            for (let innerIndex = outerIndex + 1; innerIndex < count; innerIndex++) {
                if (cubes[outerIndex].canOrientToMatch(cubes[innerIndex])) {
                    return true;
                }
            }
        }
        return false;
    };

    const allCubeInstances = parseCubeData(rawInputData);

    if (checkForDuplicateOrientations(allCubeInstances)) {
        console.log('No');
    } else {
        console.log('Yes');
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
