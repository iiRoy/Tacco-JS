'use strict';
function Main(input) {
  let stations = input.split("");
  stations = stations.map(v => v.toUpperCase());
  const len = stations.length;
  let hasBus = false;
  for (let i = 0; i < len; ++i) {
    for (let j = 0; j < len; ++j) {
      // 同一の駅
      if (i === j) {
        continue;
      }
      hasBus = hasBus || stations[i] !== stations[j];
    }
  }
  console.log(hasBus ? 'Yes' : 'No');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));