"use strict";

const acquireInputSource = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const allInputLines = acquireInputSource();
let currentLineIndex = 0;

const fetchNextLine = () => {
    if (currentLineIndex >= allInputLines.length) {
        throw "ArrayIndexOutOfBoundsException";
    }
    return allInputLines[currentLineIndex++];
};

const hasMoreLines = () => currentLineIndex < allInputLines.length;

const parseNextInteger = () => parseInt(fetchNextLine());
const splitNextLine = () => fetchNextLine().split(" ");
const parseNextIntegerArray = () => fetchNextLine().split(" ").map(Number);
const extractNextCharacters = () => fetchNextLine().split("");

const displayResult = (...args) => console.log(...args);

const generateCharCounts = (textSegment) => {
    const charMap = new Map();
    for (const char of textSegment) {
        charMap.set(char, (charMap.get(char) || 0) + 1);
    }
    return charMap;
};

const processInputData = () => {
    let initialCount = parseNextInteger();

    const alphabetSequence = "abcdefghijklmnopqrstuvwxyz";
    const allStringCharMaps = [];

    while (hasMoreLines()) {
        const currentLineText = fetchNextLine();
        allStringCharMaps.push(generateCharCounts(currentLineText));
    }

    const minimumCharacterFrequencies = new Map();

    if (allStringCharMaps.length === 0) {
        for (const char of alphabetSequence) {
            minimumCharacterFrequencies.set(char, 0);
        }
    } else {
        for (let i = 0; i < alphabetSequence.length; i++) {
            const targetChar = alphabetSequence[i];
            const countsForChar = allStringCharMaps.map(charMap => charMap.get(targetChar) || 0);
            const minCount = Math.min(...countsForChar);
            minimumCharacterFrequencies.set(targetChar, minCount);
        }
    }

    const finalCharacterList = [];
    for (let i = 0; i < alphabetSequence.length; i++) {
        const char = alphabetSequence[i];
        const count = minimumCharacterFrequencies.get(char);
        if (count > 0) {
            finalCharacterList.push(...Array(count).fill(char));
        }
    }

    finalCharacterList.sort();
    displayResult(finalCharacterList.join(""));
};

processInputData();
