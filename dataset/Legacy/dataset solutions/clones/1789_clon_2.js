function ProcessInput(rawData) {
  const dataRows = rawData.split("\n");

  const firstRow = dataRows[0];
  const firstRowParts = firstRow.split(" ");

  const secondRow = dataRows[1];
  const secondRowParts = secondRow.split(" ");

  const thirdRow = dataRows[2];

  const posA = parseInt(firstRowParts[0], 10);
  const speedA = parseInt(firstRowParts[1], 10);

  const posB = parseInt(secondRowParts[0], 10);
  const speedB = parseInt(secondRowParts[1], 10);

  const maxTime = parseInt(thirdRow, 10);

  if (speedA <= speedB) {
    console.log((posA === posB) ? "YES" : "NO");
    return;
  }

  const requiredTime = Math.abs(posB - posA) / Math.abs(speedA - speedB);
  console.log((0 < requiredTime && requiredTime <= maxTime) ? "YES" : "NO");
  return;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
