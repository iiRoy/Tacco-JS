function processTextualStream(initialText) {
    const alteredRepresentation = initialText.replaceAll('?', 'D');
    console.log(alteredRepresentation);
}

const acquiredData = require("node:fs").readFileSync("/dev/stdin", "utf8");
processTextualStream(acquiredData);