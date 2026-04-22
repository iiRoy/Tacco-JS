const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.question('', (inputQuery) => {
  const queryValue = parseInt(inputQuery, 10);

  const explorationLimit = 121;

  const powerRepository = new Map();

  for (let currentIter = -explorationLimit; currentIter < explorationLimit; ++currentIter) {
    const poweredValue = Math.pow(currentIter, 5);
    powerRepository.set(poweredValue, currentIter);
  }

  for (let subjectOne = -explorationLimit; subjectOne < explorationLimit; ++subjectOne) {
    const poweredSubjectOne = Math.pow(subjectOne, 5);
    const targetPoweredSubjectTwo = poweredSubjectOne - queryValue;

    if (powerRepository.has(targetPoweredSubjectTwo)) {
      const subjectTwo = powerRepository.get(targetPoweredSubjectTwo);
      console.log(subjectOne, subjectTwo);
      inputReader.close();
      return;
    }
  }
});