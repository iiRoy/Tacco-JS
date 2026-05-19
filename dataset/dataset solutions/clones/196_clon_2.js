require("fs")
  // Read the entire content from standard input as a UTF-8 string.
  .readFileSync("/dev/stdin", "utf8")
  // Split the input string by any whitespace character into an array of strings.
  .split(/\s/)
  // Iterate over each string element in the array.
  .map(function(inputWeightString) {
    // Convert the current string element to a numeric value.
    // The unary plus operator (`+`) is used for this conversion.
    // This also assigns the numeric value to 'numericWeightValue'.
    let numericWeightValue = +inputWeightString;

    // Use a ternary operator to check if 'numericWeightValue' is a truthy number (i.e., not 0 or NaN).
    // If it's a valid, non-zero number, proceed to determine and log the boxing category.
    // Otherwise (if it's 0, NaN, or falsy), do nothing (the '0' acts as a no-op).
    numericWeightValue
      ? console.log(
          // Nested ternary operators to classify the weight into boxing categories.
          numericWeightValue <= 48
            ? 'light fly' // Up to 48 kg
            : numericWeightValue <= 51
            ? 'fly' // Up to 51 kg
            : numericWeightValue <= 54
            ? 'bantam' // Up to 54 kg
            : numericWeightValue <= 57
            ? 'feather' // Up to 57 kg
            : numericWeightValue <= 60
            ? 'light' // Up to 60 kg
            : numericWeightValue <= 64
            ? 'light welter' // Up to 64 kg
            : numericWeightValue <= 69
            ? 'welter' // Up to 69 kg
            : numericWeightValue <= 75
            ? 'light middle' // Up to 75 kg
            : numericWeightValue <= 81
            ? 'middle' // Up to 81 kg
            : numericWeightValue <= 91
            ? 'light heavy' // Up to 91 kg
            : 'heavy' // Over 91 kg
        )
      : 0; // No operation if 'numericWeightValue' is falsy (e.g., 0 or NaN).
  });
