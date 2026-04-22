// This script demonstrates various 3D transformation operations using a specialized linear algebra library.
// It covers identity, rotation, translation, scaling, and skewing transformations,
// presenting their string representations after applying a default transformation value.

// --- Core Module Integration and Validation ---
// The 'Matrix' module is imported and aliased as 'LinearTransformationEngine'
// to reflect its purpose of handling linear transformations.
const LinearTransformationEngine = require("Matrix");

// A critical check to ensure the transformation engine loaded successfully.
// If the module is missing or not a valid constructor, the script will exit.
if (!LinearTransformationEngine || typeof LinearTransformationEngine !== 'function') {
    console.error("ERROR: Failed to load the 'Matrix' transformation engine. Please ensure the module is correctly installed and accessible.");
    process.exit(1); // Terminate execution due to critical dependency failure.
}

// --- Configuration Constants ---
// A constant representing the default numeric value (e.g., degrees for rotation, units for translation, factor for scaling)
// to be used across all transformation examples.
const STANDARD_TRANSFORM_VALUE = 45; // This represents 45 degrees, 45 units, or a scale factor of 45.

// --- Initial State: Identity Transformation ---
// An identity matrix represents a transformation that leaves objects unchanged.
// It's a 4x4 matrix with ones on the main diagonal and zeros elsewhere.
const identityTransformationInstance = new LinearTransformationEngine(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
);

// Output the string representation of the initial identity transformation.
console.log(`\n--- Initial State: Identity Transformation ---`);
console.log(`This matrix represents no change to an object's position or orientation.`);
console.log(`${identityTransformationInstance.toString()}\n`);

// --- Utility Function for Structured Logging ---
// This helper function streamlines the output of transformation results,
// ensuring consistent formatting and clear categorization.
const displayTransformationGroup = (groupTitle, transformationResults) => {
    console.log(`\n--- ${groupTitle.toUpperCase()} OPERATIONS ---`);
    transformationResults.forEach(resultEntry => console.log(resultEntry));
    console.log(''); // Add an extra line for visual separation between groups.
};

// --- Rotational Transformations Showcase ---
// This section demonstrates transformations that rotate an object around specific axes or a combination.
const allRotationResults = [];
const rotationCategoryLabel = "Rotational";

// Perform individual axis rotations and a combined rotation, then store their string representations.
const rotationOnXAxis = LinearTransformationEngine.rotateX(STANDARD_TRANSFORM_VALUE).toString();
const rotationOnYAxis = LinearTransformationEngine.rotateY(STANDARD_TRANSFORM_VALUE).toString();
const rotationOnZAxis = LinearTransformationEngine.rotateZ(STANDARD_TRANSFORM_VALUE).toString();
const compoundRotation = LinearTransformationEngine.rotate(
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE
).toString();

allRotationResults.push(`X-axis rotation (${STANDARD_TRANSFORM_VALUE}°): ${rotationOnXAxis}`);
allRotationResults.push(`Y-axis rotation (${STANDARD_TRANSFORM_VALUE}°): ${rotationOnYAxis}`);
allRotationResults.push(`Z-axis rotation (${STANDARD_TRANSFORM_VALUE}°): ${rotationOnZAxis}`);
allRotationResults.push(`Combined XYZ rotation (${STANDARD_TRANSFORM_VALUE}° each): ${compoundRotation}`);

displayTransformationGroup(rotationCategoryLabel, allRotationResults);


// --- Translational Transformations Showcase ---
// This section demonstrates transformations that shift an object's position along specific axes or a combination.
const allTranslationResults = [];
const translationCategoryLabel = "Translational";

// Perform individual axis translations and a combined translation, then store their string representations.
const translationAlongXAxis = LinearTransformationEngine.translateX(STANDARD_TRANSFORM_VALUE).toString();
const translationAlongYAxis = LinearTransformationEngine.translateY(STANDARD_TRANSFORM_VALUE).toString();
const translationAlongZAxis = LinearTransformationEngine.translateZ(STANDARD_TRANSFORM_VALUE).toString();
const compoundTranslation = LinearTransformationEngine.translate(
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE
).toString();

allTranslationResults.push(`X-axis translation (${STANDARD_TRANSFORM_VALUE} units): ${translationAlongXAxis}`);
allTranslationResults.push(`Y-axis translation (${STANDARD_TRANSFORM_VALUE} units): ${translationAlongYAxis}`);
allTranslationResults.push(`Z-axis translation (${STANDARD_TRANSFORM_VALUE} units): ${translationAlongZAxis}`);
allTranslationResults.push(`Combined XYZ translation (${STANDARD_TRANSFORM_VALUE} units each): ${compoundTranslation}`);

displayTransformationGroup(translationCategoryLabel, allTranslationResults);


// --- Scaling Transformations Showcase ---
// This section demonstrates transformations that resize an object along specific axes or uniformly.
const allScalingResults = [];
const scalingCategoryLabel = "Scaling";

// Perform individual axis scaling and a combined scaling, then store their string representations.
const scalingOnXAxis = LinearTransformationEngine.scaleX(STANDARD_TRANSFORM_VALUE).toString();
const scalingOnYAxis = LinearTransformationEngine.scaleY(STANDARD_TRANSFORM_VALUE).toString();
const scalingOnZAxis = LinearTransformationEngine.scaleZ(STANDARD_TRANSFORM_VALUE).toString();
const compoundScaling = LinearTransformationEngine.scale(
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE
).toString();

allScalingResults.push(`X-axis scale (${STANDARD_TRANSFORM_VALUE}x factor): ${scalingOnXAxis}`);
allScalingResults.push(`Y-axis scale (${STANDARD_TRANSFORM_VALUE}x factor): ${scalingOnYAxis}`);
allScalingResults.push(`Z-axis scale (${STANDARD_TRANSFORM_VALUE}x factor): ${scalingOnZAxis}`);
allScalingResults.push(`Combined XYZ scale (${STANDARD_TRANSFORM_VALUE}x factor each): ${compoundScaling}`);

displayTransformationGroup(scalingCategoryLabel, allScalingResults);


// --- Skew Transformations Showcase ---
// This section demonstrates transformations that shear an object, distorting its shape without changing its volume.
const allSkewResults = [];
const skewCategoryLabel = "Skew";

// Perform individual axis skew operations and a combined XY skew, then store their string representations.
const skewOnXAxis = LinearTransformationEngine.skewX(STANDARD_TRANSFORM_VALUE).toString();
const skewOnYAxis = LinearTransformationEngine.skewY(STANDARD_TRANSFORM_VALUE).toString();
const compoundSkewXY = LinearTransformationEngine.skew(
    STANDARD_TRANSFORM_VALUE,
    STANDARD_TRANSFORM_VALUE
).toString();

allSkewResults.push(`X-axis skew (${STANDARD_TRANSFORM_VALUE}°): ${skewOnXAxis}`);
allSkewResults.push(`Y-axis skew (${STANDARD_TRANSFORM_VALUE}°): ${skewOnYAxis}`);
allSkewResults.push(`Combined XY skew (${STANDARD_TRANSFORM_VALUE}° each): ${compoundSkewXY}`);

displayTransformationGroup(skewCategoryLabel, allSkewResults);

// --- End of Transformation Demonstration Script ---
// This marks the conclusion of the script's execution.