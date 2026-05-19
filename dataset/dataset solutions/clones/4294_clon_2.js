const processInput = (rawData) => {
  // Parse the incoming string data
  const [firstVal, secondVal, thirdVal] = rawData.trim().split(' ').map(item => parseInt(item, 10));

  // Determine which value is unique or the third one if two are identical
  if (firstVal === secondVal) {
    console.log(thirdVal); // Output the third value if the first two match
  } else {
    if (firstVal === thirdVal) {
      console.log(secondVal); // Output the second value if the first and third match
    } else {
      console.log(firstVal); // Otherwise, the first value must be the unique one
    }
  }
};

// Read from standard input and execute the primary function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
