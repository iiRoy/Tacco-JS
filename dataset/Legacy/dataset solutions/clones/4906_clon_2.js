processInputData = (rawData) => {
  // Split the raw input string by spaces and convert each part to a number.
  let numericValues = rawData.split(" ").map(itemStr => {
    return Number(itemStr);
  });

  // Extract the three numerical components from the processed array.
  let firstVal = numericValues[0];
  let secondVal = numericValues[1];
  let thirdVal = numericValues[2];

  // Define an inner function to categorize the relationship between the three values.
  let determineCategory = () => {
    // Case 1: All three values are identical.
    if (firstVal === secondVal && firstVal === thirdVal) {
      return 1;
    }
    // Case 2: Exactly two values are identical.
    else if (firstVal === secondVal || firstVal === thirdVal || thirdVal === secondVal) {
      return 2;
    }
    // Case 3: All three values are distinct.
    else {
      return 3;
    }
  };

  // Output the result of the categorization function to the console.
  console.log(determineCategory());
};

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync('/dev/stdin', 'utf-8'));
