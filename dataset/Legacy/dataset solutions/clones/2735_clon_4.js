function Main(rawData) {
    const lines = rawData.split("\n");

    const elementCount = parseInt(lines[0], 10);
    const originalNumbers = lines.slice(1, elementCount + 1).map(Number);

    Array.from({ length: elementCount }, (_, currentRemovalIndex) => {
        const subsetNumbers = originalNumbers.filter((_, originalIndex) => originalIndex !== currentRemovalIndex);

        const resultValue = subsetNumbers.length > 0 ? Math.max(...subsetNumbers) : undefined;
        console.log(resultValue);
    });
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
