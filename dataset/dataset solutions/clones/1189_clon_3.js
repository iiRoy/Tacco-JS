"use strict";

function readAndParseInputData() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const processedContent = fileContent.replace(/\r?\n$/, "");
    return processedContent.split(/\r?\n/);
}

processInputData(readAndParseInputData());

const CUBE_DIRECTION_NORTH = "N";
const CUBE_DIRECTION_SOUTH = "S";
const CUBE_DIRECTION_EAST = "E";
const CUBE_DIRECTION_WEST = "W";

function Cube(faceLabels) {
    const [topLabel, southLabel, eastLabel, westLabel, northLabel, bottomLabel] = faceLabels;
    this.top = topLabel;
    this.south = southLabel;
    this.east = eastLabel;
    this.west = westLabel;
    this.north = northLabel;
    this.bottom = bottomLabel;
}

Cube.prototype.roll = function(rollDirection) {
    let temporaryFaceValue;

    switch (rollDirection) {
        case CUBE_DIRECTION_NORTH:
            temporaryFaceValue = this.top;
            this.top = this.south;
            this.south = this.bottom;
            this.bottom = this.north;
            this.north = temporaryFaceValue;
            break;
        case CUBE_DIRECTION_SOUTH:
            temporaryFaceValue = this.top;
            this.top = this.north;
            this.north = this.bottom;
            this.bottom = this.south;
            this.south = temporaryFaceValue;
            break;
        case CUBE_DIRECTION_WEST:
            temporaryFaceValue = this.top;
            this.top = this.east;
            this.east = this.bottom;
            this.bottom = this.west;
            this.west = temporaryFaceValue;
            break;
        case CUBE_DIRECTION_EAST:
            temporaryFaceValue = this.top;
            this.top = this.west;
            this.west = this.bottom;
            this.bottom = this.east;
            this.east = temporaryFaceValue;
            break;
    }
};

function processInputData(inputDataRows) {
    const initialCubeLabels = inputDataRows[0].split(" ");
    const activeCubeInstance = new Cube(initialCubeLabels);

    const SOUTH_FACE_ORIENTATION_SEQUENCE = [CUBE_DIRECTION_NORTH, CUBE_DIRECTION_NORTH, CUBE_DIRECTION_NORTH, CUBE_DIRECTION_WEST];

    const orientSouthFace = (cube, targetSouthLabel) => {
        for (let rollAttemptIndex = 0; rollAttemptIndex < 8; rollAttemptIndex++) {
            if (cube.south === targetSouthLabel) {
                break;
            }
            const currentRollCommand = SOUTH_FACE_ORIENTATION_SEQUENCE[rollAttemptIndex % 4];
            cube.roll(currentRollCommand);
        }
    };

    const orientTopFace = (cube, targetTopLabel) => {
        while (cube.top !== targetTopLabel) {
            cube.roll(CUBE_DIRECTION_WEST);
        }
    };

    for (let queryLineIndex = 2; queryLineIndex < inputDataRows.length; queryLineIndex++) {
        const currentQueryLine = inputDataRows[queryLineIndex];
        const [requiredTopValue, requiredSouthValue] = currentQueryLine.split(" ");

        orientSouthFace(activeCubeInstance, requiredSouthValue);
        orientTopFace(activeCubeInstance, requiredTopValue);

        console.log(activeCubeInstance.east);
    }
}
