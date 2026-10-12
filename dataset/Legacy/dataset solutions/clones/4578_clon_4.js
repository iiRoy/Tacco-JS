"use strict";

function main(input) {
    const rows = input.split("\n");
    const header = rows[0].split(" ");
    const N = parseInt(header[0]);
    const M = parseInt(header[1]);

    const counts = new Array(10).fill(0);
    const chosenRows = rows.slice(1, M + 1);

    for (const row of chosenRows) {
        for (let index = 0; index < row.length; index++) {
            const ch = row[index];
            if (ch === " ") {
                continue;
            }

            const value = Number(ch);
            if (Number.isInteger(value) && value >= 1 && value <= 9) {
                counts[value]++;
            }
        }
    }

    for (let current = 1; current <= N; current++) {
        console.log(current < counts.length ? counts[current] : 0);
    }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
