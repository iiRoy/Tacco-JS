function processData(rawData) {
  const foundOnes = rawData.match(/1/g);
  console.log(foundOnes ? foundOnes.length : 0);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
