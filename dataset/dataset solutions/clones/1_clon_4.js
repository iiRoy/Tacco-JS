function generateMultiplicationOutput(currentOuter = 1, currentInner = 1) {
  if (currentOuter > 9) {
    return;
  }

  console.log(currentOuter + "x" + currentInner + "=" + currentInner * currentOuter);

  if (currentInner < 9) {
    generateMultiplicationOutput(currentOuter, currentInner + 1);
  } else {
    generateMultiplicationOutput(currentOuter + 1, 1);
  }
}

generateMultiplicationOutput();
