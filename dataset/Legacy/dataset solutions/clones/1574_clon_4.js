function Main(rawText) {
    const firstLine = rawText.split("\n")[0];

    const totalValue = Array.from(firstLine).reduce((currentSum, charElement) => {
        const numericPart = parseInt(charElement, 10);
        return currentSum + numericPart;
    }, 0);

    const finalVerdict = (totalValue % 9 === 0) ? "Yes" : "No";

    console.log(finalVerdict);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
