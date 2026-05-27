function ProcessInput(rawData) {
  // Split the entire raw input string by newline characters.
  var lineData = rawData.split('\n');

  // Access the second line of the input (index 1) and split it by space.
  var dateParts = lineData[1].split(' ');
  
  // Evaluate the second element of the 'dateParts' array.
  if (dateParts[1] === '1') {
    // If the second element is the string '1', output the number 1.
    console.log(1);
  } else {
    // Otherwise, output the number 0.
    console.log(0);
  }
}

// Read the content of '/dev/stdin' synchronously using UTF-8 encoding
// and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
