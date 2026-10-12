function Main(input) {
    const lineExtractor = /^([^\n]*)/;
    const firstLineResult = input.match(lineExtractor);
    const extractedLine = firstLineResult ? firstLineResult[1] : "";
    const prefixChecker = /^YAKI/;
    const isPrefixMatch = prefixChecker.test(extractedLine);
    console.log(isPrefixMatch ? "Yes" : "No");
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
