const fileSystem = require("fs");

const checkPythagoreanRelation = (valX, valY, valZ) => valX**2 + valY**2 === valZ**2;

const rawContent = fileSystem.readFileSync('/dev/stdin').toString();
const allEntries = rawContent.split("\n");

const problemCount = Number(allEntries[0]);
const dataEntries = allEntries.slice(1, problemCount + 1);

dataEntries.forEach(currentLine => {
    const [valA, valB, valC] = currentLine.split(' ').map(Number);

    const allAreFinite = [valA, valB, valC].every(Number.isFinite);

    if (allAreFinite) {
        const isPythagorean = checkPythagoreanRelation(valA, valB, valC);
        console.log(isPythagorean ? "YES" : "NO");
    }
});
