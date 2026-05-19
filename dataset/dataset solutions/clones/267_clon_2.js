var dataCollection = input.split(/\s/); // Split the incoming string by whitespace into an array of values.
var tempSquare; // Declare a variable to hold a temporary squared value.

// Iterate through the collection, processing pairs of elements.
// The loop continues as long as the product of the current element and the next element is not zero.
for (var idx = 0; dataCollection[idx] * dataCollection[idx + 1] !== 0; idx += 2) {
  // Calculate the square of the current element and store it.
  tempSquare = dataCollection[idx] * dataCollection[idx];

  // Perform a calculation using the current pair of elements and the stored squared value, then print the result.
  console.log(dataCollection[idx] * Math.sqrt(4 * dataCollection[idx + 1] * dataCollection[idx + 1] + tempSquare) + tempSquare);
}
