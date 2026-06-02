var DATA_PARSER = (function () {
  function createParser(rawInputString) {
    return new InputReader(rawInputString);
  }

  function InputReader(initialString) {
    this._sourceLines = initialString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  InputReader.prototype.readNextValue = function (asString) {
    var lineSegments = this._sourceLines,
      currentLine = this._currentLineIndex,
      resultValue;

    if (typeof lineSegments[currentLine] === "string") {
      lineSegments[currentLine] = lineSegments[currentLine].split(" ").reverse();
    }

    resultValue = lineSegments[currentLine].pop();

    if (!lineSegments[currentLine].length) {
      this._currentLineIndex++;
    }

    return asString ? resultValue : +resultValue;
  };

  InputReader.prototype.readLineValues = function (asStrings) {
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? lineContent : lineContent.map(val => +val);
  };

  InputReader.prototype.readMatrix = function (numRows, asStrings) {
    var matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map(rowStr => rowStr.split(" "));
    return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  InputReader.prototype.readVector = function (numElements, asStrings) {
    var vectorElements = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numElements)
    );
    return asStrings ? vectorElements : vectorElements.map(val => +val);
  };

  return createParser;
})();

var inputData = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    arrayCreationString =
      "Array(args[" +
      --argCount +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  while (--argCount) {
    arrayCreationString =
      "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

var itemCount,
  xCoords = [],
  yCoords = [],
  angles = [];

var rotationSteps = 360000;

console.log(processData());

function processData() {
  itemCount = inputData.readNextValue();

  for (var idx = 0; idx < itemCount; idx++) {
    var currentX = inputData.readNextValue(),
      currentY = inputData.readNextValue();

    if (currentX === 0 && currentY === 0) {
      continue;
    }

    xCoords.push(currentX);
    yCoords.push(currentY);
    angles.push(calculateAngle(currentX, currentY));
  }

  itemCount = xCoords.length;
  var maxSquaredMagnitude = 0;

  for (var step = 0; step < rotationSteps; step++) {
    var currentAngle = (step / rotationSteps) * 360;
    var totalXComponent = 0,
      totalYComponent = 0;

    for (var itemIdx = 0; itemIdx < itemCount; itemIdx++) {
      var itemAngle = angles[itemIdx];
      if (
        (currentAngle - 90 < itemAngle && itemAngle < currentAngle + 90) ||
        currentAngle + 270 < itemAngle
      ) {
        totalXComponent += xCoords[itemIdx];
        totalYComponent += yCoords[itemIdx];
      }
    }

    var currentSquaredMagnitude =
      totalXComponent * totalXComponent + totalYComponent * totalYComponent;
    if (maxSquaredMagnitude < currentSquaredMagnitude) {
      maxSquaredMagnitude = currentSquaredMagnitude;
    }
  }

  return Math.sqrt(maxSquaredMagnitude);
}

function calculateAngle(coordX, coordY) {
  if (coordX === 0) {
    return coordY > 0 ? 90 : 270;
  }
  if (coordY === 0) {
    return coordX > 0 ? 0 : 180;
  }

  var angleInDegrees = (Math.atan(coordY / coordX) / Math.PI) * 180;
  if (coordX < 0) {
    angleInDegrees += 180;
  }
  if (angleInDegrees < 0) {
    angleInDegrees += 360;
  }

  return angleInDegrees;
}
