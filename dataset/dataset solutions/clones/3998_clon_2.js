// This function processes the given raw data to calculate a specific result.
function ProcessInput(rawData) {
  // Destructure the raw data string into two numeric values after splitting by space.
  var [firstValue, secondValue] = rawData.split(" ");

  // Perform a complex calculation based on the values and log the result.
  // The logic handles special cases where either value is 1, or both are 1.
  console.log(
    (firstValue == 0x1 || secondValue == 0x1)
      ? (
          (firstValue == secondValue)
            ? 0x0 // If both are 1, result is 0.
            : Math.max(firstValue, secondValue) - 0b10 // If one is 1, result is max - 2.
        )
      : (
          firstValue * secondValue - ( (firstValue - 0x2) * 0b10 + (secondValue - 0x2) * 0x2 ) - 0b100 // General case calculation.
        )
  );
}

// Read input from standard input, trim whitespace, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
