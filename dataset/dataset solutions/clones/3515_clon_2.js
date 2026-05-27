const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
const totalElements = Number.parseInt(inputLines[0], 10);
const elementValues = inputLines[1].split(" ");
const evenPositionCounts = {};
const oddPositionCounts = {};
for (let idx = 0; idx < elementValues.length; idx++) {
  const currentMap = (idx & 1) ? oddPositionCounts : evenPositionCounts;
  currentMap[elementValues[idx]] = (currentMap[elementValues[idx]] || 0) + 1;
}
const evenFreqList = [];
const oddFreqList = [];
for (const valKey in evenPositionCounts) {
  evenFreqList.push({ value: valKey, count: evenPositionCounts[valKey] });
}
for (const valKey in oddPositionCounts) {
  oddFreqList.push({ value: valKey, count: oddPositionCounts[valKey] });
}
evenFreqList.sort((itemA, itemB) => itemB.count - itemA.count);
oddFreqList.sort((itemA, itemB) => itemB.count - itemA.count);
if (evenFreqList[0].value !== oddFreqList[0].value) {
  oddFreqList[1] = oddFreqList[0];
}
const outputResult = console.log;
outputResult(totalElements - Math.max(evenFreqList[0].count + (oddFreqList[1] ? oddFreqList[1].count : 0), (evenFreqList[1] ? evenFreqList[1].count : 0) + oddFreqList[0].count));
