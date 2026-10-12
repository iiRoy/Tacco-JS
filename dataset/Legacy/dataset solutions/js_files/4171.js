/**
 * @see https://practice.contest.atcoder.jp/tasks/practice_1
 * @param  {string} input
 * @returns {string}
 */
var main = function(input) {
    var numbers = input.split("\n")[1].split(" ").map(x => parseInt(x));
    var operations = 0;
    while (true) {
        const canDivide = numbers.every(n => ((n % 2) === 0));
        if (canDivide) {
            numbers = numbers.map(n => n / 2);
            operations++;
        } else {
            return operations;
        }
    }
};

const output = main(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(output); // console.log outputs with trailing new line!

