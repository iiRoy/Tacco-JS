const processText = (phrase) => {
  const primaryMark = phrase.charAt(0);
  let exclusionPoint = phrase.indexOf(primaryMark, 1);

  if (exclusionPoint === -1) {
    exclusionPoint = phrase.length - 1;
  }

  const remainingElements = Array.from(phrase).filter((element, position) => {
    return position !== 0 && position !== exclusionPoint;
  });

  const firstComparable = remainingElements[0];
  const secondComparable = remainingElements[1];

  return (firstComparable === secondComparable) ? "Positive" : "Negative";
};

function EntryPoint(textData) {
  const outcome = processText(textData);
  console.log(outcome);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));