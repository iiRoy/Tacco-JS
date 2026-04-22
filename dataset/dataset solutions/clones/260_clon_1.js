/*
 * This section defines global variables used throughout the program.
 * These variables store configuration settings and processed data.
 */

// Configuration settings object.
// It will hold values like the number of lines, start and end points, and steps.
var input = {};

/*
 * This is a 2D rectangular array, which stores the grid data.
 * Each element in the array represents a segment of a horizontal bar:
 *   -1: Indicates the right side of a horizontal bar.
 *    0: Indicates no horizontal bar.
 *    1: Indicates the left side of a horizontal bar.
 */
var data = [];

// This function is designed to trace a path from a given starting point.
// It simulates movement through the 'data' grid.
var f = function (startLine, startStep) {
  // If startStep is not provided or is falsy, initialize it to 0.
  if (
    !startStep
  ) {
    startStep = 0;
  }

  // 'now' tracks the current line position.
  var now = startLine;

  // 'result' will store the sequence of line positions traversed.
  var result = [
    now
  ];

  /*
   * Iterate through the grid data starting from 'startStep'
   * up to the total number of rows in 'data'.
   */
  for (
    var y = startStep;
    y < data.length;
    y++
  ) {
    // Update the current line position based on the grid data at the current row 'y'.
    now += data[y][now];

    // Add the new position to the result path.
    result.push(now);
  }

  // Return the complete traced path.
  return result;
};

/*
 * This function determines a path by tracing backward from an end line.
 * The returned path will be ordered from start to end.
 */
var rf = function (endLine) {
  // 'now' tracks the current line position, starting from the 'endLine'.
  var now = endLine;

  // 'result' will store the sequence of line positions traversed in reverse.
  var result = [now];

  /*
   * Iterate backward through the grid data, from the last row
   * down to the first row (index 0).
   */
  for (
    var y = data.length - 1;
    y >= 0;
    y--
  ) {
    // Update the current line position based on the grid data.
    // Note: This logic for backward traversal also uses '+=' due to the definition of data values.
    now += data[y][now];

    // Add the new position to the result path.
    result.push(
      now
    );
  }

  // Reverse the path to get it in chronological order (start to end) and return it.
  return result.reverse();
};

/*
 * This array will temporarily store each line of input read from stdin.
 */
var lines = [];

// Resume the stdin stream to start listening for input.
process.stdin.resume();

// Set the encoding for the stdin stream to UTF-8.
process.stdin.setEncoding(
  'utf8'
);

/*
 * Event listener for incoming 'data' chunks from stdin.
 * Each chunk is processed, trimmed, split into individual lines,
 * and then each line is added to the 'lines' array.
 */
process.stdin.on('data', function (chunk) {
  chunk
    .trim()
    .split(
      '\n'
    )
    .forEach(
      function (line) {
        lines.push(
          line
        );
      }
    );
});

/*
 * Event listener for the 'end' of the stdin stream.
 * This function contains the main logic to process all received input
 * and compute the final result.
 */
