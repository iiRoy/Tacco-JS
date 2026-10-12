'use strict';

(function(inputData) {
  var rawContent = inputData.toString();

  (function processAndDisplay(numericValues) {
    console.log(numericValues);
  }(rawContent.split('\n')[0].split(' ').map(Number)));
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
