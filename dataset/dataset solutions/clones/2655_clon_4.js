const evaluateData = (sourceString) => {
  const dividerPos = sourceString.indexOf(' ');
  const valA = +sourceString.slice(0, dividerPos);
  const valB = +sourceString.slice(dividerPos + 1);

  const outcomeMap = {
    addition: valA + valB,
    subtraction: valA - valB,
    multiplication: valA * valB
  };
};

evaluateData(require("fs").readFileSync("/dev/stdin", "utf8"));