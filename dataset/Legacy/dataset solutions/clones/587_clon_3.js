function processString(inputString) {
   let previousLength = 0;
   const removalRegex = /1111+|2222+|3333+/;

   do {
      previousLength = inputString.length;
      inputString = inputString.replace(removalRegex, "");
   } while (previousLength !== inputString.length);

   if (minimumLength > inputString.length) {
       minimumLength = inputString.length;
   }
}

let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawData.trim().split("\n");

let minimumLength;
let currentLineIndex = 0;

while (true) {
   let numElements = parseInt(inputLines[currentLineIndex++], 10);
   if (numElements === 0) {
       break;
   }

   minimumLength = Infinity;

   let elementsArray = [];
   for (let idx = 0; idx < numElements; idx++) {
      let currentValue = parseInt(inputLines[currentLineIndex++], 10);
      elementsArray.push(currentValue);
   }

   let joinedString = elementsArray.join("");

   for (let idx = 0; idx < numElements; idx++) {
      let modifiedStringOne;
      if (idx + 1 < numElements) {
          modifiedStringOne = joinedString.substring(0, idx) + elementsArray[idx + 1] + joinedString.substring(idx + 1);
      } else {
          modifiedStringOne = joinedString.substring(0, idx) + "undefined" + joinedString.substring(idx + 1);
      }
      processString(modifiedStringOne);

      if (idx > 0) {
          let modifiedStringTwo = joinedString.substring(0, idx) + elementsArray[idx - 1] + joinedString.substring(idx + 1);
          processString(modifiedStringTwo);
      }
   }
   console.log(minimumLength);
}
