"use strict";

const main = arg => {
    const inputList = arg.trim().split("\n");
    // 回答を記述
    const X = parseInt(inputList[0].split(" ")[0]);
    const N = parseInt(inputList[0].split(" ")[1]);
    if (N == 0) {
        console.log(X)
    } else {
        const PList = inputList[1].split(" ").map(ele => parseInt(ele))

        const hundred = [...Array(100).keys()].map(i => ++i)
        hundred.unshift(0);

        const notExistPList = hundred.filter(ele => PList.indexOf(ele) == -1)

        const result = notExistPList.reduce((acc, cur) => {
            const accDif = Math.abs(X - acc);
            const curDif = Math.abs(X - cur);
            if (accDif == curDif) {
                return Math.min(acc, cur);
            } else if (accDif > curDif) {
                return cur;
            } else {
                return acc;
            }
        }, 101);

        if (Math.abs(X - result) >= Math.abs(X - (-1))) {
            console.log(-1)
        } else {
            console.log(result)
        }
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));