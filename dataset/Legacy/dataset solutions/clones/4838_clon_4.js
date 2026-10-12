process.stdin.resume();
process.stdin.setEncoding('utf8');

function ProcessInput(rawInput) {
  const [firstDataLine] = rawInput.split("\n");
  const [paramX, paramY, paramZ] = firstDataLine.split(" ").map(Number);

  let resultCount;

  const initialMultiple = Math.ceil(paramX / paramZ) * paramZ;
  const finalMultiple = Math.floor(paramY / paramZ) * paramZ;

  if (initialMultiple > finalMultiple) {
    resultCount = 0;
  } else {
    resultCount = (finalMultiple - initialMultiple) / paramZ + 1;
  }

  console.log(resultCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
