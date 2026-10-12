process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (inputDataBlock) {
  const splitInputParts = inputDataBlock.split(" ");
  const NUM_ELEMENTS_TO_PROCESS = 3;

  let numberContainer = Array.from({ length: NUM_ELEMENTS_TO_PROCESS }, (_, loopIndex) => {
    const currentStringPart = splitInputParts[loopIndex];
    return parseInt(currentStringPart, 10);
  });

  numberContainer.sort();

  const outputParts = [
    numberContainer[0],
    numberContainer[1],
    numberContainer[2]
  ];
  console.log(outputParts.join(" "));
});
