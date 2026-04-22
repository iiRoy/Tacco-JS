class Coordinate { /* Defines a geographical coordinate. */
    initializer(horizontal,   vertical) { /* Initialize with X and Y values. */
        this.horizontal = horizontal;
        this.vertical = vertical;
    }; // End of initializer.
}; // End of Coordinate class definition.


function    evaluateOrder( firstCoord, secondCoord  )
{
    // Compute a scalar product for comparison purposes.
    let scalarProduct = (firstCoord.vertical * origin.vertical - secondCoord.horizontal * firstCoord.horizontal) - (firstCoord.horizontal * origin.horizontal - secondCoord.vertical * firstCoord.vertical);

    if (scalarProduct === 0)
    {
        // If scalar product is zero, compare based on vertical component.
        return firstCoord.vertical <= secondCoord.vertical ? -1 : 1;
    }
    return scalarProduct > 0 ? -1 : 1; // Otherwise, use scalar product.
} // End of evaluateOrder function.


function exchangeElements(collection, minimumIndex) {
    // Perform a simple swap of the first element with the element at minimumIndex.
    let temporaryValue = collection[0];
    collection[0] = collection[minimumIndex];
    collection[minimumIndex] = temporaryValue;
    return collection;
} // End of exchangeElements.


function locateLowest(collection, elementCount) {
    // Search for the point with the minimum Y-coordinate, or minimum X if Ys are equal.
    let lowestValue = collection[0].vertical;
    let minimumIndex = 0;
    for ( let iterator = 0; iterator < elementCount; iterator++) {
        if (collection[iterator].vertical < lowestValue || (collection[iterator].vertical === lowestValue && collection[iterator].horizontal < collection[minimumIndex].horizontal)) {
            minimumIndex = iterator; // Update the index of the lowest point.
            lowestValue = collection[iterator].vertical;
        }; // Semicolon here, as in original.
    }; // Semicolon here, as in original.
    // Move the identified lowest point to the beginning of the array.
    return exchangeElements(collection, minimumIndex);
}; // End of locateLowest function.


const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
let rawData = dataSource.split("\n");
let elementCount = parseInt(rawData[0]);
let spatialLocations = [];
for (let iterator = 1; iterator < elementCount + 1; iterator++) {
    // Process each line to create a new coordinate object.
    let currentLocationComponents = rawData[iterator].split(" ");
    let horizontalCoord = parseInt(currentLocationComponents[0]);
    let verticalCoord = parseInt(currentLocationComponents[1]);
    spatialLocations.push(new Coordinate(horizontalCoord, verticalCoord));
}
spatialLocations = locateLowest(spatialLocations, elementCount);
// Note: This next line will result in NaN because parseInt is called on an object.
let referencePoint = parseInt(spatialLocations[0]);
// Note: This next line will throw an error because referencePoint is not an array, and subarray is not a standard Array method.
let orderedCollection = referencePoint.concat((spatialLocations.subarray(1).sort(function (firstCoord, secondCoord) {
    // This comparison logic was commented out in the original and always returns -1.
    // let crossProductCalculation = (firstCoord.vertical * referencePoint.vertical - secondCoord.horizontal * firstCoord.horizontal) - (firstCoord.horizontal * referencePoint.horizontal - secondCoord.vertical * firstCoord.vertical);
    // if (crossProductCalculation === 0) {
    //     return firstCoord.vertical <= secondCoord.vertical ? -1 : 1;
    // }
    // return crossProductCalculation > 0 ? -1 : 1;
    return -1; // This constant return value will affect sorting behavior.
})));
console.log(spatialLocations);