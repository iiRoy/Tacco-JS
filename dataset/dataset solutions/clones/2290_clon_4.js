function processInputData(rawData) {
  const sourceLine = rawData.split("\n")[0];

  const firstSpacePosition = sourceLine.indexOf(' ');

  let primaryToken;
  let secondaryToken;

  if (firstSpacePosition === -1) {
    primaryToken = sourceLine;
    secondaryToken = undefined;
  } else {
    primaryToken = sourceLine.substring(0, firstSpacePosition);
    const remainingContent = sourceLine.substring(firstSpacePosition + 1);
    const secondSpacePosition = remainingContent.indexOf(' ');

    if (secondSpacePosition === -1) {
      secondaryToken = remainingContent;
    } else {
      secondaryToken = remainingContent.substring(0, secondSpacePosition);
    }
  }

  console.log(secondaryToken + primaryToken);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
