'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});

process.stdin.on('end', _ => {
    inputString = inputString.trim().split('\n').map(string => {
        return string.trim();
    });

    main();
});

function readline() {
    return inputString[currentLine++];
}

function getArray(str) {
    return str.split(' ').map(x => Number(x));
}

function getInt(str) {
    return Number(str);
}

function getStrArray(str) {
    return str.split(' ').map(x => x);
}
// ---------------------------------------



function main() {
    const x = getArray(readline());
    const len = x[0];
    const k = x[1];
    const a = getArray(readline());
    const dp = new Array(len);
    dp.fill(-1);
    dp[0] = 0;
    dp[1] = Math.abs(a[1] - a[0]);
    for (let i = 2; i < len; i++) {
        let min = 100;
        for(let j = 1; j <= k; j++) {
            // dp[i - 1] + Math.abs(a[i] - a[i - 1]),
            // dp[i - 2] + Math.abs(a[i] - a[i - 2]),
            if (i - j >= 0) {
                // console.log(min, dp[i - j] + Math.abs(a[i] - a[i - j]))
                min = Math.min(min, dp[i - j] + Math.abs(a[i] - a[i - j]));
            }
        }
        dp[i] = min;
    }
    console.log(dp[len-1]);
}