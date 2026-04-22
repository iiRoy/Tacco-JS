((rawData) => {
  // A helper function to assign a segment ID to a cell or retrieve an existing one.
  // It handles propagation logic: if the cell is empty, assign the current ID;
  // if it's not empty, use its existing ID as the new current ID for propagation.
  const assignOrRetrieveIdentifier = (
    targetGrid, // The 2D array representing the grid
    rowCoord, // Row index
    colCoord, // Column index
    propagatingValue // The segment ID to propagate
  ) => {
    // Check if the cell at [rowCoord][colCoord] already has a non-zero identifier.
    if (targetGrid[rowCoord][colCoord] !== 0) {
      // If it does, that's the identifier for this segment.
      // We return it as the new propagating value for subsequent cells.
      return targetGrid[rowCoord][colCoord];
    } else if (propagatingValue !== 0) {
      // If the cell is empty (0) but we have a valid propagating value,
      // assign this value to the cell and return it.
      targetGrid[rowCoord][colCoord] = propagatingValue;
      return propagatingValue;
    } else {
      // If both the cell and the propagating value are 0, nothing changes.
      // Return 0, indicating no segment ID is currently active.
      return 0;
    }
  };

  // --- Input Parsing and Validation ---

  // Split the raw input into lines. The first line contains dimensions, the rest are grid data.
  let inputLines = rawData.trim().split('\n');

  // Check for empty input after trimming.
  if (inputLines.length === 0 || inputLines[0].length === 0) {
      return ''; // Return empty string for no input.
  }

  // Extract dimensions and the unused 'K' value from the first line.
  const dimensionTokens = inputLines.shift().split(' ');

  // Parse height, width, and the 'K' value. Using unary plus for type conversion.
  const gridHeight = +dimensionTokens[0];
  const gridWidth = +dimensionTokens[1];
  const minimumChocoPieces = +dimensionTokens[2]; // This variable remains largely unused in the original logic.

  // Basic validation for dimensions.
  if (Number.isNaN(gridHeight) || Number.isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
      // In a Type III clone, we can introduce error handling or default behavior.
      // Here, we'll return an empty grid representation.
      // console.error("Invalid grid dimensions provided. Returning empty grid.");
      return '';
  }

  // The remaining lines are the grid data.
  const gridDataRows = inputLines;

  // Validate that the number of provided grid rows matches the declared height.
  if (gridDataRows.length !== gridHeight) {
      // console.error(`Mismatch: Declared height ${gridHeight}, but received ${gridDataRows.length} rows. Returning empty grid.`);
      return ''; // Return empty or handle error.
  }

  // --- Grid Initialization ---

  // Initialize the result grid with zeros.
  // Using nested loops for initialization, a common alternative to Array.from/map.
  const processedSegmentGrid = [];
  for (let r = 0; r < gridHeight; ++r) {
    const currentRowArray = [];
    for (let c = 0; c < gridWidth; ++c) {
      currentRowArray.push(0);
    }
    processedSegmentGrid.push(currentRowArray);
  }

  // Counter for the next available unique segment identifier.
  // Starting from 0; it will be incremented before the first assignment,
  // so the first ID will be 1.
  let nextAvailableSegmentId = 0;

  // --- First Pass: Row-wise Processing (Left-to-Right then Right-to-Left) ---
  // This pass identifies individual chocolate pieces ('#') and propagates their IDs
  // horizontally within each row.

  for (let rIdx = 0; rIdx < gridHeight; ++rIdx) {
    let currentPropagatingId = 0; // ID currently being propagated in this row.
    const sourceRowString = gridDataRows[rIdx]; // Get the string for the current row.

    // Validate row length.
    if (sourceRowString.length !== gridWidth) {
        // console.warn(`Row ${rIdx} has length ${sourceRowString.length}, expected ${gridWidth}. This row might be processed incorrectly.`);
        // For robustness, one might pad or truncate `sourceRowString` here.
        // For this clone, we'll proceed as is, relying on subsequent checks or JS behavior.
    }

    // Pass 1.1: Left-to-Right propagation within the current row.
    for (let cIdx = 0; cIdx < gridWidth; ++cIdx) {
      // If a chocolate piece is found, assign it a new unique ID.
      if (sourceRowString[cIdx] === '#') {
        nextAvailableSegmentId++; // Increment ID counter.
        currentPropagatingId = nextAvailableSegmentId; // Use the new ID for propagation.
      }
      // Assign the current propagating ID to the cell.
      // If no '#' was found yet in this row, currentPropagatingId remains 0.
      processedSegmentGrid[rIdx][cIdx] = currentPropagatingId;
    }

    // Pass 1.2: Right-to-Left propagation within the current row.
    // This ensures that any empty cells to the left of an identified piece
    // also receive its ID, effectively "filling" the segment leftwards.
    // Reset currentPropagatingId to ensure it starts fresh for the backward pass,
    // picking up the latest ID from the rightmost non-zero cell.
    currentPropagatingId = 0;

    for (let cIdx = gridWidth - 1; cIdx >= 0; --cIdx) {
      // Use the helper function to either retrieve an existing ID or assign the current one.
      // The result becomes the new currentPropagatingId for the next iteration.
      currentPropagatingId = assignOrRetrieveIdentifier(
        processedSegmentGrid,
        rIdx,
        cIdx,
        currentPropagatingId
      );
      // The helper function already updates processedSegmentGrid[rIdx][cIdx] if an assignment occurs.
    }
  }

  // --- Second Pass: Column-wise Processing (Top-to-Bottom then Bottom-to-Top) ---
  // This pass propagates segment IDs vertically, ensuring that segments extend
  // throughout their entire column.

  for (let cIdx = 0; cIdx < gridWidth; ++cIdx) {
    let currentPropagatingId = 0; // ID currently being propagated in this column.

    // Pass 2.1: Top-to-Bottom propagation within the current column.
    for (let rIdx = 0; rIdx < gridHeight; ++rIdx) {
      // Use the helper function. This will fill empty cells downwards,
      // or pick up an existing ID to propagate further.
      currentPropagatingId = assignOrRetrieveIdentifier(
        processedSegmentGrid,
        rIdx,
        cIdx,
        currentPropagatingId
      );
    }

    // Pass 2.2: Bottom-to-Top propagation within the current column.
    // This ensures any empty cells above an identified piece also receive its ID.
    // Reset currentPropagatingId for the backward pass.
    currentPropagatingId = 0;

    for (let rIdx = gridHeight - 1; rIdx >= 0; --rIdx) {
      currentPropagatingId = assignOrRetrieveIdentifier(
        processedSegmentGrid,
        rIdx,
        cIdx,
        currentPropagatingId
      );
    }
  }

  // --- Output Formatting ---

  // Convert the 2D array of segment IDs into a newline-separated string,
  // with each row's numbers space-separated.
  // Using a traditional loop to build the string, instead of map/join chaining,
  // for a more explicit construction.
  let outputStringFragments = [];
  for (let rIdx = 0; rIdx < gridHeight; ++rIdx) {
      outputStringFragments.push(processedSegmentGrid[rIdx].join(' '));
  }

  // Finally, join all row strings with newline characters.
  return outputStringFragments.join('\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8'));