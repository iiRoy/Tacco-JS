const INITIAL_FACE_MAP = [0, 4, 2, 1, 3, 5]; // Maps input labels to internal [T, F, R, B, L, D] indices
const REVERSE_INITIAL_FACE_MAP = [0, 3, 2, 4, 1, 5]; // Maps internal [T, F, R, B, L, D] indices back to original input order [T, B, R, L, F, D]

// Precomputed permutation matrices for each rotation type
// Each array represents: new_face_value[new_index] = old_face_value[old_index_from_here]
const ROTATION_RULES = {
    'W': [4, 1, 0, 3, 5, 2], // West: (L->T, T->R, R->D, D->L)
    'N': [1, 5, 2, 0, 4, 3], // North: (F->T, T->B, B->D, D->F)
    'E': [2, 1, 5, 3, 0, 4], // East: (R->T, T->L, L->D, D->R)
    'S': [3, 0, 2, 5, 4, 1], // South: (B->T, T->F, F->D, D->B)
    'C': [0, 2, 3, 4, 1, 5], // Clockwise (around top-bottom axis): (R->F, F->L, L->B, B->R)
    'A': [0, 4, 1, 2, 3, 5]  // Anti-clockwise (around top-bottom axis): (L->F, F->R, R->B, B->L)
};

// Applies a permutation `rule` to an array of `current_labels`
const reorderSurfaces = (current_labels, rule) => {
    const next_labels = new Array(6);
    for (let i = 0; i < 6; i++) {
        next_labels[i] = current_labels[rule[i]];
    }
    return next_labels;
};

// Composes two permutations: `base_transformation` followed by `rotation_rule`
const composeTransformations = (base_transformation, rotation_rule) => {
    const new_transformation = new Array(6);
    for (let i = 0; i < 6; i++) {
        new_transformation[i] = base_transformation[rotation_rule[i]];
    }
    return new_transformation;
};

// Precomputes all 24 unique transformation matrices representing all possible orientations of a cube.
// This is a core divergence from the original's iterative turning.
const ALL_CUBE_TRANSFORMATIONS = (() => {
    const transformations = [];
    
    // Define 6 base transformations, each bringing a different original face to the top (index 0).
    const identity = [0, 1, 2, 3, 4, 5]; // Original Top is Top
    const northRotation = ROTATION_RULES['N']; // Original Front is Top
    const southRotation = ROTATION_RULES['S']; // Original Back is Top
    const westRotation = ROTATION_RULES['W'];  // Original Left is Top
    const eastRotation = ROTATION_RULES['E'];  // Original Right is Top
    const bottomRotation = composeTransformations(northRotation, ROTATION_RULES['N']); // Original Bottom is Top (N then N)

    const TOP_FACE_BASES = [
        identity,
        northRotation,
        southRotation,
        westRotation,
        eastRotation,
        bottomRotation
    ];

    for (const basePermutation of TOP_FACE_BASES) {
        let currentPermutation = basePermutation;
        for (let i = 0; i < 4; i++) { // For each top-face base, apply Clockwise rotation 4 times
            transformations.push(currentPermutation);
            currentPermutation = composeTransformations(currentPermutation, ROTATION_RULES['C']);
        }
    }
    return transformations;
})();

// Factory function for creating a block object (equivalent to Dice)
const createBlock = (indicator_sequence) => {
    // Map input labels to the internal canonical face order [T, F, R, B, L, D]
    let current_face_labels = INITIAL_FACE_MAP.map(idx => indicator_sequence[idx]);

    // Method to rotate the block
    const reposition = (direction_key) => {
        const rule = ROTATION_RULES[direction_key];
        if (rule) {
            current_face_labels = reorderSurfaces(current_face_labels, rule);
        }
    };

    // Method to get the current face labels
    const getFaceLabels = () => [...current_face_labels];

    // Method to create a deep copy of the block in its current state
    const replicateState = () => {
        const originalFormatLabels = REVERSE_INITIAL_FACE_MAP.map(idx => current_face_labels[idx]);
        return createBlock(originalFormatLabels);
    };

    // Method to check if two blocks are identical in their current orientation
    const checkIdentity = (other_block) => {
        const other_labels = other_block.getFaceLabels();
        return current_face_labels.every((val, idx) => val === other_labels[idx]);
    };

    // Method to check if two blocks are rotationally equivalent
    const areRotationallyEquivalent = (other_block) => {
        const other_base_labels = other_block.getFaceLabels();

        // Generate all 24 orientations for 'this' block and store them as stringified arrays in a Set
        const this_orientations_set = new Set();
        for (const transformation of ALL_CUBE_TRANSFORMATIONS) {
            this_orientations_set.add(JSON.stringify(reorderSurfaces(current_face_labels, transformation)));
        }

        // Check if any of 'other_block's 24 orientations match any of 'this_block's orientations
        for (const transformation of ALL_CUBE_TRANSFORMATIONS) {
            const transformed_other = reorderSurfaces(other_base_labels, transformation);
            if (this_orientations_set.has(JSON.stringify(transformed_other))) {
                return true;
            }
        }
        return false;
    };

    // Method to find the right-side label when specific top and back labels are oriented
    const retrieveRightForTopAndBack = (desired_top, desired_back) => {
        for (const transformation of ALL_CUBE_TRANSFORMATIONS) {
            const transformed_labels = reorderSurfaces(current_face_labels, transformation);
            if (transformed_labels[0] === desired_top && transformed_labels[3] === desired_back) { // index 0 is top, index 3 is back
                return transformed_labels[2]; // index 2 is right
            }
        }
        return null;
    };

    return {
        reposition,
        getFaceLabels,
        replicate: replicateState,
        checkIdentity,
        areRotationallyEquivalent,
        retrieveRightForTopAndBack
    };
};

// Main execution logic
((source_input) => {
    const input_lines = source_input.split('\n').filter(line => line.trim() !== '');
    const number_of_blocks = Number(input_lines.shift());
    const block_collection = [];

    for (let i = 0; i < number_of_blocks; i++) {
        const marks_for_block = input_lines.shift().split(' ').map(Number);
        block_collection.push(createBlock(marks_for_block));
    }

    let has_equivalent_blocks = false;
    for (let i = 0; i < number_of_blocks; i++) {
        for (let j = i + 1; j < number_of_blocks; j++) {
            if (block_collection[i].areRotationallyEquivalent(block_collection[j])) {
                has_equivalent_blocks = true;
                break;
            }
        }
        if (has_equivalent_blocks) {
            break;
        }
    }

    if (has_equivalent_blocks) {
        console.log('No');
    } else {
        console.log('Yes');
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));