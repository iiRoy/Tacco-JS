function Main(input) {
  const firstLineContent = input.split('\n')[0] || '';
  const extractedTokens = firstLineContent.match(/(\S+)/g) || [];

  const numericalValueA = parseFloat(extractedTokens[0]);
  const numericalValueB = parseFloat(extractedTokens[1]);

  console.log(numericalValueA / numericalValueB);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
