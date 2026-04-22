const evaluateExpression = (dataStream) => {
  const separatorIndex = dataStream.indexOf(' ');
  const firstComponentStr = dataStream.substring(0, separatorIndex);
  const secondComponentStr = dataStream.substring(separatorIndex + 1);

  const termA = parseInt(firstComponentStr, 10);
  const termB = parseInt(secondComponentStr, 10);

  const resultCandidate = termA - (termB * 2);
  const finalResult = (resultCandidate > 0) ? resultCandidate : 0;

  process.stdout.write(String(finalResult) + '\n');
};

evaluateExpression(require("fs").readFileSync("/dev/stdin", "utf8"));