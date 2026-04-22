const processMovementSequence = (inputBlob) => {
  const numericTokens = inputBlob.match(/\d+/g).map(Number);
  const horizontalDimension = numericTokens[2];
  const verticalDimension = numericTokens[3];

  const directives = [
    { chr: "U", cnt: verticalDimension },
    { chr: "R", cnt: horizontalDimension },
    { chr: "D", cnt: verticalDimension },
    { chr: "L", cnt: horizontalDimension },
    { chr: "L", cnt: 1 },
    { chr: "U", cnt: verticalDimension + 1 },
    { chr: "R", cnt: horizontalDimension + 1 },
    { chr: "D", cnt: 1 },
    { chr: "R", cnt: 1 },
    { chr: "D", cnt: verticalDimension + 1 },
    { chr: "L", cnt: horizontalDimension + 1 },
    { chr: "U", cnt: 1 }
  ];

  const finalPath = directives.reduce((accumulator, currentDirective) => {
    return accumulator + currentDirective.chr.repeat(currentDirective.cnt);
  }, "");

  console.log(finalPath);
};

processMovementSequence(require("fs").readFileSync("/dev/stdin", "utf8"));