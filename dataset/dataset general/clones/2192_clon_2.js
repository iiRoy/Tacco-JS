// This module provides utility functions for 4x4 matrix transformations.
var transformEngine = require("TransformationModule");

/*
 * Initialize an identity transformation matrix.
 * An identity matrix represents no change in position, rotation, or scale.
 */
var defaultTransform = new transformEngine(1, 0, 0, 0,
                                       0, 1, 0, 0,
                                       0, 0, 1, 0,
                                       0, 0, 0, 1);
// Output the string representation of the initial identity matrix.
console.log( defaultTransform.toDisplayString() );


// --- Demonstrating various rotation operations ---
var displayMessage = "Initiating rotation tests...\n";
// Log the results of X, Y, Z axis rotations and a combined rotation, all at 45 degrees.
console.log(transformEngine.rotateOnX(45).toDisplayString(),
            transformEngine.rotateOnY(45).toDisplayString(),
            transformEngine.rotateOnZ(45).toDisplayString(),
            transformEngine.rotateAllAxes(45, 45, 45).toDisplayString());


// --- Demonstrating various translation (movement) operations ---
displayMessage = "Initiating translation tests...\n";
// Log the results of X, Y, Z axis translations and a combined translation, all by 45 units.
console.log(transformEngine.moveX(45).toDisplayString(),
            transformEngine.moveY(45).toDisplayString(),
            transformEngine.moveZ(45).toDisplayString(),
            transformEngine.moveAllAxes(45, 45, 45).toDisplayString());


// --- Demonstrating various scaling (resizing) operations ---
displayMessage = "Initiating scaling tests...\n";
// Log the results of X, Y, Z axis scaling and a combined scaling, all by a factor of 45.
console.log(transformEngine.scaleOnX(45).toDisplayString(),
            transformEngine.scaleOnY(45).toDisplayString(),
            transformEngine.scaleOnZ(45).toDisplayString(),
            transformEngine.scaleAllAxes(45, 45, 45).toDisplayString());


// --- Demonstrating various skew (shearing) operations ---
displayMessage = "Initiating skew tests...\n";
// Log the results of X and Y axis skew operations and a combined skew, all at 45 degrees/units.
console.log(transformEngine.skewOnX(45).toDisplayString(),
            transformEngine.skewOnY(45).toDisplayString(),
            transformEngine.skewAllAxes(45, 45).toDisplayString());