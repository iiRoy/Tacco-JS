"use strict";
function Main(input) {
    let lines = input.split("\n");
    let ab = [];
    for (let n = 0; n < 3; n++) {
        ab.push(lines[n].split(/\s/).map((v) => v - 0));
    }
    let cnt = [0, 0, 0, 0, 0];
    for (let n = 0; n < 3; n++) {
        cnt[ab[n][0]] += 1;
        cnt[ab[n][1]] += 1;
    }

    console.log(cnt.every(function(value) { return value != 3; }) ? "YES" : "NO");
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));