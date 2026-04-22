'use strict';
(function(sourceInput) {

  // Helper function to recursively create N-dimensional arrays
  const makeContainer = (dim1, dim2, dim3, initialValue) =>
    Array.from({ length: dim1 }).reduce((accOuter, _, idxOuter) => {
      accOuter[idxOuter] = Array.from({ length: dim2 }).reduce((accMiddle, _, idxMiddle) => {
        accMiddle[idxMiddle] = Array.from({ length: dim3 }).fill(initialValue);
        return accMiddle;
      }, []);
      return accOuter;
    }, []);

  // Function to construct the initial data grid
  const forgeComplexStructure = (primaryDimension, secondaryDimension, tertiaryDimension) => {
    const initialUnitState = 0;
    const coreArrangement = makeContainer(primaryDimension, secondaryDimension, tertiaryDimension, initialUnitState);
    const boundarySeparator = '#'.repeat(tertiaryDimension * 2); // Different method for separator string
    return [boundarySeparator, ...coreArrangement]; // Use spread operator for array concatenation
  };

  // Function to apply modifications and generate the final textual representation
  const modifyAndVisualizeArrangement = (initialScheme, modificationRecords) => {
    const structuralDivider = initialScheme.shift(); // Extract the separator line

    // Create a deep copy of the numerical grid data for modifications
    // Manual mapping for deep copy to avoid modifying original array references
    const currentScheme = initialScheme.map(outerBlock =>
      outerBlock.map(middleBlock =>
        middleBlock.slice() // Create a shallow copy of the innermost array (rooms/spaces)
      )
    );

    // Apply updates from modification records using forEach and direct assignment
    modificationRecords.forEach(record => {
      const [outerIndex, middleIndex, innerIndex, newValue] = record;
      // Adjusting to 0-based indexing for array access
      currentScheme[outerIndex - 1][middleIndex - 1][innerIndex - 1] = newValue;
    });

    // Generate the formatted output string using nested reduce for aggregation
    const finalRepresentation = currentScheme.reduce((complexAccumulator, outerBlock, outerBlockIdx) => {
      const outerBlockString = outerBlock.reduce((middleAccumulator, middleBlock, middleBlockIdx) => {
        const innerBlockString = ' ' + middleBlock.join(' '); // Format inner level
        return middleAccumulator + (middleBlockIdx > 0 ? '\n' : '') + innerBlockString;
      }, ''); // Initial empty string for the first middleBlock

      return complexAccumulator + (outerBlockIdx > 0 ? '\n' + structuralDivider + '\n' : '') + outerBlockString;
    }, ''); // Initial empty string for the first outerBlock

    return finalRepresentation;
  };

  // Function to acquire and parse input data
  const acquireSourceData = (rawTextContent) => {
    const textLines = rawTextContent.toString().trim().split('\n');
    const numericalData = textLines.map(line =>
      line.split(' ').map(valStr => parseInt(valStr, 10)) // Explicitly use parseInt
    );
    numericalData.shift(); // Discard the first line as per original logic (dimensions are hardcoded elsewhere)
    return numericalData;
  };

  // Main execution block
  const processedInputRecords = acquireSourceData(sourceInput);
  // Hardcoded dimensions (4, 3, 10) as in the original code's function call
  const result = modifyAndVisualizeArrangement(forgeComplexStructure(4, 3, 10), processedInputRecords);
  console.log(result);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));