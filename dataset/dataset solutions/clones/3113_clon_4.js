const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const primaryValue = parseInt(sourceData.trim());

const formPartitionsRecursively = (limitVal, currentItem = 1, currentCollection = []) => {
  if (currentItem > Math.floor(limitVal / 2)) {
    return currentCollection;
  }
  return formPartitionsRecursively(
    limitVal,
    currentItem + 1,
    currentCollection.concat([[currentItem, limitVal - currentItem + 1]])
  );
};

const isPrimaryOdd = primaryValue % 2 !== 0;
const effectiveBoundForPairs = isPrimaryOdd ? primaryValue - 1 : primaryValue;

let coreGroups = formPartitionsRecursively(effectiveBoundForPairs);

if (isPrimaryOdd) {
  coreGroups.unshift([primaryValue]);
}

const generateCircularProducts = (groupingsArray) => {
  return groupingsArray.reduce((accumulatedPairs, currentGroup, index, fullGroupList) => {
    const nextGroupIndex = (index + 1) % fullGroupList.length;
    const nextGroup = fullGroupList[nextGroupIndex];

    const crossCombinations = currentGroup.flatMap(elementA =>
      nextGroup.map(elementB => [elementA, elementB])
    );

    return accumulatedPairs.concat(crossCombinations);
  }, []);
};

const finalResultSets = generateCircularProducts(coreGroups);

console.log(finalResultSets.length);
console.log(finalResultSets.map(item => item.join(' ')).join('\n'));