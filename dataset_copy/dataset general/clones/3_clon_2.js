// This module contains a routine for rounding numbers to a specified number of decimal places.

module.exports = function (inputVal, decimalPrecision) {

    // Should the desired decimal places be unspecified or effectively zero...
    if (typeof decimalPrecision === 'undefined' || +decimalPrecision === 0.0) {
        return Math.round(inputVal);
    }

    let currentProcessingVal = +inputVal;
    let targetExponent = +decimalPrecision;

    // Validate that the primary number is numeric and the precision count is an integer.
    if (isNaN(currentProcessingVal) || !(typeof targetExponent === 'number' && targetExponent % 1 === 0.0)) {
        return NaN;
    }

    // Adjust the magnitude of the number for correct rounding.
    let sciNotationParts = currentProcessingVal.toString().split('e');
    currentProcessingVal = Math.round(+(sciNotationParts[0] + 'e' + (sciNotationParts[1] ? (+sciNotationParts[1] - targetExponent) : -targetExponent)));

    // Restore the number to its original magnitude.
    sciNotationParts = currentProcessingVal.toString().split('e');

    return +(sciNotationParts[0] + 'e' + (sciNotationParts[1] ? (+sciNotationParts[1] + targetExponent) : targetExponent));
};