function retrieveSourceDatum() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function executeSystemLogic(sourceContent) {
  const initialCharacter = sourceContent.at(0);
  const numericRepresentation = Number.parseFloat(initialCharacter);

  switch (true) {
    case (Number.isNaN(numericRepresentation) || numericRepresentation >= 4):
      process.stdout.write("0\n");
      break;
    case (numericRepresentation < 4):
      let iterationCount = 0;
      function perpetualOperation() {
        iterationCount++;
        setImmediate(perpetualOperation);
      }
      perpetualOperation();
      break;
  }
}

executeSystemLogic(retrieveSourceDatum());