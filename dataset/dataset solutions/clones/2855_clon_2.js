process.stdin.resume();

process.stdin.setEncoding('utf8');

// Array to accumulate incoming data segments
var receivedStrings = [];

var dataAcquirer = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

dataAcquirer.on('line', (incomingString) => {
  // Store each line as it arrives
  receivedStrings.push(incomingString);
});

dataAcquirer.on('close', () => {

  // Assuming the first line contains all numerical values, space-separated
  receivedStrings = receivedStrings[0].split(' ');

  // Convert all string elements to actual numbers for calculation
  const numericValues = receivedStrings.map(Number);

  // Find the smallest numerical element
  var initialMinimum = Math.min(...numericValues);

  // Filter out all instances of the initial minimum to find the next smallest
  var filteredValues = numericValues.filter(
    (item) => item !== initialMinimum
  );

  // Find the smallest among the remaining elements
  var secondaryMinimum = Math.min(...filteredValues);
  
  // Output the aggregate of the two smallest distinct numbers
  console.log(initialMinimum + secondaryMinimum);

});