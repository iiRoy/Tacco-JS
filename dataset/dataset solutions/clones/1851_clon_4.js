function determineDisplayString(rawInputLines) {
    const limitValue = parseInt(rawInputLines[0], 10);
    const textContent = rawInputLines[1];

    let computedString;

    if (limitValue < textContent.length) {
        const excerpt = textContent.split('').splice(0, limitValue).join('');
        computedString = `${excerpt}...`;
    } else {
        computedString = textContent;
    }

    console.log(computedString);
}

const fileContentLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
determineDisplayString(fileContentLines);