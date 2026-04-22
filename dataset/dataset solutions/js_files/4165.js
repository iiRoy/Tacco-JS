"use strict";

var main = function main(input) {
  var input_arr = input.split("");
  var one = input_arr.filter(function (elem) {
    return elem == 1;
  });
  console.log(one.length);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));