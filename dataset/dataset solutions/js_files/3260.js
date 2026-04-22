'use strict'

function isZero(arr) {
    for (let elem of arr) {
        if (elem !== 0) {
            return false;
        }
    }
    return true;
}
function main(input) {
    const tmp = Array.from(input.split('\n'));
    const N = parseInt(tmp[0], 10);
    const h = tmp[1].split(' ').map((elem) => parseInt(elem, 10));

    let count = 0;
    while (!isZero(h)) {
        const maxVal = h.reduce((max, elem) => Math.max(max, elem));
        const maxValStartInd = h.indexOf(maxVal);
        let maxValEndInd = maxValStartInd;
        while (h[maxValEndInd + 1] === maxVal) {
            maxValEndInd++;
        }
        const maxValRange = Array.from(new Array(maxValEndInd - maxValStartInd + 1).fill(0).map((elem, i) => i + maxValStartInd));

        for (let maxValInd of maxValRange) {
            h[maxValInd]--;
        }
        count++;
    }
    console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));