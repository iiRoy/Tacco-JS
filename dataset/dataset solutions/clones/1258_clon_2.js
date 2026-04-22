// Establish the input stream for the Node.js environment.
process.stdin.resume();

// Configure the input stream to decode received data as UTF-8 text.
process.stdin.setEncoding('utf8');

// Attach an event handler to process incoming data chunks.
process.stdin.on('data',
  function
    (inputFragment) {

      // Parse the incoming data string: split by spaces and convert each part to a number.
      const numericalTokens = inputFragment.split(' ').map(Number);

      // Extract the first numerical token as the row dimension.
      let rowDimension = Number(numericalTokens[0]);

      // Extract the second numerical token as the column dimension.
      let colDimension = Number(numericalTokens[1]);

      // Check for the termination condition: if both dimensions are zero, exit the handler.
      if
        (rowDimension === 0
        && colDimension === 0)
      {
        return;
      }

      // Iterate through rows to construct the grid pattern.
      for (
        let currentHeightIndex = 0;
        currentHeightIndex < rowDimension;
        currentHeightIndex++
      ) {
        // Iterate through columns for each row.
        for (
          let currentWidthIndex = 0;
          currentWidthIndex < colDimension;
          currentWidthIndex++
        ) {
          // Output the grid character for the current position.
          console.log('#');
        }
        // After completing a row, output a newline character.
        console.log("\n");
      }
      // Output an additional newline after printing the entire grid.
      console.log("\n");
    }
);