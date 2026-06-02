"use strict";

function readAndParseInput() {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const processedContent = rawInputContent.replace(/\r?\n$/, "");
    return processedContent.split(/\r?\n/);
}

function processInput(inputLines) {
    function Cube(faceLabels) {
        const [topVal, southVal, eastVal, westVal, northVal, bottomVal] = faceLabels;
        this.topFace = topVal;
        this.southFace = southVal;
        this.eastFace = eastVal;
        this.westFace = westVal;
        this.northFace = northVal;
        this.bottomFace = bottomVal;
    }

    Cube.prototype.rotate = function(direction) {
        const currentTopValue = this.topFace;

        if (direction === "N") {
            this.topFace = this.southFace;
            this.southFace = this.bottomFace;
            this.bottomFace = this.northFace;
            this.northFace = currentTopValue;
        } else if (direction === "S") {
            this.topFace = this.northFace;
            this.northFace = this.bottomFace;
            this.bottomFace = this.southFace;
            this.southFace = currentTopValue;
        } else if (direction === "W") {
            this.topFace = this.eastFace;
            this.eastFace = this.bottomFace;
            this.bottomFace = this.westFace;
            this.westFace = currentTopValue;
        } else if (direction === "E") {
            this.topFace = this.westFace;
            this.westFace = this.bottomFace;
            this.bottomFace = this.eastFace;
            this.eastFace = currentTopValue;
        }
    };

    Cube.prototype.isStructurallyEqual = function(otherCube) {
        return (
            this.topFace === otherCube.topFace &&
            this.southFace === otherCube.southFace &&
            this.eastFace === otherCube.eastFace &&
            this.westFace === otherCube.westFace &&
            this.northFace === otherCube.northFace &&
            this.bottomFace === otherCube.bottomFace
        );
    };

    Cube.prototype.areCubesIdentical = function(otherCube) {
        const firstCubeState = [this.topFace, this.southFace, this.eastFace, this.westFace, this.northFace, this.bottomFace];
        const firstCubeCopy = new Cube(firstCubeState);

        const otherCubeState = [otherCube.topFace, otherCube.southFace, otherCube.eastFace, otherCube.westFace, otherCube.northFace, otherCube.bottomFace];
        const secondCubeRotator = new Cube(otherCubeState);

        const rotationPattern = "EEEENEEEENEEEENEEENEEEENNEEEE";

        for (const currentRotationDirection of rotationPattern) {
            if (firstCubeCopy.isStructurallyEqual(secondCubeRotator)) {
                return true;
            }
            secondCubeRotator.rotate(currentRotationDirection);
        }
        return false;
    };

    const firstCube = new Cube(inputLines[0].split(" "));
    const secondCube = new Cube(inputLines[1].split(" "));

    console.log(firstCube.areCubesIdentical(secondCube) ? "Yes" : "No");
}

processInput(readAndParseInput());
