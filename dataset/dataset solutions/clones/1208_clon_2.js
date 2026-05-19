// This function computes the product of two numbers.
function calculateProduct(valOne, valTwo) {
  return valOne * valTwo; // Returns the multiplication result.
}

/*
 * This function calculates the sum of two numbers
 * and then multiplies the result by two.
 */
function computeSumDoubled(valOne, valTwo) {
  return (valOne + valTwo) * 2; // Sum is doubled.
}

// Log the results of calling both functions with external variables 'a' and 'b'.
console.log(calculateProduct(a, b), computeSumDoubled(a, b));
