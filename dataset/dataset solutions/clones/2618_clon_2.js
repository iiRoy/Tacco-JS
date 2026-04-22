function ExecuteProgram(rawData) {
  rawData = rawData.split("\n");

  const firstLineElements = rawData[0].split(" ");

  const quantityItems = parseInt(firstLineElements[0]);
  const multiplierFactor = parseInt(firstLineElements[1]);

  const itemValues = rawData[1].split(" ").map(valElement => parseInt(valElement));


  var totalInversions = 0;

  for (let idxCurrent = 0; idxCurrent < quantityItems; idxCurrent++) {
    var smallerRightCount = itemValues.slice(idxCurrent + 1).filter(valElement => valElement < itemValues[idxCurrent]).length;

    var smallerTotalCount = itemValues.filter(valElement => valElement < itemValues[idxCurrent]).length;

    totalInversions += smallerRightCount * multiplierFactor;

    totalInversions += Math.floor(smallerTotalCount * (multiplierFactor - 1) * multiplierFactor / 2);
  }


  console.log(totalInversions % (Math.pow(10, 9) + 7));
}

ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));