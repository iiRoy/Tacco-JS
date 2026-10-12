var INPUT_PARSER = (function() {
  // This function serves as the public interface for creating a new parser instance.
  function createParser(sourceText) {
    return new TextProcessor(sourceText);
  }

  // The core class responsible for managing and parsing the input lines.
  function TextProcessor(inputString) {
    // Stores all input lines, trimmed and split by newline.
    this.linesData = inputString.trim().split("\n");
    // Keeps track of the current line being processed.
    this.currentLineIndex = 0;
  }

  // Method to extract a single data point (atom) from the current line.
  // It reads from the end of the line's word array.
  TextProcessor.prototype.readAtom = function(asString) {
    let lineSegments = this.linesData;
    let linePointer = this.currentLineIndex;
    let extractedValue;

    // If the current line hasn't been tokenized into words yet, do so and reverse it.
    // This allows `pop()` to effectively read from the beginning of the line.
    if (typeof lineSegments[linePointer] === "string") {
      lineSegments[linePointer] = lineSegments[linePointer].split(" ").reverse();
    }

    // Retrieve the last element (which is the next word due to reversal).
    extractedValue = lineSegments[linePointer].pop();

    // If the current line is now empty after popping, advance to the next line.
    if (!lineSegments[linePointer].length) {
      this.currentLineIndex++;
    }

    // Return the value either as a string or converted to a number.
    return asString ? extractedValue : +extractedValue;
  };

  // Method to read an entire line and parse its contents.
  TextProcessor.prototype.readLine = function(returnStrings) {
    // Get the current line, split it by spaces, and then advance the line index.
    let lineParts = this.linesData[this.currentLineIndex++].split(" ");
    // Return parts as strings or convert them all to numbers.
    return returnStrings ? lineParts : lineParts.map(item => +item);
  };

  // Method to read a block of lines and interpret them as a matrix.
  TextProcessor.prototype.readMatrix = function(numRows, keepStrings) {
    // Extract the specified number of rows and split each into cells.
    let matrixRows = this.linesData.slice(this.currentLineIndex, this.currentLineIndex += numRows)
                                   .map(rowStr => rowStr.split(" "));
    // If `keepStrings` is true, return as-is; otherwise, convert all cells to numbers.
    return keepStrings ? matrixRows : matrixRows.map(rowStr => rowStr.map(cellStr => +cellStr));
  };

  // Method to read a specified number of raw lines.
  TextProcessor.prototype.readRows = function(count, asRawStrings) {
    // Slice the required number of lines from the input data.
    let selectedRows = this.linesData.slice(this.currentLineIndex, this.currentLineIndex += count);
    // Return lines as raw strings or convert each line to a number.
    return asRawStrings ? selectedRows : selectedRows.map(rowContent => +rowContent);
  };

  return createParser;
})();

// Initialize the input processing utility by reading all data from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// This function is provided in the original code but not utilized by the main logic.
// It performs a binary search to find the upper bound of a target value in a sorted array.
function findUpperBoundIndex(dataArray, startIndex, endIndex, targetValue) {
  let midIndex;
  // Continue binary search as long as the search range is greater than 1.
  for (; 1 < endIndex - startIndex;) {
    // Calculate the middle index using bitwise OR for integer floor.
    midIndex = 0 | ((startIndex + endIndex) / 2);
    // Adjust search range based on comparison with the target value.
    if (dataArray[midIndex] <= targetValue) {
      startIndex = midIndex;
    } else {
      endIndex = midIndex;
    }
  }
  // Return the appropriate index after the loop terminates.
  return dataArray[startIndex] <= targetValue ? endIndex : startIndex;
}

// Execute the primary logic function and print its result to the console.
console.log(processGraphData());

// The main function that encapsulates the problem's solution logic.
function processGraphData() {
  // Read the total number of nodes (vertices) in the graph.
  let nodeCount = inputReader.readAtom();
  // Read the total number of edges in the graph.
  let edgeCount = inputReader.readAtom();

  // Create an array to store the degree of each node.
  // It's 1-indexed, so its size is `nodeCount + 1`.
  let degreeArray = Array(nodeCount + 1).fill(0);

  // Iterate through each edge to update the degrees of connected nodes.
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    // Read the two endpoints (nodes) connected by the current edge.
    let edgeEndpoints = inputReader.readLine();
    // Increment the degree for both nodes involved in the edge.
    degreeArray[edgeEndpoints[0]]++;
    degreeArray[edgeEndpoints[1]]++;
  }

  // Initialize a variable to accumulate a specific sum based on node degrees.
  let totalDegreeSum = 0;

  // Iterate through each node, starting from index 1.
  for (let vertexIndex = 1; vertexIndex <= nodeCount; vertexIndex++) {
    // Check if the degree of the current node is odd.
    // If any node has an odd degree, the condition is not met.
    if (degreeArray[vertexIndex] % 2 !== 0) {
      return "No"; // Immediately return "No" if an odd degree is found.
    }
    // Add (degree - 2) to the total sum for each node.
    totalDegreeSum += degreeArray[vertexIndex] - 2;
  }

  // Based on the final accumulated sum, return "Yes" or "No".
  return totalDegreeSum >= 4 ? "Yes" : "No";
}
