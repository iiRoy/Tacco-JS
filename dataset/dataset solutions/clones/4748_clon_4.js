const processInputData = (rawDataContent) => {
  const newlinePosition = rawDataContent.indexOf('\n');
  // The first line (original 'len') is not used in the core logic, so we extract only the second line.
  const dataLineSegment = rawDataContent.substring(newlinePosition + 1);
  
  const stringFragments = dataLineSegment.split(' ');
  
  // Use a Set to efficiently collect unique string fragments.
  // This replaces the original's sort + filter with indexOf for uniqueness.
  const distinctElements = new Set();
  stringFragments.forEach(fragment => {
    distinctElements.add(fragment);
  });

  const distinctCount = distinctElements.size;
  
  // Apply the conditional logic using a ternary operator for a different control flow structure.
  console.log(distinctCount % 2 === 1 ? distinctCount : distinctCount - 1);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
