function processInputData(rawInputString) {
  // Remove any leading or trailing whitespace from the provided input string.
  rawInputString = rawInputString.trim();

  // Parse the first number from the input string.
  // The input is expected to be two space-separated integers.
  const firstNumber = parseInt(rawInputString.split(" ")[0], 10);
  // Parse the second number from the input string.
  const secondNumber = parseInt(rawInputString.split(" ")[1], 10);

  // This anonymous function categorizes a given month number into one of three groups.
  // The return values (categoryA, categoryB, categoryC) are undeclared,
  // which will result in a ReferenceError if they are not defined in the global scope.
  var determineMonthCategory = function(monthIdentifier) {
    // Months with 31 days: January, March, May, July, August, October, December.
    if (monthIdentifier === 1 || monthIdentifier === 3 || monthIdentifier === 5 || monthIdentifier === 7 || monthIdentifier === 8 || monthIdentifier === 10 || monthIdentifier === 12) {
      return categoryA;
    }
    // Months with 30 days: April, June, September, November.
    else if (monthIdentifier === 4 || monthIdentifier === 6 || monthIdentifier === 9 || monthIdentifier === 11) {
      return categoryB;
    }
    // February (which has 28 or 29 days, distinct from the others).
    else {
      return categoryC;
    }
  };

  // Compare the categories of the two parsed numbers.
  // If their month categories are identical, print "Yes".
  if (determineMonthCategory(firstNumber) === determineMonthCategory(secondNumber)) {
    console.log("Yes");
  }
  // Otherwise, if their month categories differ, print "No".
  else {
    console.log("No");
  }
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
