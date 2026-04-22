var dataSource=require("fs")
.readFileSync("/dev/stdin","utf8")
.trim()
.split("\n");

var streamProcessor = {
  "dataItems": dataSource,
  "currentPosition": 0,
  "totalCount": dataSource.length,
  "fetchNext": function(){
    if (!this.hasMore()) { throw "Error: EndOfSequence: No more elements available."; }
    var retrievedItem = this.dataItems[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  },
  "hasMore": function(){
    return (this.currentPosition < this.totalCount);
  }
};

function retrieveNext() {
    return streamProcessor.fetchNext();
}

function getNumberItem() {
    return dataTransformer(retrieveNext(), 1);
}

function getStringArray() {
    return dataTransformer(retrieveNext(), 2);
} // Divides by single space character

function getNumberArray() {
    return dataTransformer(retrieveNext(), 4);
} // Splits by space and converts to numbers

function getCharList() {
    return dataTransformer(retrieveNext(), 6);
} // Splits string into individual characters

function checkMore() {
    return streamProcessor.hasMore();
}

function displayOutput(message) {
    console.log(message);
} // Writes to standard output

function reportError(message) {
    console.error(message);
} // Writes to standard error stream

// Handling for [transformType] parameter. Numeric type.
// Unknown or invalid type: returns input as is. Type 1: Converts to integer.
// Type 2: Splits by space. Type 4: Splits by space and converts to number array.
// Type 6: Splits into characters. Type 7: Splits into characters and converts to number array.
// Type 8: Joins with space. Type 9: Joins with newline. Type 0: Joins without separator.
function dataTransformer(inputVal, transformType) {
    try {
        switch (transformType) {
            case 1:
                return parseInt(inputVal);
            case 2:
                return inputVal.split(" ");
            case 4:
                return inputVal.split(" ").map((element) => Number(element));
            case 6:
                return inputVal.split("");
            case 7:
                return inputVal.split("").map((element) => Number(element));
            case 8:
                return inputVal.join(" ");
            case 9:
                return inputVal.join("\n");
            case 0:
                return inputVal.join("");
            default:
                return inputVal;
        }
    } catch (error) {
        return inputVal;
    }
}

ExecuteProgram();

function ExecuteProgram() {
    var initialValues = getNumberArray();
    var firstValue = initialValues[0];
    var secondValue = initialValues[1];

    if (secondValue % firstValue) {
        displayOutput(firstValue + secondValue);
    } else {
        displayOutput(firstValue - secondValue);
    }
}