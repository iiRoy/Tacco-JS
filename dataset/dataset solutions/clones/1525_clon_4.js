"use strict";

function ProcessNumericData(rawTextStream) {
    // Stage 1: Normalize and segment the incoming text stream into distinct string components.
    // Utilizes a regular expression to split by any sequence of whitespace characters,
    // which implicitly handles trimming and newlines in a robust manner.
    var componentStrings = rawTextStream.trim().split(/\s+/);

    // Stage 2: Transform string components into their numerical equivalents.
    // The Number constructor is used as a mapping function for explicit type conversion.
    var numericalInputs = componentStrings.map(Number);

    // Stage 3: Deconstruct the array of numerical inputs into individually named variables
    // representing the two pairs of multipliers. This employs array destructuring.
    var [firstMultiplierA, firstMultiplierB, secondMultiplierC, secondMultiplierD] = numericalInputs;

    // Stage 4: Systematically generate all four possible cross-products between the two multiplier pairs.
    // This is achieved using a functional pipeline involving `flatMap` and `map` to build
    // the collection of products without explicit loop-based pushing.
    var generatedProducts = [firstMultiplierA, firstMultiplierB].flatMap(function(valX) {
        return [secondMultiplierC, secondMultiplierD].map(function(valY) {
            return valX * valY;
        });
    });

    // Stage 5: Ascertain the highest value within the collection of generated products.
    // The spread syntax (`...`) is leveraged with `Math.max` to find the maximum
    // element in the array, offering a concise and declarative approach.
    var ultimateResult = Math.max(...generatedProducts);

    // Stage 6: Emit the final computed maximum value to the standard output.
    console.log(ultimateResult);
}

// This line initiates the data processing by reading from the standard input
// and passing the content to the primary processing function.
ProcessNumericData(require("fs").readFileSync("/dev/stdin", "utf8"));