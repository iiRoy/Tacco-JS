require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n').map(function(currentLineValue) {
  let resultString = '';
  for (let bitPosition = 0; bitPosition <= 9; bitPosition++) {
    let bitMask = 1 << bitPosition;
    if ((bitMask & currentLineValue)) {
      resultString += bitMask + ' ';
    }
  }
  console.log(resultString);
});
