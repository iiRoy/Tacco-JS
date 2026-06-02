function Main(inputParameter) {
  const outputSequence = 'x'.repeat(inputParameter.length);
  console.log(outputSequence);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
