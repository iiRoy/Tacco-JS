const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let dataStream = {
  itemCollection: rawData,
  currentPosition: 0,
  maximumItems: rawData.length,
  retrieveNext: function() {
    if (!this.hasMoreElements()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    let currentItem = this.itemCollection[this.currentPosition];
    this.currentPosition++;
    return currentItem;
  },
  hasMoreElements: function() {
    return (this.currentPosition < this.maximumItems);
  }
};

ExecutePrimaryLogic();

function fetchNextItem() {
  return dataStream.retrieveNext();
}

function fetchNextInteger() {
  return dataTransformer(fetchNextItem(), 1);
}

function fetchNextStringArray() {
  return dataTransformer(fetchNextItem(), 2);
}

function fetchNextIntegerArray() {
  return dataTransformer(fetchNextItem(), 4);
}

function fetchNextCharacterArray() {
  return dataTransformer(fetchNextItem(), 6);
}

function checkMoreElements() {
  return dataStream.hasMoreElements();
}

function displayOutput(content) {
  console.log(content);
}

function displayError(message) {
  console.error(message);
}

// This function handles various data transformations.
// Type 1: Convert to integer.
// Type 2: Split string by space.
// Type 4: Split string by space and convert to numbers.
// Type 6: Split string into characters.
// Type 7: Split string into characters and convert to numbers.
// Type 8: Join array elements with a space.
// Type 9: Join array elements with a newline.
// Type 0: Join array elements without a separator.
// Default: Return input as is.
function dataTransformer(inputValue, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function ExecutePrimaryLogic() {
  const inputNumber = fetchNextInteger();
  let resultValue = Math.floor(inputNumber / 11) * 2;
  const remainder = inputNumber % 11;

  if (remainder >= 6) {
    resultValue += 2;
  } else if (remainder > 0) {
    resultValue++;
  }

  displayOutput(resultValue);
}
