function processInputData(rawData) {
  const firstLineContent = rawData.split('\n')[0].trim();

  const charPattern = /^(\S+)\s(\S)/;
  const matchResult = firstLineContent.match(charPattern);

  const targetChar = matchResult[2];

  console.log(`A${targetChar}C`);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
