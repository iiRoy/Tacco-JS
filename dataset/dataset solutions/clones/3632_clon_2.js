function ProcessInput(inputString) {
  // The input string is expected to contain multiple lines.
  // We split it by newline characters to process each line separately.
  inputString = inputString.split("\n");

  // The first line contains two space-separated numbers: arrayLength and moduloValue.
  // We parse them into an array and then assign them to individual variables.
  let dimensions = inputString[0].split(" ").map(val => +val);
  let moduloValue = dimensions[1];
  let arrayLength = dimensions[0];

  // The second line contains space-separated numbers forming the main numeric array.
  let numericArray = inputString[1].split(" ").map(val => +val);

  // Initialize a variable to store the final count of valid pairs.
  let finalCount = 0;

  // An object (hash map) to store the frequency of each prefix sum remainder.
  // The keys will be the remainders, and values will be their counts.
  const remainderCounts = {};

  // Initialize the current running prefix sum remainder.
  let currentRemainder = 0;

  // Loop through the numeric array to calculate prefix sums modulo `moduloValue`.
  for (let idx = 0; idx < arrayLength; idx++) {
    // Update the current remainder by adding the current array element
    // and taking the modulo.
    currentRemainder = (currentRemainder + numericArray[idx]) % moduloValue;

    // Increment the count for this remainder in our frequency map.
    // If the remainder hasn't been seen before, initialize its count to 1.
    if (remainderCounts[currentRemainder]) {
      remainderCounts[currentRemainder]++;
    } else {
      remainderCounts[currentRemainder] = 1;
    }
  }

  // Now, iterate through the collected remainder counts to find pairs.
  // The `for...in` loop iterates over the keys (remainders) in the `remainderCounts` object.
  for (let keyStr in remainderCounts) {
    // Keys from `for...in` are strings, so convert them back to numbers.
    let currentKey = +keyStr;
    // Get the frequency (count) of the current remainder.
    let count = remainderCounts[currentKey];

    // If the remainder is 0, it means the prefix sum itself is divisible by `moduloValue`.
    // Any pair of such prefix sums (including a prefix sum with itself, representing
    // a subarray starting from index 0) contributes to the total.
    // The formula n * (n + 1) / 2 calculates combinations with repetition (or sum of 1 to n).
    if (currentKey === 0) {
      finalCount += count * (count + 1) / 2;
    }
    // For any other remainder, if its count is greater than 1, it means there are
    // multiple prefix sums that yield this same remainder.
    // The formula n * (n - 1) / 2 calculates combinations of 2 (nC2),
    // representing pairs of distinct prefix sums with the same remainder.
    else if (count > 1) {
      finalCount += count * (count - 1) / 2;
    }
  }

  // Output the final calculated count to the console.
  console.log(finalCount);
}

// Read the entire content of standard input synchronously and pass it to the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
