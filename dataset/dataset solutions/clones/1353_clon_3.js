/*
 * This JavaScript module processes a raw string containing geometric measurements.
 * Its purpose is to compute and present the surface area and boundary length
 * for a rectangular shape based on two input dimensions.
 *
 * The input is expected to be a space-separated string of two numerical values.
 * Error handling is included for invalid or missing dimensions.
 */
(function(rawInputDataStream) {

    // Introduced constants for magic numbers and string literals
    const GEOMETRY_DELIMITER = ' ';
    const PERIMETER_FACTOR = 2;
    const DEFAULT_DIMENSION_VALUE = 0;

    // Renamed variable 'p' to 'dimensionSegments'
    // Added .trim() for robustness against leading/trailing whitespace
    let dimensionSegments = rawInputDataStream.trim().split(GEOMETRY_DELIMITER);

    // Enhanced input validation and sanitization
    // Original: implicitly relies on Number() for parsing
    // New: Explicit parseInt with radix, checks for NaN and negative values, applies default
    let primaryRectangleDimension; // Renamed 'length' to 'primaryRectangleDimension'
    let secondaryRectangleDimension; // Renamed 'width' to 'secondaryRectangleDimension'

    // Replaced direct array access with a more robust parsing check
    // and combined assignment with validation.
    if (dimensionSegments.length < PERIMETER_FACTOR) {
        console.warn('Warning: Insufficient dimension values provided. Expected 2, received ' + dimensionSegments.length + '. Defaulting to zero for missing dimensions.');
        primaryRectangleDimension = DEFAULT_DIMENSION_VALUE;
        secondaryRectangleDimension = DEFAULT_DIMENSION_VALUE;
    } else {
        let tempDimA = parseInt(dimensionSegments[0], 10); // Using parseInt with radix
        let tempDimB = parseInt(dimensionSegments[1], 10);

        // Guard clauses / sanitization for individual dimensions
        primaryRectangleDimension = (isNaN(tempDimA) || tempDimA < DEFAULT_DIMENSION_VALUE) ? DEFAULT_DIMENSION_VALUE : tempDimA;
        secondaryRectangleDimension = (isNaN(tempDimB) || tempDimB < DEFAULT_DIMENSION_VALUE) ? DEFAULT_DIMENSION_VALUE : tempDimB;

        // Added additional conditional logging for clarity on input issues
        if ((isNaN(tempDimA) || tempDimA < 0) || (isNaN(tempDimB) || tempDimB < 0)) {
            console.info('Info: One or both dimensions were invalid (non-numeric or negative) and have been adjusted to ' + DEFAULT_DIMENSION_VALUE + '.');
        }
    }

    // Renamed 'area' to 'computedSurfaceArea'
    const computedSurfaceArea = primaryRectangleDimension * secondaryRectangleDimension;

    // Renamed 'perimeter' to 'totalBoundaryLength'
    // Introduced an intermediate variable 'sumOfDistinctDimensions'
    // Original: `2 * (length + width)`
    // New: `PERIMETER_FACTOR * sumOfDistinctDimensions`
    const sumOfDistinctDimensions = primaryRectangleDimension + secondaryRectangleDimension;
    const totalBoundaryLength = PERIMETER_FACTOR * sumOfDistinctDimensions;

    // Changed output format from '%s %s' to template literal
    // Maintained the original "value value" output structure
    console.log(`${computedSurfaceArea} ${totalBoundaryLength}`);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));