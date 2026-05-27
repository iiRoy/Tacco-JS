function processInputData (rawInput) {
  const dataParts = rawInput.split(' ');
  const firstVal = dataParts[0];
  const secondVal = dataParts[1];
  const thirdVal = dataParts[2];

  const isFirstEqSecond = (firstVal === secondVal);
  const isFirstEqThird = (firstVal === thirdVal);
  const isSecondEqThird = (secondVal === thirdVal);

  let equalityCount = 0;
  if (isFirstEqSecond) {
    equalityCount++;
  }
  if (isFirstEqThird) {
    equalityCount++;
  }
  if (isSecondEqThird) {
    equalityCount++;
  }

  if (equalityCount === 1) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
