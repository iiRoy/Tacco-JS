"use strict"
const buildInputSource = () => {
    const contentLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let remainingLines = [...contentLines];
    let consumedCount = 0;

    return {
        hasNext: function() {
            return consumedCount < contentLines.length;
        },
        next: function() {
            if (remainingLines.length === 0) {
                throw "ArrayIndexOutOfBoundsException";
            }
            consumedCount++;
            return remainingLines.shift();
        }
    };
};

const inputSource = buildInputSource();
const next = () => inputSource.next();
const nextInt = () => parseInt(inputSource.next());
const nextStrArray = () => inputSource.next().split(" ");
const nextIntArray = () => inputSource.next().split(" ").map(Number);
const nextCharArray = () => inputSource.next().split("");
const hasNext = () => inputSource.hasNext();
const myout = (...x) => console.log(...x);

const Main = () => {
    let initialLineCount = nextInt();

    const resultTally = new Map([
        ["AC", 0],
        ["WA", 0],
        ["TLE", 0],
        ["RE", 0]
    ]);

    while (hasNext()) {
        const currentOutcomeString = next();
        const incrementer = {
            "AC": () => resultTally.set("AC", resultTally.get("AC") + 1),
            "WA": () => resultTally.set("WA", resultTally.get("WA") + 1),
            "TLE": () => resultTally.set("TLE", resultTally.get("TLE") + 1),
            "RE": () => resultTally.set("RE", resultTally.get("RE") + 1),
        };
        incrementer[currentOutcomeString]?.();
    }

    myout(`AC x ${resultTally.get("AC")}`);
    myout(`WA x ${resultTally.get("WA")}`);
    myout(`TLE x ${resultTally.get("TLE")}`);
    myout(`RE x ${resultTally.get("RE")}`);
};

Main();
