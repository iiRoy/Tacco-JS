/*
 * This section defines global configuration objects.
 * These objects will store various input parameters and the processed data.
 */

// Global object to hold input values.
// Initially, it's an empty object.
var input = {};


/*
 * This array will store the main data structure.
 * It's a 2D rectangular array, representing a grid or maze.
 * Elements can be -1 (right bar), 0 (empty), or 1 (left bar).
 */
var data = [];


/*
 * Function 'f' is responsible for tracing a path
 * starting from a given line and step.
 * It simulates movement through the 'data' grid.
 */
var f = function (startLine, startStep) {
  // If startStep is not provided or is falsy, initialize it to 0.
  if (!startStep) {
    startStep = 0;
  }

  // 'now' tracks the current position (column index).
  var now = startLine;

  // 'result' will store the sequence of positions forming the path.
  var result = [now];

  // Iterate through the 'data' array from the startStep.
  for (var y = startStep; y < data.length; y++) {
    // Update the current position based on the value in the data grid.
    // data[y][now] can be -1, 0, or 1, modifying 'now' accordingly.
    now += data[y][now];

    // Add the new position to the result path.
    result.push(now);
  }
  // The traced path is returned.
  return result;
};


/*
 * Function 'rf' traces a path backward from a specified end line.
 * The returned path is presented from start to end.
 */
var rf = function (endLine) {
  // 'now' represents the current position, starting from the end line.
  var now = endLine;

  // 'result' accumulates the path segments in reverse order.
  var result = [now];

  // Loop backward through the 'data' array, from bottom to top.
  for (var y = data.length - 1; y >= 0; y--) {
    // Adjust the current position based on the grid value.
    // Note: This operation is symmetric for reverse tracing.
    now += data[y][now];

    // Add the current position to the result.
    result.push(now);
  }
  // Reverse the accumulated path to get it in forward order (start to end).
  return result.reverse();
};



// Array to store lines read from standard input.
var lines = [];


// Begin reading from standard input.
process.stdin.resume();


// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');


// Event listener for incoming 'data' chunks from stdin.
process.stdin.on('data', function (chunk) {
  // Process each line in the chunk.
  // Trim whitespace, split by newline, then iterate.
  chunk
    .trim()
    .split('\n')
    .forEach(function (line) {
      // Add each processed line to the 'lines' array.
      lines.push(line);
    });
});


// Event listener for the 'end' of standard input stream.
process.stdin.on('end', function () {
  // Initialize 'result' string, which will hold the final output.
  var result = "";


  // Reset input and data for processing.
  input = {};
  data = [];


  // Loop through each line collected from standard input.
  for (var j = 0; j < lines.length; j++) {
    var e = lines[j];

    // A line containing "0" signifies the end of input data.
    if (e == "0") {
      break;
    }

    // Define the keys for input parameters.
    // These correspond to the first few lines of input.
    def = ["lines", "start", "end", "steps"];

    // Populate the 'input' object with initial configuration values.
    // These are parsed as integers.
    if (j < def.length) {
      input[def[j]] = parseInt(e);
      continue; // Move to the next line of input.
    }


    // This block processes grid data lines (beyond the initial configuration).
    var line = [];

    // Iterate to build a single row of the 'data' grid.
    for (var i = 0; i < input.lines - 1; i++) {
      // Parse character at index 'i' as an integer.
      var c = parseInt(e.charAt(i));

      // Special handling for adjacent bars: if a '0' follows a '1',
      // it means it's the right side of a horizontal bar, so set to -1.
      if (i > 0 && c == 0 && line[i - 1] == 1) {
        c = -1;
      }
      line.push(c);
    }

    // Determine the last element of the current line based on the previous one.
    // If the last element was 1 (left bar), the current is -1 (right bar); otherwise, 0.
    line.push(line[line.length - 1] == 1 ? -1 : 0);

    // Add the constructed line to the main 'data' array.
    data.push(line);
  }


  // Adjust 'start' and 'end' values to be 0-indexed.
  input.start -= 1;
  input.end -= 1;


  // Calculate the path from the starting point.
  var route = f(input.start);

  // Check if the end of the calculated route matches the target end.
  if (route[route.length - 1] == input.end) {
    console.log("0"); // If so, output "0" and exit.
    return;
  }

  // Calculate the reverse path from the target end point.
  var gRoute = rf(input.end);


  // Iterate through the specified number of steps to find a meeting point.
  for (var y = 0; y < input.steps; y++) {
    // Check if the current positions in both routes are adjacent (difference of 1)
    // AND both positions in the 'data' grid are empty (0).
    /* This condition identifies a potential point where a new horizontal bar could be placed */
    if (
      Math.abs(route[y] - gRoute[y]) == 1 &&
      data[y][route[y]] == 0 &&
      data[y][gRoute[y]] == 0
    ) {
      // If a suitable point is found, format the result:
      // (step number + 1) and (minimum column + 1).
      result = y + 1 + " " + (Math.min(route[y], gRoute[y]) + 1);
      break; // Exit the loop as the first suitable point is found.
    }
  }


  // If no suitable point was found, the 'result' remains empty.
  // In this case, set it to "1".
  if (result == "") {
    result = "1";
  }


  // Output the final result to the console.
  console.log(result);
});