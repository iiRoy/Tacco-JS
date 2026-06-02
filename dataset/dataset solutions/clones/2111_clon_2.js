"use strict";

const processInput = (rawData) => {
    // 入力文字列を整形し、数値の配列として準備する
    const parsedValues = rawData.trim().split(" ");
    const numVal = parseInt(parsedValues[0], 10);

    if (numVal % 2 === 0) {
        console.log(numVal / 2);
    } else {
        console.log(Math.floor((numVal / 2), 10) + 1);
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
