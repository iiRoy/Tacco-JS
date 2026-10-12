const [nkData, asData] = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);
const [countN, countK] = nkData.split(/\s/).map(Number);
const initialValues = asData.split(/\s/).map(Number);

const primeModulus = BigInt(Math.pow(10, 9) + 7);

// Sort the entire array by absolute value in descending order.
// This mirrors the initial sorting strategy of the original code.
const absSortedDescending = [...initialValues].sort((a, b) => Math.abs(b) - Math.abs(a));

// Extract the first 'countK' elements, which are those with the largest absolute values.
const topKElements = absSortedDescending.slice(0, countK);

// Calculate the initial product of these 'countK' elements.
// Also, identify the positive and negative numbers among them to find the smallest absolute values.
const positiveElementsInTopK = topKElements.filter(val => val > 0);
const negativeElementsInTopK = topKElements.filter(val => val < 0);

const smallestAbsPositiveInTopK = positiveElementsInTopK.length > 0 ? Math.min(...positiveElementsInTopK) : null;
// For negatives, the "smallest absolute value" means the one closest to zero, which is the largest negative number.
const smallestAbsNegativeInTopK = negativeElementsInTopK.length > 0 ? Math.max(...negativeElementsInTopK) : null;

let currentCalculatedProduct = topKElements.reduce((accumulator, num) => accumulator * BigInt(num), 1n);

let finalResult = currentCalculatedProduct;

// If the initial product is negative, attempt to "fix" it by swapping one element.
if (currentCalculatedProduct < 0n) {
    // Get the elements not included in the initial 'countK' selection.
    const remainingElements = absSortedDescending.slice(countK);

    // Identify the positive and negative numbers among the remaining elements.
    // The largest absolute value positive/negative in remainingElements will be the first encountered due to sorting.
    const positiveElementsNotInTopK = remainingElements.filter(val => val > 0);
    const negativeElementsNotInTopK = remainingElements.filter(val => val < 0);

    const largestAbsPositiveNotInTopK = positiveElementsNotInTopK.length > 0 ? Math.max(...positiveElementsNotInTopK) : null;
    // For negatives, the "largest absolute value" means the one furthest from zero, which is the smallest negative number.
    const largestAbsNegativeNotInTopK = negativeElementsNotInTopK.length > 0 ? Math.min(...negativeElementsNotInTopK) : null;

    let swapOptionOneProduct = 0n; // Replace smallestAbsPositiveInTopK with largestAbsNegativeNotInTopK
    if (smallestAbsPositiveInTopK !== null && largestAbsNegativeNotInTopK !== null) {
        swapOptionOneProduct = currentCalculatedProduct / BigInt(smallestAbsPositiveInTopK) * BigInt(largestAbsNegativeNotInTopK);
    }

    let swapOptionTwoProduct = 0n; // Replace smallestAbsNegativeInTopK with largestAbsPositiveNotInTopK
    if (smallestAbsNegativeInTopK !== null && largestAbsPositiveNotInTopK !== null) {
        swapOptionTwoProduct = currentCalculatedProduct / BigInt(smallestAbsNegativeInTopK) * BigInt(largestAbsPositiveNotInTopK);
    }

    // Choose the maximum product from the two swap options.
    // If a swap is not possible (e.g., no positive to replace), its candidate product remains 0n.
    finalResult = (swapOptionOneProduct > swapOptionTwoProduct) ? swapOptionOneProduct : swapOptionTwoProduct;
}

// If the final product is 0 (either initially or after attempted fixes),
// fall back to calculating the product of the 'countK' smallest absolute value elements.
if (finalResult === 0n) {
    // Sort the original array by absolute value in ascending order.
    const absSortedAscending = [...initialValues].sort((a, b) => Math.abs(a) - Math.abs(b));

    // Take the first 'countK' elements (smallest absolute values) and calculate their product.
    let fallbackProduct = absSortedAscending.slice(0, countK).reduce((accumulator, num) => accumulator * BigInt(num), 1n);

    // Ensure the fallback product is non-negative by adding the modulus until it is.
    while (fallbackProduct < 0n) {
        fallbackProduct += primeModulus;
    }
    finalResult = fallbackProduct;
}

// Output the final result modulo the prime modulus.
console.log((finalResult % primeModulus).toString());
