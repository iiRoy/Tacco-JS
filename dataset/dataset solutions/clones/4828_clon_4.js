const stringReverser = (originalString) => {
  let reversedForm = '';
  let indexCounter = originalString.length;
  while (indexCounter--) {
    reversedForm += originalString[indexCounter];
  }
  return reversedForm;
};

const wordFragments = ["dream", "dreamer", "erase", "eraser"].map(stringReverser);

const checkParseability = (currentSegment) => {
  if (currentSegment.length === 0) {
    return true;
  }

  let nextPortion = currentSegment;
  let matchIdentified = false;

  for (const lexiconItem of wordFragments) {
    if (nextPortion.startsWith(lexiconItem)) {
      nextPortion = nextPortion.substring(lexiconItem.length);
      matchIdentified = true;
      break;
    }
  }

  if (matchIdentified) {
    return checkParseability(nextPortion);
  } else {
    return false;
  }
};

const entryPointFunction = (initialInput) => {
  const transformedInput = stringReverser(initialInput);
  const finalDetermination = checkParseability(transformedInput);

  if (finalDetermination) {
    console.log("YES");
  } else {
    console.log("NO");
  }
};

entryPointFunction(require("fs").readFileSync("/dev/stdin", "utf-8"));