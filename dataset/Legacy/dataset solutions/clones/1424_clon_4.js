function fetchInputContent() {
    const fileSystemModule = require("fs");
    const rawContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    return rawContent.split(/\n\r?/);
}

const inputLines = fetchInputContent();
const primaryLine = inputLines[0];

let transformedSequence = [];

for (const currentGlyph of primaryLine) {
    const glyphCode = currentGlyph.charCodeAt(0);
    let adjustedGlyph = currentGlyph;

    if (glyphCode >= 97 && glyphCode <= 122) {
        adjustedGlyph = String.fromCharCode(glyphCode - 32);
    } else if (glyphCode >= 65 && glyphCode <= 90) {
        adjustedGlyph = String.fromCharCode(glyphCode + 32);
    }

    transformedSequence.push(adjustedGlyph);
}

console.log(transformedSequence.join(''));
