function createTwoDimensionalArray(rowCount, colCount, initialValue = 0) {
  if (rowCount < 0 || colCount < 0) {
    rowCount = Math.max(0, rowCount);
    colCount = Math.max(0, colCount);
  }

  const effectiveColCount = colCount === undefined || colCount === null ? rowCount : colCount;

  return Array.from({ length: rowCount }, () =>
    Array.from({ length: effectiveColCount }, () => initialValue)
  );
}

class InputParser {
  #sourceLines;
  #currentLineIndex;
  #currentLineTokens;

  constructor(inputString) {
    if (typeof inputString !== 'string') {
      throw new Error('InputParser requires a string as the source input.');
    }
    this.#sourceLines = inputString.split("\n");
    this.#currentLineIndex = 0;
    this.#currentLineTokens = [];
  }

  #parseNumericToken(tokenValue) {
    const numericValue = Number(tokenValue);
    if (isNaN(numericValue)) {
      // For this context, we return NaN which Number() does, but could add specific error handling.
    }
    return numericValue;
  }

  retrieveNextToken(asNumeric = false) {
    while (this.#currentLineTokens.length === 0) {
      if (this.#currentLineIndex >= this.#sourceLines.length) {
        return undefined; // No more lines left to read.
      }
      let currentLineContent = this.#sourceLines[this.#currentLineIndex];
      this.#currentLineIndex++;

      if (currentLineContent === undefined || currentLineContent.trim() === '') {
        continue; // Skip empty or whitespace-only lines.
      }
      this.#currentLineTokens = currentLineContent.trim().split(/\s+/);
    }

    const nextToken = this.#currentLineTokens.shift();
    return asNumeric ? this.#parseNumericToken(nextToken) : nextToken;
  }

  get_single_value(parseAsNumber) { return this.retrieveNextToken(parseAsNumber); }
  obtain_next_element(convertToNum) { return this.retrieveNextToken(convertToNum); }

  fetchLineTokens(convertAllToNumbers = false) {
    if (this.#currentLineIndex >= this.#sourceLines.length) {
      return [];
    }
    let currentLineContent = this.#sourceLines[this.#currentLineIndex];
    this.#currentLineIndex++;

    if (currentLineContent === undefined || currentLineContent.trim() === '') {
      return [];
    }

    const tokens = currentLineContent.trim().split(/\s+/);
    return convertAllToNumbers ? tokens.map(token => this.#parseNumericToken(token)) : tokens;
  }

  read_current_line(parseNumerics) { return this.fetchLineTokens(parseNumerics); }
  get_row_data(numericOutput) { return this.fetchLineTokens(numericOutput); }

  readMultiLineData(numberOfLines, convertToNumbers = false) {
    if (numberOfLines <= 0) {
      return [];
    }
    const resultingMatrix = [];
    for (let i = 0; i < numberOfLines; i++) {
      if (this.#currentLineIndex >= this.#sourceLines.length) {
        console.warn(`Not enough input lines for ${numberOfLines} entries. Processed ${i} lines only.`);
        break;
      }
      const currentLineContent = this.#sourceLines[this.#currentLineIndex];
      this.#currentLineIndex++;

      if (currentLineContent === undefined || currentLineContent.trim() === '') {
        resultingMatrix.push([]);
        continue;
      }
      const tokens = currentLineContent.trim().split(/\s+/);
      resultingMatrix.push(convertToNumbers ? tokens.map(token => this.#parseNumericToken(token)) : tokens);
    }
    return resultingMatrix;
  }

  populateGridFromCoordinates(gridDimensions, numberOfEntries) {
    const effectiveGridSize = Math.max(1, gridDimensions + 1);
    let targetGrid = createTwoDimensionalArray(effectiveGridSize, effectiveGridSize, 0);

    for (let i = 0; i < numberOfEntries; i++) {
      if (this.#currentLineIndex >= this.#sourceLines.length) {
        console.warn(`Not enough input lines for ${numberOfEntries} coordinate entries. Processed ${i}.`);
        break;
      }
      const lineData = this.fetchLineTokens(true);
      if (lineData.length < 2) {
        console.warn(`Line ${this.#currentLineIndex - 1} for coordinate entry did not contain enough data. Skipping.`);
        continue;
      }
      const rowCoord = lineData[0];
      const colCoord = lineData[1];

      if (rowCoord >= 0 && rowCoord < effectiveGridSize && colCoord >= 0 && colCoord < effectiveGridSize) {
        targetGrid[rowCoord][colCoord]++;
      } else {
        console.warn(`Coordinates [${rowCoord}, ${colCoord}] are out of bounds for a ${effectiveGridSize}x${effectiveGridSize} grid. Skipping.`);
      }
    }
    return targetGrid;
  }
}

let connection_set_alpha = [];
let connection_set_beta = [];

function find_set_representative(parentArray, elementId) {
  if (parentArray[elementId] === elementId) {
    return elementId;
  }
  parentArray[elementId] = find_set_representative(parentArray, parentArray[elementId]);
  return parentArray[elementId];
}

function are_elements_in_same_set(parentArray, elementX, elementY) {
  return find_set_representative(parentArray, elementX) === find_set_representative(parentArray, elementY);
}

function union_two_sets(parentArray, elementX, elementY) {
  let rootX = find_set_representative(parentArray, elementX);
  let rootY = find_set_representative(parentArray, elementY);

  if (rootX === rootY) {
    return;
  }
  parentArray[rootX] = rootY;
}

const standard_input_reader = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function execute_solution() {
  const total_elements = standard_input_reader.retrieveNextToken(true);
  const num_connections_A = standard_input_reader.retrieveNextToken(true);
  const num_connections_B = standard_input_reader.retrieveNextToken(true);

  if (isNaN(total_elements) || total_elements < 0 ||
      isNaN(num_connections_A) || num_connections_A < 0 ||
      isNaN(num_connections_B) || num_connections_B < 0) {
    console.error("Invalid initial input parameters (N, K, L). Please provide non-negative integers.");
    return "";
  }

  for (let i = 0; i <= total_elements; i++) {
    connection_set_alpha[i] = i;
    connection_set_beta[i] = i;
  }

  for (let connection_idx = 0; connection_idx < num_connections_A; connection_idx++) {
    const connection_pair = standard_input_reader.fetchLineTokens(true);
    if (connection_pair.length < 2) {
      console.warn(`Malformed connection line for set A at index ${connection_idx}. Skipping.`);
      continue;
    }
    union_two_sets(connection_set_alpha, connection_pair[0], connection_pair[1]);
  }

  for (let connection_idx = 0; connection_idx < num_connections_B; connection_idx++) {
    const connection_pair = standard_input_reader.fetchLineTokens(true);
    if (connection_pair.length < 2) {
      console.warn(`Malformed connection line for set B at index ${connection_idx}. Skipping.`);
      continue;
    }
    union_two_sets(connection_set_beta, connection_pair[0], connection_pair[1]);
  }

  const combined_root_identifiers = new Array(total_elements);
  const root_identifier_frequencies = {};

  for (let element_index = 0; element_index < total_elements; element_index++) {
    const current_element_id = element_index + 1;

    const root_in_alpha = find_set_representative(connection_set_alpha, current_element_id);
    const root_in_beta = find_set_representative(connection_set_beta, current_element_id);

    const composite_root_key = `${root_in_alpha},${root_in_beta}`;
    combined_root_identifiers[element_index] = composite_root_key;

    root_identifier_frequencies[composite_root_key] = (root_identifier_frequencies[composite_root_key] || 0) + 1;
  }

  const final_results_array = combined_root_identifiers.map(key => root_identifier_frequencies[key]);

  return final_results_array.join(" ");
}

console.log(execute_solution());