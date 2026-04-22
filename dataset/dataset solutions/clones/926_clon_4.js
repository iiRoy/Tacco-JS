const inputIndex = parseInt(process.argv[2], 10);

if (inputIndex === 0 || inputIndex === 1) {
  console.log(1);
} else {
  let prevVal = 1;
  let currentVal = 1;
  let nextVal;

  for (let idx = 2; idx <= inputIndex; idx++) {
    nextVal = prevVal + currentVal;
    prevVal = currentVal;
    currentVal = nextVal;
  }
  console.log(currentVal);
}