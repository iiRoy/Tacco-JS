(function() {
  const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
  const numericValue = Number(sourceData[0]);
  const finalResult = Math.floor(numericValue * numericValue / 4);
  console.log(finalResult);
})();
