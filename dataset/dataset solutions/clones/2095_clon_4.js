'use strict';
function processInput(initialData) {
  const charSequence = Array.from(initialData.toLocaleUpperCase());

  const uniqueElements = new Set(charSequence);

  const containsHeterogeneity = uniqueElements.size > 1;

  console.log(containsHeterogeneity ? 'Yes' : 'No');
}

const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(sourceContent);