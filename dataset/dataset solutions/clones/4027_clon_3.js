"use strict";

var main = function(input) {
    var lines = input.trim().split("\n");
    var params = lines[0];
    var cards = lines[1]
        .split(" ")
        .map(function(x) { return parseInt(x, 10); })
        .sort(function(a, b) { return b - a; });

    var alice = 0;
    var bob = 0;

    cards.forEach(function(x, i) {
        if (i % 2 === 0) {
            alice += x;
        } else {
            bob += x;
        }
    });

    var result = alice - bob;
    return result;
};

var output = main(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(output);