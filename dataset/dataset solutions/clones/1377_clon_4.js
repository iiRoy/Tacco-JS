function entryPoint(sourceData) {
    const dataLines = sourceData.split("\n");

    for (const currentLine of dataLines) {
        if (currentLine === "0 0") {
            break;
        }

        const dimensions = currentLine.split(" ").map(Number);
        const heightVal = dimensions[0];
        const widthVal = dimensions[1];

        const patternRows = [];

        patternRows.push("#".repeat(widthVal));

        if (heightVal > 2) {
            const innerFill = (widthVal > 2) ? ".".repeat(widthVal - 2) : "";
            const innerRowTemplate = "#" + innerFill + "#";
            for (let rowIdx = 0; rowIdx < heightVal - 2; rowIdx++) {
                patternRows.push(innerRowTemplate);
            }
        }

        if (heightVal > 1) {
            patternRows.push("#".repeat(widthVal));
        }

        console.log(patternRows.join("\n") + "\n");
    }
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
