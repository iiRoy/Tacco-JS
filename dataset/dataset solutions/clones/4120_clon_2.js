const processInput = (inputData) => {
  // Remove leading/trailing whitespace and split the input string into an array of lines.
  const lines = inputData.trim().split('\n');

  // Parse the first line to get the two numeric counts for the pattern.
  const [firstNumCount, secondNumCount] = lines[0].split(' ');

  // Retrieve the string that needs to be validated from the second line.
  const targetString = lines[1];

  // Dynamically construct a regular expression.
  // This pattern looks for 'firstNumCount' digits, followed by a hyphen,
  // and then 'secondNumCount' digits. The 'g' flag is for global matching.
  const regexPattern = new RegExp(
    '\\d{' + firstNumCount + '}' + '-' + '\\d{' + secondNumCount + '}',
    'g'
  );

  // Check if the target string contains a substring that matches the defined pattern.
  if (targetString.match(regexPattern)) {
    // If a match is found, print "Yes" to standard output.
    console.log('Yes');
  } else {
    // Otherwise, if no match is found, print "No".
    console.log('No');
  }
};

// Read the entire content of standard input synchronously using Node.js file system module.
// The input is then passed to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
