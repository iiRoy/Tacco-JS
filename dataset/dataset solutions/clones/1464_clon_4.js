process.stdin.on("data", (inputBuffer) => {
    const parsedLines = String(inputBuffer).trim().split("\n");

    const firstCollection = new Set(parsedLines[1].split(" "));

    const commonCount = parsedLines[3].split(" ").filter(
        (currentElement) => firstCollection.has(currentElement)
    ).length;

    console.log(commonCount);
}).resume();
