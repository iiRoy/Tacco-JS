function Main(sourceData) {
    const finalTally = sourceData.split('').reduce((currentSum, charElement) => {
        return currentSum + (charElement === '-' ? -1 : 1);
    }, 0);

    console.log(finalTally + '\n');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
