function ProcessGridTransformation(inputDataString) {
  // This function takes raw input string, parses grid dimensions and element counts,
  // then constructs a grid string with alternating row order.

  // Step 1: Split the entire input string into individual lines.
  const lineSegments = inputDataString.split("\n");

  // Basic validation: Ensure there are at least three lines for dimensions, element types, and counts.
  if (lineSegments.length < 3) {
    console.error("Input processing error: Not enough lines provided in the input data.");
    return; 
  }

  // Parse grid dimensions (height and width) from the first line.
  // Using map(Number) ensures parsed values are numerical.
  const gridDimensionValues = lineSegments[0].split(" ").map(Number);
  const gridRows = gridDimensionValues[0]; // Corresponds to 'h' in the original code.
  const gridColumns = gridDimensionValues[1]; // Corresponds to 'w' in the original code.

  // Validate the parsed grid dimensions.
  if (isNaN(gridRows) || isNaN(gridColumns) || gridRows <= 0 || gridColumns <= 0) {
    console.error("Input parsing error: Invalid or non-positive grid dimensions detected.");
    return;
  }

  // Parse the count of distinct element types from the second line.
  const distinctElementCategoryCount = Number(lineSegments[1]); // Corresponds to 'n' in the original code.

  // Validate the count of distinct element types.
  if (isNaN(distinctElementCategoryCount) || distinctElementCategoryCount <= 0) {
    console.error("Input parsing error: Invalid or non-positive distinct element type count.");
    return;
  }

  // Parse the occurrence counts for each element type from the third line.
  // These indicate how many times each element (1, 2, ..., distinctElementCategoryCount) appears.
  const elementOccurrenceQuantities = lineSegments[2].split(" ").map(Number);

  // Validate that the number of provided occurrence counts matches the declared distinct element types.
  if (elementOccurrenceQuantities.length !== distinctElementCategoryCount) {
    console.error("Input parsing error: Mismatch between declared distinct element types and provided occurrence quantities.");
    return;
  }

  // Step 2: Generate the complete flattened sequence of elements.
  // This sequence will be used to populate the grid cells.
  const fullElementSequence = []; // Corresponds to 'a' in the original code.

  for (let categoryIndex = 0; categoryIndex < distinctElementCategoryCount; categoryIndex++) {
    const currentElementIdentifier = categoryIndex + 1; // Element IDs are 1-indexed.
    const numberOfTimesToRepeat = elementOccurrenceQuantities[categoryIndex]; // Corresponds to 'x' in the original code.

    // Validate individual occurrence counts.
    if (isNaN(numberOfTimesToRepeat) || numberOfTimesToRepeat < 0) {
      console.error(`Input data error: Invalid occurrence count for element category ${currentElementIdentifier}.`);
      return;
    }

    // Add the current element identifier to the sequence the specified number of times.
    for (let repeatCounter = 0; repeatCounter < numberOfTimesToRepeat; repeatCounter++) {
      fullElementSequence.push(currentElementIdentifier);
    }
  }

  // Critical validation: Ensure the total number of generated elements exactly fills the grid.
  const totalGridCellCapacity = gridRows * gridColumns;
  if (fullElementSequence.length !== totalGridCellCapacity) {
    console.error(`Data integrity error: Generated element sequence length (${fullElementSequence.length}) does not match the total grid cell capacity (${totalGridCellCapacity}).`);
    return;
  }

  // Step 3: Construct the final grid output by formatting each row.
  // Rows will be stored as strings in this array before final joining.
  const constructedGridOutputLines = []; // Conceptually replaces 'anssub'

  let sequenceReadPointer = 0; // A pointer to track the current position in 'fullElementSequence'.

  for (let rowIterator = 0; rowIterator < gridRows; rowIterator++) {
    const currentRowCellValues = []; // Temporary array to hold elements for the current row.

    // Extract elements for the current row from the flattened sequence.
    for (let colIterator = 0; colIterator < gridColumns; colIterator++) {
      currentRowCellValues.push(fullElementSequence[sequenceReadPointer + colIterator]);
    }
    
    // Advance the pointer for the next row.
    sequenceReadPointer += gridColumns;

    let formattedRowRepresentation;
    // Apply alternating row order logic based on the row index.
    if (rowIterator % 2 === 0) {
      // For even-indexed rows, elements are joined in their natural left-to-right order.
      formattedRowRepresentation = currentRowCellValues.join(' ');
    } else {
      // For odd-indexed rows, elements are effectively arranged right-to-left.
      // This is achieved by reversing the array of elements before joining them.
      formattedRowRepresentation = currentRowCellValues.reverse().join(' ');
    }
    constructedGridOutputLines.push(formattedRowRepresentation);
  }

  // Step 4: Combine all formatted row strings into a single output string,
  // using newline characters to separate each row. This method naturally avoids
  // a trailing newline that would need to be sliced off.
  const finalFormattedGridResult = constructedGridOutputLines.join('\n'); // Corresponds to 'ans' in the original code.

  // Output the final grid string to the console.
  console.log(finalFormattedGridResult);
}

// The entry point for execution: reads input from standard input and passes it to the main processing function.
ProcessGridTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));