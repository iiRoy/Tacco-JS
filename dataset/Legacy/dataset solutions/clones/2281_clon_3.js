'use strict';
// JavaScript Array permutation generator
// (optimized from CoffeeScript output: see ArrayPermutation.coffee)
(function() {
  var computePermutationsRecursively = function(resultCollection, currentPrefix, remainingElements, elementsToPick) {
    // Type III: Guard clause for the base case
    if (elementsToPick === 0) {
      resultCollection.push(currentPrefix);
      return;
    }

    const currentLength = remainingElements.length;
    for (let idx = 0; idx < currentLength; ++idx) {
      // Type III: Using spread syntax for shallow copy instead of slice(0)
      const tempRemaining = [...remainingElements];
      // splice returns an array containing the removed element(s)
      const selectedElement = tempRemaining.splice(idx, 1);

      // Type III: Introduce a temporary variable for the next prefix
      const nextPrefix = currentPrefix.concat(selectedElement);
      computePermutationsRecursively(resultCollection, nextPrefix, tempRemaining, elementsToPick - 1);
    }
  };

  /*
  extend Array.prototype
  e.g. [0, 1, 2].permutation(2)
  => [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]]
  */
  Array.prototype.permutation = function(numElementsToPick) {
    // Type III: Use a ternary operator for default value assignment
    const actualNumElements = (numElementsToPick == null) ? this.length : numElementsToPick;
    var generatedPermutations = [];
    computePermutationsRecursively(generatedPermutations, [], this, actualNumElements);
    return generatedPermutations;
  };
})();

const processInputAndCalculateDifference = rawData => {
  // Type III: Extract common parsing logic into a small helper function
  const parseAndMapToIntArray = (inputString) => {
    return inputString.split(' ').map(itemValue => parseInt(itemValue));
  };

  const countOfElements = parseInt(rawData[0]); // Renamed 'n' for clarity, though not used later.

  const arrayP = parseAndMapToIntArray(rawData[1]);
  const arrayQ = parseAndMapToIntArray(rawData[2]);

  // Type III: Introduce a temporary constant for the join character
  const emptyStringJoiner = '';
  const stringP = arrayP.join(emptyStringJoiner);
  const stringQ = arrayQ.join(emptyStringJoiner);

  // Type III: Split the permutation generation and string conversion into two distinct steps
  const allPermutations = arrayP.permutation();
  const allPermutationStrings = allPermutations.map(permutationArray => permutationArray.join(emptyStringJoiner));

  allPermutationStrings.sort();

  let indexP = -1;
  let indexQ = -1;

  // Type III: Use Array.prototype.findIndex for finding indices, which is more idiomatic
  indexP = allPermutationStrings.findIndex(permStr => permStr === stringP);
  indexQ = allPermutationStrings.findIndex(permStr => permStr === stringQ);
  
  console.log(Math.abs(indexP - indexQ));
};

processInputAndCalculateDifference(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
