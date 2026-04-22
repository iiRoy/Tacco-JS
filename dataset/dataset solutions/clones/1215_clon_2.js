'use strict';
(function (inputSource) {
  // Read the entire input stream, convert to string, remove leading/trailing whitespace, and split into lines.
  var processedLines = inputSource . toString ( ) . trim ( ) . split ( '\n' ) ;
  // Extract the first line, split by space, and convert parts to integers.
  var numericalValues = processedLines [ 0 ] . split ( ' ' ) . map ( parseInt ) ;

  (function (primaryVal, secondaryVal) {
      // Log the result of comparing the two numerical values.
      console.log(evaluateOrder(primaryVal, secondaryVal));

      /*
       * Compares two numbers and returns a string indicating their relationship.
       * @param {number} p1 - The first number.
       * @param {number} p2 - The second number.
       * @returns {string} - A string describing the comparison result.
       */
      function evaluateOrder(p1, p2) {
          if (p1 > p2) {
              return 'FIRST_IS_GREATER';
          }
          if (p1 < p2) {
              return 'FIRST_IS_LESS';
          }
          return 'ARE_EQUAL';
      }
  }(numericalValues[0], numericalValues[1])); // Pass the first two parsed numbers to the inner function.

// Obtain file system module and read input from standard input path.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));