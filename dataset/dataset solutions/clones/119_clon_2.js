const itemCounts = [];
let highestCount = 0;
let longestWordLength = 0;
let mostFrequentItem = 0;
let maxLenWord = '';
let currentLength;

require("fs").readFileSync("/dev/stdin", "utf8")
  .split(' ')
  .map(function(currentItem) {
    itemCounts[currentItem]
      ? ++itemCounts[currentItem] > highestCount
        ? (highestCount = itemCounts[mostFrequentItem = currentItem])
        : 0
      : (itemCounts[currentItem] = 1);

    (currentLength = currentItem.length) > longestWordLength
      ? ((maxLenWord = currentItem), (longestWordLength = currentLength))
      : 0;
  });

console.log(mostFrequentItem + ' ' + maxLenWord);
