function Main(    input    ) {
  // --- Start of Main function execution ---

  // Split the input string by newline characters to get individual lines.
  input = input.split("\n");

  // Extract H (height) and W (width) from the first line of input.
  // The `-0` converts the string to a number.
  const H = input[0].split(" ")[0] - 0;
  const W = input[0].split(" ")[1] - 0;

  // Initialize an array to store the counts of cells with 0 to 9 'true' neighbors.
  // The array is pre-filled with zeros.
  var answer = new Array(10);
  answer.fill(0);

  // Initialize the count for 0 'true' neighbors.
  // This represents the initial state where all inner cells are 'false'.
  answer[0] = (H - 2) * (W - 2);

  // If there's only one line of input, it means no cells are marked 'true'.
  // In this case, just print the initial answer array and exit.
  if (input.length === 1) {
    console.log(answer.join("\n"));
    return;
  }

  // Create a 2D array (H x W) to represent the grid.
  // All cells are initially set to `false`.
  var array = new Array(H);

  for (var i = 0; i < H; i++) {
    array[i] = new Array(W);
    array[i].fill(false); // Initialize all cells in this row to false.
  }

  // Declare temporary variables for processing input and counting neighbors.
  var temp;
  var counter;


  // Iterate through the input lines, starting from the second line (index 1).
  // Each line after the first specifies a cell to be marked 'true'.
  for (var i = 1; i < input.length; i++) {

    // Split the current input line to get the coordinates of the cell.
    temp = input[i].split(" ");

    // Decrement the coordinates by 1 to convert them to 0-indexed values.
    [0, 1].forEach(e => {
      temp[e] -= 1;
    });

    // Mark the specified cell in the 2D array as 'true'.
    array[temp[0]][temp[1]] = true;


    // Now, update the `answer` array based on the change.
    // Iterate through a 3x3 neighborhood around the newly marked cell (temp[0], temp[1]).
    [-1, 0, 1].forEach(a => {
      [-1, 0, 1].forEach(b => {
        // Check if the current neighbor cell (temp[0]+a, temp[1]+b) is within the
        // inner grid boundaries (excluding the outermost border cells).
        if (1 <= a + temp[0] && a + temp[0] < H - 1 && 1 <= b + temp[1] && b + temp[1] < W - 1) {
          // If it's an inner cell, recalculate its 'true' neighbors.
          counter = 0;

          // Iterate through the 3x3 neighborhood of the current inner cell.
          [-1, 0, 1].forEach(c => {
            [-1, 0, 1].forEach(d => {
              // Increment counter if the neighbor cell is 'true'.
              counter += array[temp[0] + a + c][temp[1] + b + d] ? 1 : 0;
            });
          });

          // Adjust the `answer` array:
          // Decrement the count for the old number of 'true' neighbors (before the current cell was marked).
          answer[counter - 1]--;
          // Increment the count for the new number of 'true' neighbors.
          answer[counter]++;
        }
      });
    });
  }

  // Print the final `answer` array, with each element on a new line.
  console.log(answer.join("\n"));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));