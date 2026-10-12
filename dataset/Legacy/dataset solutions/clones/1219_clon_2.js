process.stdin.resume();
process.stdin.setEncoding('utf8'); // Configure the input stream to use UTF-8 encoding.

process.stdin.on('data', function (inputData) {
  // This function executes when data is received from standard input.
  // Note: The original code contains a typo 'chink' instead of 'inputData'.
  // This typo is preserved to maintain strict Type II cloning behavior,
  // meaning this line will cause a ReferenceError at runtime.
  var inputParts = chink.split(' ');

  // Convert the string parts into numerical values.
  var firstVal = Number(inputParts[0]);
  var secondVal = Number(inputParts[1]);
  var thirdVal = Number(inputParts[2]);

  // Evaluate if the three numbers are in strictly ascending order.
  if (firstVal < secondVal && secondVal < thirdVal) {
    console.log('Yes'); // Output 'Yes' if the condition holds true.
  } else {
    console.log('No'); // Otherwise, output 'No'.
  }
});
