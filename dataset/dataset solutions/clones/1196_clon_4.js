"use strict";
class Polyhedron {
    constructor(faceValues) {
        this.sides = [...faceValues];
    }

    spin(axisDirection) {
        const currentSides = this.sides;
        const nextSides = new Array(6);

        const rotationMaps = {
            "N": [4, 0, 2, 3, 5, 1],
            "S": [1, 5, 2, 3, 0, 4],
            "W": [3, 1, 0, 5, 4, 2],
            "E": [2, 1, 5, 0, 4, 3]
        };

        const permutation = rotationMaps[axisDirection];
        if (!permutation) {
            throw new Error("Unknown spin direction");
        }

        for (let i = 0; i < 6; i++) {
            nextSides[i] = currentSides[permutation[i]];
        }
        return new Polyhedron(nextSides);
    }

    static checkEquivalence(firstPoly, secondPoly) {
        const allOrientations = new Set();
        let currentOrientation = secondPoly;

        const addVerticalRotations = (poly) => {
            let tempPoly = poly;
            for (let i = 0; i < 4; i++) {
                allOrientations.add(JSON.stringify(tempPoly.sides));
                tempPoly = tempPoly.spin("E");
            }
        };

        addVerticalRotations(currentOrientation);

        for (let i = 0; i < 3; i++) {
            currentOrientation = currentOrientation.spin("N");
            addVerticalRotations(currentOrientation);
        }

        currentOrientation = currentOrientation.spin("E").spin("E");
        addVerticalRotations(currentOrientation);

        currentOrientation = currentOrientation.spin("N");
        addVerticalRotations(currentOrientation);

        const firstPolyString = JSON.stringify(firstPoly.sides);
        return allOrientations.has(firstPolyString);
    }
}

function processInput(inputLines) {
    const firstLabels = inputLines[0].split(" ");
    const secondLabels = inputLines[1].split(" ");

    const firstObject = new Polyhedron(firstLabels);
    const secondObject = new Polyhedron(secondLabels);

    console.log(Polyhedron.checkEquivalence(firstObject, secondObject) ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));
