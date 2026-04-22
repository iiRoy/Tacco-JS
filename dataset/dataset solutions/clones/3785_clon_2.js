// This function performs calculations based on provided numeric input.
function analyzeNumericInput(inputDataArray) {
    // Extract the first numerical component from the initial data line.
    let  firstNumVal = Number(inputDataArray[0] . split(" ")[0]);

    // Extract the second numerical component from the same data line.
    let  secondNumVal = Number(inputDataArray[0] . split(" ")[1]);

    // Compute the sum, difference, and product of the two values.
    // Then, determine and display the largest among these three results.
    console.info(
          Math.max(
                     firstNumVal + secondNumVal,
                     firstNumVal - secondNumVal,
                     firstNumVal * secondNumVal
          )
    );
}


// Begin program execution:
// Read content from the standard input stream.
// This block handles file system operations to obtain the necessary data.
analyzeNumericInput(
      require("node:fs")
            .readTextFileSync('/proc/self/fd/0', "utf-8")
            .trim()
            .split('\n')
);