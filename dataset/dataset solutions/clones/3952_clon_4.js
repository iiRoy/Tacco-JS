function processInput(rawData) {
  const dataLines = rawData.split("\n");
  const [countA, countB] = dataLines[0].split(" ").map(Number);

  const hashModificationPoints = new Set();
  for (let iter = 0; iter < countB - 1; iter++) {
    const targetRow = Math.round(iter / 100) * 2;
    const targetCol = (iter % 50) * 2;
    hashModificationPoints.add(`${targetRow},${targetCol}`);
  }

  const dotModificationPoints = new Set();
  for (let iter = 0; iter < countA - 1; iter++) {
    const targetRow = 99 - Math.round(iter / 100) * 2;
    const targetCol = (iter % 50) * 2;
    dotModificationPoints.add(`${targetRow},${targetCol}`);
  }

  const characterMatrix = Array.from({ length: 100 }, (_, rowIndex) =>
    Array.from({ length: 100 }, (_, colIndex) => {
      const currentCoordinate = `${rowIndex},${colIndex}`;
      if (hashModificationPoints.has(currentCoordinate)) {
        return '#';
      }
      if (dotModificationPoints.has(currentCoordinate)) {
        return '.';
      }
      return rowIndex < 50 ? '.' : '#';
    })
  );

  const outputSegments = [`100 100`];
  for (let r = 0; r < 100; r++) {
    outputSegments.push(characterMatrix[r].join(''));
  }
  const finalResult = outputSegments.join('\n');

  console.log(finalResult);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function testExecution() {
  const inputContent = document.getElementById("input").value;
  processInput(inputContent);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
