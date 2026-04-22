var recursiveOneCounter = function(text, currentCount) {
  if (text.length === 0) {
    return currentCount;
  }
  var firstChar = text.charAt(0);
  var nextCount = (firstChar == '1') ? (currentCount + 1) : currentCount;
  return recursiveOneCounter(text.substring(1), nextCount);
};

var inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(recursiveOneCounter(inputSource, 0));