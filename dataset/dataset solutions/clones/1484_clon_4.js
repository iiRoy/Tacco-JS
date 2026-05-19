function Main(sourceText) {
    const [firstLineContent] = sourceText.trim().split("\n");
    const [firstNum, secondNum] = firstLineContent.split(" ").map(Number);
    console.log(firstNum - (secondNum + 1));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
