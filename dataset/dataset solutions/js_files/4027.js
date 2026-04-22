"use strict";

/**
 * @see https://practice.contest.atcoder.jp/tasks/practice_1
 * @param  {string} input
 * @returns {string}
 */
var main = function(input) {
    const params = input.split("\n")[1];
    const cards = input.split("\n")[1]
        .split(" ")
        .map(x => parseInt(x))
        .sort((a, b) => b - a);
    
    const alice = cards.filter((x, i) => i % 2 === 0)
        .reduce((a, b) => a + b);
    const bob = cards.filter((x, i) => i % 2 === 1)
        .reduce((a, b) => a + b);
    return alice - bob;
};

const output = main(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(output); // console.log outputs with trailing new line!
