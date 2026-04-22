const assessCharacterUniformity = (textBlock) => {
    const pattern = /^(.)\1\1/;
    const matchResult = textBlock.match(pattern);
    return matchResult ? "No" : "Yes";
};

const acquiredContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
process.stdout.write(assessCharacterUniformity(acquiredContent) + "\n");