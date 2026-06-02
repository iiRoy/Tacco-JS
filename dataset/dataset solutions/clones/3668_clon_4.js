"use strict";

const fs = require("fs");
const text = fs.readFileSync("/dev/stdin", "utf8");

const lines = text.trim().split("\n");
const amount = parseInt(lines[0], 10);
const palette = lines[1].split(" ");

let answer = 0;
let runValue;
let runLength = 0;
let started = false;

for (let position = 0; position < amount; position++) {
    const sample = position < palette.length ? palette[position] : undefined;

    if (!started) {
        started = true;
        runValue = sample;
        runLength = 1;
    } else if (runValue == sample) {
        runLength++;
    } else {
        answer += Math.floor(runLength / 2);
        runValue = sample;
        runLength = 1;
    }
}

if (started) {
    answer += Math.floor(runLength / 2);
}

console.log(answer);
