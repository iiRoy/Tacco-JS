const processInputSequence = (rawData) => {
  const numericalValues = rawData.match(/-?\d+/g).map(Number);

  const valOne = numericalValues[0];
  const valTwo = numericalValues[1];
  const valThree = numericalValues[2];

  const isBetween = (valOne < valThree && valThree < valTwo) || (valOne > valThree && valThree > valTwo);

  console.log(isBetween ? "Yes" : "No");
};

processInputSequence(require("fs").readFileSync("/dev/stdin", "UTF-8"));
