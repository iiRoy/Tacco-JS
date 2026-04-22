"use strict";

const transformLayout = (currentLayout, permutationIndices) => permutationIndices.map(idx => currentLayout[idx]);

// Permutations for 90-degree clockwise rotations
// Face indices: [0:top, 1:front, 2:right, 3:left, 4:back, 5:bottom]

// Rotation around vertical axis (Y-axis), looking from top.
// Top and Bottom faces remain. Front -> Left, Right -> Front, Back -> Right, Left -> Back
const horizontalPermutation = [0, 3, 1, 4, 2, 5];

// Rotation around X-axis (Front-Back axis), looking from Right side.
// Right and Left faces remain. Top -> Front, Front -> Bottom, Bottom -> Back, Back -> Top
const forwardPermutation = [4, 0, 2, 3, 5, 1];

// Rotation around Z-axis (Left-Right axis), looking from Front side.
// Front and Back faces remain. Top -> Right, Right -> Bottom, Bottom -> Left, Left -> Top
const lateralPermutation = [3, 1, 0, 5, 4, 2];


class GeometricalSolid {
    #faceDesignations; // Private field to store the values on the faces

    constructor(initialValues) {
        this.#faceDesignations = initialValues.slice(0, 6);
    }

    // Creates and returns a new GeometricalSolid instance with a rotated state
    #applyTransformation(permutation) {
        return new GeometricalSolid(transformLayout(this.#faceDesignations, permutation));
    }

    // Public methods for specific rotations, returning new instances
    turnAroundVertical() { return this.#applyTransformation(horizontalPermutation); }
    tiltForward() { return this.#applyTransformation(forwardPermutation); }
    rollSideways() { return this.#applyTransformation(lateralPermutation); }

    // Provides the current arrangement of face values
    get currentArrangement() { return this.#faceDesignations; }

    // Generates all 24 unique spatial orientations of this solid
    retrieveAllOrientations() {
        let initialConfiguration = new GeometricalSolid(this.#faceDesignations);
        let primaryAxesRotations = [];

        // Add the initial configuration (original face 0 is top)
        primaryAxesRotations.push(initialConfiguration);

        // Bring original Face 1 (Front) to the Top position
        primaryAxesRotations.push(initialConfiguration.tiltForward());
        // Bring original Face 5 (Bottom) to the Top position
        primaryAxesRotations.push(initialConfiguration.tiltForward().tiltForward());
        // Bring original Face 4 (Back) to the Top position
        primaryAxesRotations.push(initialConfiguration.tiltForward().tiltForward().tiltForward());

        // Bring original Face 3 (Left) to the Top position
        primaryAxesRotations.push(initialConfiguration.rollSideways());
        // Bring original Face 2 (Right) to the Top position
        primaryAxesRotations.push(initialConfiguration.rollSideways().rollSideways().rollSideways());

        let completeOrientationSet = [];
        for (const baseSolid of primaryAxesRotations) {
            let currentSolid = baseSolid;
            for (let k = 0; k < 4; ++k) {
                completeOrientationSet.push(currentSolid.currentArrangement);
                currentSolid = currentSolid.turnAroundVertical();
            }
        }
        return completeOrientationSet; // Array of 24 face arrangement arrays
    }

    // Determines a unique, canonical string representation for the solid
    // This allows comparing two solids for identity regardless of their orientation
    getCanonicalForm() {
        const allPossibleArrangements = this.retrieveAllOrientations();
        const stringArrangements = allPossibleArrangements.map(arr => arr.join('-'));
        return stringArrangements.sort()[0]; // Returns the lexicographically smallest string
    }

    // Checks if this solid is identical to another, irrespective of current orientation
    checkIdentity(otherSolid) {
        return this.getCanonicalForm() === otherSolid.getCanonicalForm();
    }

    // Orients the current solid so that a specific value is on top and another on front
    // This method modifies the instance's internal state.
    setSpecificOrientation(desiredTopValue, desiredFrontValue) {
        const allPossibleArrangements = this.retrieveAllOrientations();
        const matchedArrangement = allPossibleArrangements.find(arr =>
            arr[0] === desiredTopValue && arr[1] === desiredFrontValue
        );

        if (matchedArrangement) {
            this.#faceDesignations = matchedArrangement;
            return true;
        }
        return false;
    }
}

new Promise(function (resolveCompletion, rejectFailure) {
    let collectedInput = "";
    process.stdin.on("data", dataChunk => { collectedInput += dataChunk; });
    process.stdin.on("end", () => { resolveCompletion([collectedInput, process.stdout]); });
}).then(function([readData, outputChannel]) {
    const [[elementCount], ...valueSets] = readData.split("\n")
                                                    .map(line => line.split(" ").map(e => parseInt(e)));
    
    const geometricalSolids = valueSets.slice(0, elementCount).map(set => new GeometricalSolid(set));
    
    let isUniqueCollection = true;
    for (let currentIdx = 0; currentIdx < elementCount; ++currentIdx) {
        for (let compareIdx = currentIdx + 1; compareIdx < elementCount; ++compareIdx) {
            if (geometricalSolids[currentIdx].checkIdentity(geometricalSolids[compareIdx])) {
                isUniqueCollection = false;
                break;
            }
        }
        if (!isUniqueCollection) {
            break;
        }
    }

    if (isUniqueCollection) {
        outputChannel.write("Yes\n");
    } else {
        outputChannel.write("No\n");
    }
});