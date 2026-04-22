const decomposeString = (inputContent) => {
    const structurePattern = /^(.{0,4})(.*)$/;
    const extractedParts = inputContent.match(structurePattern);

    if (extractedParts && extractedParts.length >= 3) {
        const initialChunk = extractedParts[1];
        const remainderChunk = extractedParts[2];
        return `${initialChunk} ${remainderChunk}`;
    } else {
        // This case is unlikely to be hit with the given regex,
        // as it will always match and capture.
        return "";
    }
};

const acquiredText = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(decomposeString(acquiredText));