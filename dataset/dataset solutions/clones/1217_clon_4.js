'use strict';
(function(sourceContent) {
  const numericSequence = sourceContent.toString().trim().split(' ').map(Number);

  const isStrictlyAscending = numericSequence.every((currentValue, index, array) => {
    if (index === 0) {
      return true;
    }
    return currentValue > array[index - 1];
  });

  console.log(isStrictlyAscending ? 'Yes' : 'No');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
