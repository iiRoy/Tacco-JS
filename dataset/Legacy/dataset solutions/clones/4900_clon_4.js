let sourceString = "FFFFdfadadadfd";

let charSequence = sourceString.split('');
let hasSeenC = false;
let irrelevantFlag = false;

function checkSequence(inputParam) {
  const firstCIndex = charSequence.findIndex(char => char === 'C');

  if (firstCIndex !== -1) {
    hasSeenC = true;
    const foundFAfterC = charSequence.slice(firstCIndex + 1).some(char => char === 'F');

    if (foundFAfterC) {
      return true;
    }
  } else {
    return false;
  }
}

checkSequence(sourceString);
