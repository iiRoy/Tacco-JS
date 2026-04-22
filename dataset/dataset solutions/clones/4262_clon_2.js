function logValue(messageContent){
 console.log(messageContent);
} /* Outputs a provided argument to the console. */
function performCalculation( initialString )
{
  // Convert the input string into a numerical base value.
  let numericBase = Number(initialString);
  /* The following lines are commented out as they represent alternative input parsing strategies,
     not relevant for the current problem's input format.
     initialString = initialString.trim().split(" ");
     initialString = initialString.trim().split("\n");
     initialString = initialString.trim().split(" ").map((a)=>Number(a));
     initialString = initialString.trim().split("\n").map((a)=>Number(a));
  */
  let leastPossibleSum = 1000000000; // Initialize with a very large number to find the minimum sum.
  for(let multiplicationFactor = 1; multiplicationFactor <= 10; multiplicationFactor++ ) {
    let digitList = (numericBase * multiplicationFactor) // Perform multiplication
                      .toString() // Convert product to string
                      .split("")  // Split string into an array of character digits
                      .map((charDigit) => +charDigit); // Convert each character digit back to a number
    let currentDigitSum = 0; // Accumulator for the sum of digits of the current product.
    for(let listIndex = 0; listIndex < digitList.length; listIndex++)
    {
      currentDigitSum += digitList[listIndex]; // Add each digit to the sum.
    }
    leastPossibleSum = Math.min(leastPossibleSum, currentDigitSum); // Update the minimum sum found so far.
  }
  logValue(leastPossibleSum); // Display the final minimum digit sum.
}
performCalculation(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);