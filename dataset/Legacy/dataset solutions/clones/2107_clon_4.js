function processInput(rawInput) {
  const lines = rawInput.trim().split("\n");
  const initialString = lines[0][0];
  const queryCount = Number(lines[1]);

  const queryList = [];
  for (let idx = 0; idx < queryCount; idx++) {
    queryList.push(lines[idx + 2].split(" "));
  }

  const frontBuffer = [];
  const backBuffer = Array.from(initialString);
  let currentDirection = 1;

  for (let idx = 0; idx < queryCount; idx++) {
    const currentQuery = queryList[idx];
    const queryType = currentQuery[0];

    if (queryType === '1') {
      currentDirection *= -1;
    } else {
      const addPosition = currentQuery[1];
      const charValue = currentQuery[2];

      if (currentDirection === 1) {
        if (addPosition === '1') {
          frontBuffer.push(charValue);
        } else {
          backBuffer.push(charValue);
        }
      } else {
        if (addPosition === '1') {
          backBuffer.push(charValue);
        } else {
          frontBuffer.push(charValue);
        }
      }
    }
  }

  let finalStringParts = [];
  if (currentDirection === 1) {
    finalStringParts = frontBuffer.reverse().concat(backBuffer);
  } else {
    finalStringParts = backBuffer.reverse().concat(frontBuffer);
  }

  console.log(finalStringParts.join(''));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
