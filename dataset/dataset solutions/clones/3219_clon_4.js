(function() {
  let sourceText = require("fs").readFileSync("/dev/stdin", "utf8");
  let cleanedText = sourceText.trim();

  let spaceIndex = cleanedText.indexOf(" ");
  let firstSegment = cleanedText.substring(0, spaceIndex);
  let secondSegment = cleanedText.substring(spaceIndex + 1);

  let numeratorVal = parseFloat(firstSegment);
  let denominatorVal = parseFloat(secondSegment);

  console.log(numeratorVal / denominatorVal);
})();
