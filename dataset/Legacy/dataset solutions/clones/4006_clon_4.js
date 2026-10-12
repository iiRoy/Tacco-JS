function Main(input) {
    const processedLines = input.split('\n');
    const targetLineElements = processedLines[1].split(' ');
    const hasSpecificElement = targetLineElements.some(item => item === 'Y');
    console.log(hasSpecificElement ? 'Four' : 'Three');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
