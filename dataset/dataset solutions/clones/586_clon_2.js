function detonate (inputString) {
  while ( /1{4,}|2{4,}|3{4,}/.test(inputString) )
  {
    inputString = inputString.replace(/1{4,}|2{4,}|3{4,}/g, "");
  }
  minimumLength = Math.min(minimumLength, inputString.length);
}
var rawData = require('fs') . readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.trim()) . split("\n");
while (true)
{
  var countElements = lineData.shift() - 0;
  if (countElements === 0) break;
  var numericArray = [];
  for (var idx = 0; idx < countElements; idx++)
  {
    var currentValue = lineData.shift() - 0;
    numericArray.push(currentValue);
  }
  var minimumLength = Infinity;
  var combinedString = numericArray.join("");
  for (var idx = 0; idx < countElements; idx++)
  {
    var modifiedArrayA = numericArray.slice();
    var modifiedArrayB = numericArray.slice();
    if (idx < countElements - 1) modifiedArrayA[idx] = modifiedArrayA[idx + 1];
    if (idx > 0) modifiedArrayB[idx] = modifiedArrayB[idx - 1];
    detonate(modifiedArrayA.join(""));
    detonate(modifiedArrayB.join(""));
  }
  console.log(minimumLength);
}