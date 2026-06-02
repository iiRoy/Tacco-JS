function processSequence(rawData) {
  const parsedLines = rawData.split("\n");
  const sequenceSize = parseInt(parsedLines[0]);
  const numericSequence = parsedLines[1].split(" ").map(Number);

  const initialElement = numericSequence[0];
  const initialCounterCollection = Array(initialElement).fill(1);

  const initialProcessingState = {
    currentCounterCollection: initialCounterCollection,
    lastProcessedValue: initialElement,
    maximumOfLastCollection: initialCounterCollection.length > 0 ? Math.max(...initialCounterCollection) : 0,
    wasLastCollectionUniform: initialCounterCollection.length > 0 ? initialCounterCollection.every(val => val === initialCounterCollection[0]) : true
  };

  const finalProcessingState = numericSequence.slice(1).reduce((accumulator, currentElement) => {
    const { currentCounterCollection, lastProcessedValue, maximumOfLastCollection, wasLastCollectionUniform } = accumulator;

    let nextCounterCollection = [...currentCounterCollection];

    if (currentElement > lastProcessedValue) {
      const valueDifference = currentElement - lastProcessedValue;
      nextCounterCollection.push(...Array(valueDifference).fill(1));
    } else if (wasLastCollectionUniform) {
      nextCounterCollection[currentElement - 1]++;
      nextCounterCollection = nextCounterCollection.slice(0, currentElement);
    } else {
      nextCounterCollection = nextCounterCollection.slice(0, currentElement);
      const targetIndexForIncrement = nextCounterCollection.findLastIndex(val => val !== maximumOfLastCollection);
      if (targetIndexForIncrement !== -1) {
        nextCounterCollection[targetIndexForIncrement]++;
      }
    }

    const nextMaximumOfCollection = nextCounterCollection.length > 0 ? Math.max(...nextCounterCollection) : 0;
    const nextIsCollectionUniform = nextCounterCollection.length > 0 ? nextCounterCollection.every(val => val === nextCounterCollection[0]) : true;

    return {
      currentCounterCollection: nextCounterCollection,
      lastProcessedValue: currentElement,
      maximumOfLastCollection: nextMaximumOfCollection,
      wasLastCollectionUniform: nextIsCollectionUniform
    };
  }, initialProcessingState);

  const ultimateMaximum = finalProcessingState.currentCounterCollection.length > 0 ? Math.max(...finalProcessingState.currentCounterCollection) : 0;

  console.log('%s', ultimateMaximum);
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  processSequence(input);
}
processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
