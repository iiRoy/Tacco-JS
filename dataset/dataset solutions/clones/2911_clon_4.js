"use strict";

const source = require("fs").readFileSync("/dev/stdin", "utf8");
const cells = source.split(/ |\n/);
let cursor = 0;

const takeNumber = () => +cells[cursor++];
const takeNumbers = (amount) => cells.slice(cursor, (cursor += amount)).map((item) => +item);

function countByElimination() {
    const switchTotal = takeNumber();
    const lampTotal = takeNumber();

    const masks = [];
    let impossible = false;

    for (let lamp = 0; lamp < lampTotal; lamp++) {
        const connected = takeNumber();
        const switches = takeNumbers(connected);
        let mask = 0n;

        for (const raw of switches) {
            const position = raw - 1;
            if (!Number.isInteger(position) || position < 0 || position >= switchTotal) {
                impossible = true;
            } else {
                mask ^= 1n << BigInt(position);
            }
        }
        masks.push(mask);
    }

    const parity = takeNumbers(lampTotal);
    if (impossible) return 0;

    const equations = [];
    for (let i = 0; i < lampTotal; i++) {
        const need = parity[i];
        if (need !== 0 && need !== 1) return 0;
        equations.push({ mask: masks[i], rhs: need });
    }

    let rank = 0;
    for (let bit = 0; bit < switchTotal; bit++) {
        const pivotBit = 1n << BigInt(bit);
        let pivot = -1;

        for (let row = rank; row < equations.length; row++) {
            if ((equations[row].mask & pivotBit) !== 0n) {
                pivot = row;
                break;
            }
        }

        if (pivot < 0) continue;

        const chosen = equations[pivot];
        equations[pivot] = equations[rank];
        equations[rank] = chosen;

        for (let row = 0; row < equations.length; row++) {
            if (row !== rank && (equations[row].mask & pivotBit) !== 0n) {
                equations[row].mask ^= equations[rank].mask;
                equations[row].rhs ^= equations[rank].rhs;
            }
        }
        rank++;
    }

    for (const eq of equations) {
        if (eq.mask === 0n && eq.rhs !== 0) return 0;
    }

    return 2 ** (switchTotal - rank);
}

console.log(countByElimination().toString());
