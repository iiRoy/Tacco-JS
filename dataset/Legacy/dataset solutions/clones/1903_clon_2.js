const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const dataRows = rawData.split('\n');
const targetValue = Number(dataRows[0]);

let powerList = [0, 1];

const limitSquared = targetValue * targetValue;
for (let idx = 2; powerList[powerList.length - 1] < limitSquared; idx++) {
    powerList.push(Math.pow(idx, 5));
}

;(() => {
    for (let outerIdx = 0; outerIdx < powerList.length; outerIdx++) {
        for (let innerIdx = 0; innerIdx < powerList.length; innerIdx++) {
            if (powerList[outerIdx] - powerList[innerIdx] === targetValue) {
                console.log(outerIdx, innerIdx);
                return;
            } else if (powerList[outerIdx] + powerList[innerIdx] === targetValue) {
                console.log(outerIdx, -innerIdx);
                return;
            }
        }
    }
})();
