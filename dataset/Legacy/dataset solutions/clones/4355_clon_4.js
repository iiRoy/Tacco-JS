const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const createInputIterator = (sourceLines) => {
  let currentPosition = 0;
  const totalEntries = sourceLines.length;

  return {
    fetchNext: () => {
      if (currentPosition >= totalEntries) {
        // Preserve exact error message from original
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      }
      return sourceLines[currentPosition++];
    },
    hasMoreEntries: () => currentPosition < totalEntries,
  };
};

const inputReader = createInputIterator(acquireSourceData());

// Helper to replicate original myconv's try-catch behavior
const safeTransformation = (transformFunction, inputItem) => {
  try {
    return transformFunction(inputItem);
  } catch (error) {
    return inputItem; // Return original input on error, as per myconv
  }
};

const parseInteger = (text) => parseInt(text, 10);
const parseStringSequence = (text) => text.split(" ");
const parseIntegerSequence = (text) => text.split(" ").map(Number);
const parseCharacterSequence = (text) => text.split("");

const retrieveNextLine = () => inputReader.fetchNext();

const retrieveNextIntegerLine = () => safeTransformation(parseInteger, retrieveNextLine());
const retrieveNextStringLineArray = () => safeTransformation(parseStringSequence, retrieveNextLine());
const retrieveNextIntegerLineArray = () => safeTransformation(parseIntegerSequence, retrieveNextLine());
const retrieveNextCharacterLineArray = () => safeTransformation(parseCharacterSequence, retrieveNextLine());

const outputToConsole = (content) => console.log(content);
const outputToError = (content) => console.error(content);

const executeGraphAnalysis = () => {
  const matrixSize = retrieveNextIntegerLine();
  const graphMatrix = Array.from({ length: matrixSize }, () => retrieveNextIntegerLineArray());

  let cumulativeEdgeWeight = graphMatrix.reduce(
    (rowAccumulator, currentRow) => rowAccumulator + currentRow.reduce((colAccumulator, value) => colAccumulator + value, 0),
    0
  );
  cumulativeEdgeWeight /= 2; // Each edge counted twice in sum

  let superfluousEdgeWeight = 0;
  let invalidGraphStructureDetected = false;

  // Utilize nested Array.from().some() for iteration with early exit,
  // replacing the original triple 'for' loop structure.
  Array.from({ length: matrixSize }).some((_, intermediateNodeIndex) => { // Corresponds to 'k'
    return Array.from({ length: matrixSize }).some((_, sourceNodeIndex) => { // Corresponds to 'i'
      return Array.from({ length: matrixSize }).some((_, destinationNodeIndex) => { // Corresponds to 'j'
        const directPathValue = graphMatrix[sourceNodeIndex][destinationNodeIndex];
        const indirectPathValue = graphMatrix[sourceNodeIndex][intermediateNodeIndex] + graphMatrix[intermediateNodeIndex][destinationNodeIndex];

        if (directPathValue > indirectPathValue) {
          outputToConsole(-1);
          invalidGraphStructureDetected = true;
          return true; // Exit inner loop (j)
        } else if (
          directPathValue === indirectPathValue &&
          sourceNodeIndex !== intermediateNodeIndex &&
          destinationNodeIndex !== intermediateNodeIndex
        ) {
          superfluousEdgeWeight += directPathValue;
        }
        return false; // Continue inner loop (j)
      });
      return invalidGraphStructureDetected; // Exit middle loop (i)
    });
    return invalidGraphStructureDetected; // Exit outer loop (k)
  });

  if (!invalidGraphStructureDetected) {
    superfluousEdgeWeight /= 2; // Each superfluous edge counted twice
    outputToConsole(cumulativeEdgeWeight - superfluousEdgeWeight);
  }
};

executeGraphAnalysis();
