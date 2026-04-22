const analyzeNumericalPairs = (sourceTextData) => {
  // This function processes a multi-line string containing numerical data
  // to identify specific numeric relationships between its components.

  // --- Step 1: Data Acquisition and Initial Sanitization ---
  // The input string is first broken down into individual lines.
  // We assume the very first line is a header or metadata and is not used
  // in the numerical calculations, so it is discarded here.
  const [initialMetadataLine, ...rawNumericStringSegments] = sourceTextData.split('\n');

  // To enhance robustness, we filter out any empty or whitespace-only lines
  // that might arise from formatting inconsistencies or extra newlines in the input.
  const cleanStringSegments = rawNumericStringSegments.filter(segment => segment.trim() !== '');

  // --- Step 2: Numerical Conversion and Validation ---
  // Each cleaned string segment is then converted into a floating-point number.
  // `parseFloat` is used for this conversion.
  const potentiallyNumericValues = cleanStringSegments.map(strValue => parseFloat(strValue));

  // It's crucial to ensure that we are working with actual numbers.
  // Any values that failed conversion (resulting in NaN - Not a Number) are
  // explicitly removed from our working set.
  const validatedNumericCollection = potentiallyNumericValues.filter(num => !isNaN(num));

  // --- Step 3: Ordering the Data ---
  // The collection of valid numbers is then sorted in ascending order.
  // This systematic arrangement is beneficial for optimizing subsequent pair-wise comparisons
  // and for ensuring that each unique pair is considered only once.
  const orderedNumericElements = validatedNumericCollection.sort((valueOne, valueTwo) => valueOne - valueTwo);

  // --- Step 4: Core Algorithm - Identifying Integer Products ---
  // This array will serve as a repository for all 'secondary factors'
  // that satisfy the condition of forming an integer product with a 'primary factor'.
  const componentsFormingIntegerProducts = [];

  // We determine the total count of elements in our sorted array to define loop boundaries.
  const numberOfElements = orderedNumericElements.length;

  // The outer loop iterates through each number, designating it as the 'primary factor'.
  // A standard `for` loop is employed for explicit index management.
  for (let primaryElementIndex = 0; primaryElementIndex < numberOfElements; ++primaryElementIndex) {
    const currentPrimaryFactor = orderedNumericElements[primaryElementIndex];

    // The inner loop considers only those numbers that appear *after* the current
    // primary factor in the sorted list. This methodology prevents redundant checks
    // (e.g., checking (A*B) after (B*A)) and avoids self-multiplication (A*A).
    for (let secondaryElementIndex = primaryElementIndex + 1; secondaryElementIndex < numberOfElements; ++secondaryElementIndex) {
      const currentSecondaryFactor = orderedNumericElements[secondaryElementIndex];

      // Calculate the arithmetic product of the two selected factors.
      const calculatedProduct = currentPrimaryFactor * currentSecondaryFactor;

      // A dedicated helper function verifies if the computed product is an integer.
      // This improves readability and encapsulates the specific check.
      if (isResultingProductAnInteger(calculatedProduct)) {
        // If the product is indeed an integer, the 'secondary factor' is considered
        // a valid component and is added to our cumulative collection.
        componentsFormingIntegerProducts.push(currentSecondaryFactor);
      }
    }
  }

  // --- Step 5: Final Output ---
  // The problem's objective is to report the total quantity of 'secondary factors'
  // that met the integer product criterion. This count is printed to the console.
  console.log(componentsFormingIntegerProducts.length);
};

// --- Helper Function: Integer Verification ---
// This auxiliary function determines whether a given numerical value
// represents an integer. `Number.isInteger` is generally more reliable
// for floating-point results compared to the modulo operator (`% 1`).
const isResultingProductAnInteger = (valueToBeChecked) => Number.isInteger(valueToBeChecked);

// --- Execution Entry Point ---
// The program begins by synchronously reading all data from standard input (`/dev/stdin`).
// The content is interpreted as a UTF-8 string, and then passed to our
// main processing function `analyzeNumericalPairs`.
analyzeNumericalPairs(require("fs").readFileSync("/dev/stdin", "utf8"));