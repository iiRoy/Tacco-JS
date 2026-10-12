"use strict";

function main(src) {
  const trimmedInput = src.trim();
  const characterList = trimmedInput.split('');
  const filteredValues = characterList.filter(function (current) {
    const isOne = current == 1;
    return isOne;
  });
  const total = filteredValues.length;
  console.log(total);
}

const fs = require('fs');
const inputData = fs.readFileSync('/dev/stdin', 'utf8');
main(inputData);
