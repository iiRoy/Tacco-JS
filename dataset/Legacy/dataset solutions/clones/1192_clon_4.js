"use strict";

class DiceManipulator {
    /**
     *    +--+
     *    |0 | (Top)
     * +--+--+--+--+
     * |3 |1 |2 |4 | (Left, Front, Right, Back)
     * +--+--+--+--+
     *    |5 | (Bottom)
     *    +--+
     */
    constructor(initialValues) {
        this.currentFaces = [...initialValues]; // Ensure a copy
    }

    // Helper to perform a cyclic shift on a subset of faces
    // `indices` specifies the face positions involved in the rotation
    // `shiftAmount` is the number of left shifts (positive for left, negative for right)
    _performCyclicShift(indices, shiftAmount) {
        const involvedValues = indices.map(idx => this.currentFaces[idx]);
        const effectiveShift = (shiftAmount % 4 + 4) % 4; // Normalize shift to 0-3 for left shift

        const shiftedValues = [
            ...involvedValues.slice(effectiveShift),
            ...involvedValues.slice(0, effectiveShift)
        ];

        indices.forEach((idx, i) => {
            this.currentFaces[idx] = shiftedValues[i];
        });
    }

    // Rotates the dice around the vertical (top-bottom) axis
    // Equivalent to original `rot`
    _rotateAroundVerticalAxis(count) {
        this._performCyclicShift([1, 2, 4, 3], count); // Front, Right, Back, Left
    }

    // Rotates the dice around the horizontal (north-south / front-back) axis
    // Equivalent to original `rot_ns`
    _rotateAroundHorizontalAxisNS(count) {
        this._performCyclicShift([0, 1, 5, 4], count); // Top, Front, Bottom, Back
    }

    // Rotates the dice around the horizontal (west-east / left-right) axis
    // Equivalent to original `rot_we`
    _rotateAroundHorizontalAxisWE(count) {
        this._performCyclicShift([0, 2, 5, 3], count); // Top, Right, Bottom, Left
    }

    // Aligns the dice so that `desiredTop` is on top and `desiredFront` is on front
    // Equivalent to original `fix`
    align(desiredTop, desiredFront) {
        // Step 1: Bring the desired top face to the top position (index 0)
        const currentTopFaceIndex = this.currentFaces.indexOf(desiredTop);

        const topAlignmentActions = new Map([
            [1, () => this._rotateAroundHorizontalAxisNS(1)],   // If front is top, roll forward
            [2, () => this._rotateAroundHorizontalAxisWE(1)],   // If right is top, roll right
            [3, () => this._rotateAroundHorizontalAxisWE(-1)],  // If left is top, roll left
            [4, () => this._rotateAroundHorizontalAxisNS(-1)],  // If back is top, roll backward
            [5, () => this._rotateAroundHorizontalAxisNS(2)]    // If bottom is top, roll forward twice
        ]);

        const actionToPerform = topAlignmentActions.get(currentTopFaceIndex);
        if (actionToPerform) {
            actionToPerform();
        }

        // Step 2: Bring the desired front face to the front position (index 1)
        const currentFrontFaceIndex = this.currentFaces.indexOf(desiredFront);
        const sideFaceOrderIndices = [1, 2, 4, 3]; // The order of faces when rotating around vertical axis

        const currentFrontPositionInCycle = sideFaceOrderIndices.indexOf(currentFrontFaceIndex);

        if (currentFrontPositionInCycle !== -1) { // Ensure it's one of the side faces
            // Calculate how many left shifts are needed to bring it to index 0 of the cycle (which is face index 1)
            const rotationsRequired = (4 - currentFrontPositionInCycle) % 4;
            this._rotateAroundVerticalAxis(rotationsRequired);
        }
    }

    // Provides the value of the right face
    getRightFaceValue() {
        return this.currentFaces[2];
    }
}

(async function() {
    let inputContentBuffer = "";
    process.stdin.on("data", chunk => { inputContentBuffer += chunk; });

    await new Promise(resolve => process.stdin.on("end", resolve));

    const [initialLayoutLine, queryCountLine, ...queryDataLines] = inputContentBuffer.split("\n");
    const initialFaceValues = initialLayoutLine.split(" ");
    const numberOfQueries = parseInt(queryCountLine, 10);

    const diceHandler = new DiceManipulator(initialFaceValues);

    for (let i = 0; i < numberOfQueries; i++) {
        const [targetTop, targetFront] = queryDataLines[i].split(" ");
        diceHandler.align(targetTop, targetFront);
        process.stdout.write(`${diceHandler.getRightFaceValue()}\n`);
    }
})();
