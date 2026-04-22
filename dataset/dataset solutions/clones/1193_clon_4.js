const ROTATION_MAPS = {
    'W': [2, 1, 5, 3, 0, 4], // Westward rotation: (top, right, bottom, left) cycle
    'N': [3, 0, 2, 5, 4, 1], // Northward rotation: (top, front, bottom, back) cycle
    'E': [4, 1, 0, 3, 5, 2], // Eastward rotation: (top, left, bottom, right) cycle
    'S': [1, 5, 2, 0, 4, 3], // Southward rotation: (top, back, bottom, front) cycle
    'V_CW': [0, 4, 1, 2, 3, 5] // Vertical Clockwise rotation: (front, right, back, left) cycle, apex/base fixed
};

class CubeFacet {
    // Internal state: [apex, forward, starboard, aft, port, base]
    // These indices represent fixed physical positions of the cube.
    // The values at these positions are the labels assigned to the faces.
    constructor(initialLabels) {
        // The initialLabels array from the original `Dice` constructor maps:
        // labels[0] -> original top
        // labels[1] -> original back
        // labels[2] -> original right
        // labels[3] -> original left
        // labels[4] -> original front
        // labels[5] -> original bottom
        // We map these to our internal fixed positions:
        this.orientations = [
            initialLabels[0], // current apex (top)
            initialLabels[4], // current forward (front)
            initialLabels[2], // current starboard (right)
            initialLabels[1], // current aft (back)
            initialLabels[3], // current port (left)
            initialLabels[5]  // current base (bottom)
        ];
    }

    // Private static factory method for creating new instances from an existing orientations array
    static _fromOrientations(orientationsArray) {
        const instance = Object.create(CubeFacet.prototype);
        instance.orientations = orientationsArray;
        return instance;
    }

    // Accessors for current face values
    get currentApex() { return this.orientations[0]; }
    get currentForward() { return this.orientations[1]; }
    get currentStarboard() { return this.orientations[2]; }
    get currentAft() { return this.orientations[3]; }
    get currentPort() { return this.orientations[4]; }
    get currentBase() { return this.orientations[5]; }

    // Applies a rotation based on a movement key, returning a NEW CubeFacet instance (functional style)
    applyRotation(movementKey) {
        const permutation = ROTATION_MAPS[movementKey];
        if (!permutation) {
            return this; // Return current instance if movement key is invalid
        }
        const newOrientations = new Array(6);
        for (let i = 0; i < 6; i++) {
            newOrientations[i] = this.orientations[permutation[i]];
        }
        return CubeFacet._fromOrientations(newOrientations);
    }

    // Reorients the cube so that a specific face value is at the apex position
    // Returns a new CubeFacet instance with the desired orientation.
    reorientToApex(targetValue) {
        let currentPanel = this;
        // If already at apex, no rotation needed
        if (currentPanel.currentApex === targetValue) {
            return currentPanel;
        }
        // Check faces reachable with a single rotation
        if (currentPanel.currentStarboard === targetValue) {
            return currentPanel.applyRotation('W');
        }
        if (currentPanel.currentPort === targetValue) {
            return currentPanel.applyRotation('E');
        }
        if (currentPanel.currentAft === targetValue) {
            return currentPanel.applyRotation('N');
        }
        if (currentPanel.currentForward === targetValue) {
            return currentPanel.applyRotation('S');
        }
        // If target value is at the base, it requires two 'S' rotations
        if (currentPanel.currentBase === targetValue) {
            return currentPanel.applyRotation('S').applyRotation('S');
        }
        return currentPanel; // Fallback, should not be reached if targetValue is always a valid face
    }

    // Determines the value of the starboard face when the cube is oriented such that
    // targetApexValue is at the apex and targetAftValue is at the aft position.
    // This simulates the orientation and extracts the required face.
    determineStarboardForAlignment(targetApexValue, targetAftValue) {
        let alignedPanel = this;

        // Step 1: Bring the target apex value to the apex position
        alignedPanel = alignedPanel.reorientToApex(targetApexValue);

        // Step 2: Rotate around the vertical axis until the aft face matches targetAftValue.
        // There are 4 possible rotations around the vertical axis to check.
        for (let i = 0; i < 4; i++) {
            if (alignedPanel.currentAft === targetAftValue) {
                return alignedPanel.currentStarboard;
            }
            alignedPanel = alignedPanel.applyRotation('V_CW'); // Rotate clockwise around vertical axis
        }

        // This point should theoretically not be reached if the target values are consistent
        return null;
    }

    // Checks if two CubeFacet objects represent the same die configuration.
    // This is achieved by comparing the starboard face of this cube with
    // the starboard face of the other cube, after the other cube has been
    // virtually reoriented to match this cube's apex and aft values.
    areEquivalent(otherPanel) {
        return this.currentStarboard === otherPanel.determineStarboardForAlignment(this.currentApex, this.currentAft);
    }
}