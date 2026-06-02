function calculateRatio(sourceData) {
  const spaceMarker = sourceData.indexOf(' ');
  const valueOneString = sourceData.substring(0, spaceMarker);
  const valueTwoString = sourceData.substring(spaceMarker + 1);

  const termA = parseFloat(valueOneString);
  const termB = parseFloat(valueTwoString);

  console.log(termA * termB / (termA + termB));
}

calculateRatio(require("fs").readFileSync("/dev/stdin", "utf8"));
