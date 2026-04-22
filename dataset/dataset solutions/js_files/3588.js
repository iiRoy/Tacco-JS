'use strict';
/**
 * main.
 * @param {string} input input string.
 */
function main(input) {
    let eachCol = input.split('\n');
    eachCol.shift();
    let resultArray = [];

    eachCol.forEach((col) => {
        let temp = col.split('');
        let res = temp.map((x) => {
            if (x === '.') {
                return true;
            } else {
                return false;
            }
        });
        resultArray.push(res);
    });

    let firstDone = resultArray.filter((row) => {
        return !row.reduce((a, b) => {
            return (a && b);
        });
    });

    let secondReady = tArray(firstDone);

    let secondDone = secondReady.filter((row) => {
        return !row.reduce((a, b) => {
            return (a && b);
        });
    });
    let ok = makeReadable(tArray(secondDone));
    console.log(
        ok.map((each) => {
        return each.join('');
    }).join('\n')
);
};

const tArray = (a) => {
    return a[0].map((_, c) => {
        return a.map( (r) => r[c]);
    });
};

/**
 * 最終処理
 * @param {array} secondDoneArray 全部完了したやつ
 * @return {array} あとはJoinするだけ。
 */
const makeReadable = (secondDoneArray) => {
    let res = secondDoneArray.map((row) => {
        return row.map((eachData) => {
            if (eachData) {
                return '.';
            } else {
                return '#';
            }
        });
    });
    return res;
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