process.stdin.on('end', function () {
  // Initialize the result string; it will hold the final output.
  var result = "";

  /*
   * Initialize or reset the global 'input' and 'data' structures
   * before processing the new set of lines.
   */
  input = {};
  data = [];

  /*
   * Loop through each line collected from standard input.
   * This loop handles both configuration parsing and grid data population.
   */
  for (
    var i = 0;
    i < lines.length;
    i++
  ) {
    var e = lines[i];

    // If a line contains "0", it signifies the end of input for the current test case.
    // In this context, it acts as an early exit for the entire processing.
    if (
      e == "0"
    ) {
      return false;
    }

    // Define the expected order of configuration parameters.
    // These are "lines", "start", "end", and "steps".
    def = [
      "lines",
      "start",
      "end",
      "steps"
    ];

    /*
     * If the current line index 'i' is less than the number of defined parameters,
     * it means this line is a configuration value.
     */
    if (
      i < def.length
    ) {
      // Parse the line as an integer and assign it to the corresponding input parameter.
      input[def[i]] = parseInt(e);

      // After processing a configuration line, exit the 'end' event handler.
      // This 'return' statement is crucial and indicates that configuration lines
      // are handled separately and do not contribute to the 'data' array.
      return;
    }

    // This block is executed for lines where i >= def.length, meaning they are grid data.
    // var i; // This 'i' is local to the outer loop.
    /*
     * The following lines (i > 4, as def.length is 4) represent the actual grid data.
     * Each line describes a row in the 'data' array.
     */
    var line = [];

    // Loop to parse individual characters of the current line 'e' into the 'line' array.
    // The loop runs 'input.lines - 1' times because the last element is derived.
    for (
      var i = 0;
      i < input.lines - 1;
      i++
    ) {
      // Parse the character at index 'i' of the current input line 'e' into an integer.
      var c = parseInt(e.charAt(i));

      /*
       * Special rule for horizontal bars:
       * If it's not the first element (i > 0), and the current character 'c' is 0,
       * and the previous element in 'line' was 1 (left side of a bar),
       * then this '0' actually represents the right side of that bar (-1).
       */
      if (
        i > 0 &&
        c == 0 &&
        line[i - 1] == 1
      ) {
        c = -1;
      }

      // Add the processed character value to the current 'line' array.
      line.push(
        c
      );
    }

    /*
     * After processing the characters from the input line,
     * determine the last element of the 'line' array.
     * If the second-to-last element was 1 (left side of a bar),
     * the last element must be -1 (right side of a bar). Otherwise, it's 0.
     */
    line.push(
      (line[line.length - 1] == 1) ? -1 : 0
    );

    // Add the completed 'line' (representing a row of grid data) to the global 'data' array.
    data.push(line);
  }

  /*
   * Adjust the 'start' and 'end' input values from 1-based indexing (user input)
   * to 0-based indexing (internal array representation).
   */
  input.start -= 1;
  input.end -= 1;

  /*
   * Calculate the forward route starting from 'input.start'.
   * The 'f' function traces the path through the 'data' grid.
   */
  var route = f(input.start);

  /*
   * Check if the end point of the calculated 'route' matches the desired 'input.end'.
   * If they match, it means a direct path already exists.
   */
  if (
    route[route.length - 1] == input.end
  ) {
    // If a direct path exists, output "0" and terminate.
    console.log("0");
    return;
  }

  /*
   * Calculate the reverse route, tracing backward from 'input.end'.
   * The 'rf' function provides a path that would lead to 'input.end'.
   */
  var gRoute = rf(input.end);

  /*
   * Iterate through possible steps to find a potential modification point.
   * This loop attempts to find a step 'y' where a new connection could be made.
   */
  for (
    var y = 0;
    y < input.steps;
    y++
  ) {
    /*
     * Condition to find a suitable connection point:
     * 1. The absolute difference between the current positions in 'route' and 'gRoute' at step 'y' is 1,
     *    meaning they are adjacent lines.
     * 2. There is no horizontal bar at the 'route' position at step 'y' (data[y][route[y]] == 0).
     * 3. There is no horizontal bar at the 'gRoute' position at step 'y' (data[y][gRoute[y]] == 0).
     * This combination indicates that a horizontal bar can be placed to connect the two paths.
     */
    if (
      Math.abs(route[y] - gRoute[y]) == 1 &&
      data[y][route[y]] == 0 &&
      data[y][gRoute[y]] == 0
    ) {
      // If such a point is found, format the result string:
      // (step number + 1) + " " + (minimum line position + 1)
      // The '+1' is for converting back to 1-based indexing for output.
      result = (y + 1) + " " + (Math.min(route[y], gRoute[y]) + 1);

      // Once a connection point is found, break out of the loop.
      break;
    }
  }

  /*
   * If no suitable connection point was found after checking all steps,
   * the 'result' string will still be empty. In this case, output "1".
   * This signifies that a single modification is not sufficient or possible.
   */
  if (
    result == ""
  ) {
    result = "1";
  }

  // Output the final computed result to the console.
  console.log(
    result
  );
});