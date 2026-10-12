"use strict";

const main = function(arg) {
    var lines = arg.trim().split("\n");
    var S = lines[0].split("");

    var count = 0;

    for (var i = 0; i < S.length; i++) {
        if (S[i] === "1") {
            count++;
        }
    }

    console.log(count);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));