function processDataStream(sourceContent) {
    const cleanedContent = sourceContent.trim();
    const matches = cleanedContent.match(/1/g);
    const totalOnes = matches ? matches.length : 0;
    console.log(totalOnes);
}

processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
