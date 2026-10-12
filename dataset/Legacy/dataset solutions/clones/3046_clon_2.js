var firstVal = A; // Initialize the primary value
var secondVal = B; // Initialize the secondary value

// Calculate the first derived quantity
var calcOne = firstVal + (firstVal - 1);

// Calculate the second derived quantity
var calcTwo = secondVal + (secondVal - 1);

// Calculate the third derived quantity
var calcThree = firstVal + secondVal;

// Determine which result to display based on value comparison
if (firstVal > secondVal) {
  // If the primary value is greater, output the first calculation
  console.log(calcOne);
} else if (firstVal < secondVal) {
  // If the primary value is smaller, output the second calculation
  console.log(calcTwo);
} else {
  // If both values are equal, output the third calculation
  console.log(calcThree);
}
