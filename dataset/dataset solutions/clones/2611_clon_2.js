var DATA_READER = (function ( ) {
  function createReader ( sourceString ) {
    return new InputSource(sourceString);
  }

  function InputSource ( rawInputText ) {
    this._lines = rawInputText.trim( ) .split( "\n" );
    this._currentLineIndex = 0;
  }

  InputSource.prototype.readNextValue = function ( isStringRequested ) {
    var lineData = this._lines,
        currentIdx = this._currentLineIndex,
        extractedValue;
    if ( typeof lineData[currentIdx] === "string" ) {
      lineData[currentIdx] = lineData[currentIdx].split( " " ) .reverse( );
    }
    extractedValue = lineData[currentIdx].pop( );
    if ( !lineData[currentIdx].length ) {
      this._currentLineIndex++;
    }
    return isStringRequested ? extractedValue : +extractedValue;
  };

  InputSource.prototype.readLineValues = function ( isStringArrayRequested ) {
    var lineTokens = this._lines[this._currentLineIndex++].split( " " );
    return isStringArrayRequested ? lineTokens : lineTokens.map( item => +item );
  };

  InputSource.prototype.readMatrix = function ( numRows, isStringMatrixRequested ) {
    var matrixRows = this._lines.slice( this._currentLineIndex, this._currentLineIndex += numRows ) .map( rowText => rowText.split( " " ) );
    return isStringMatrixRequested ? matrixRows : matrixRows.map( row => row.map( val => +val ) );
  };

  InputSource.prototype.readLinesAsNumbers = function ( numLines, isStringArrayRequested ) {
    var lineArray = this._lines.slice( this._currentLineIndex, this._currentLineIndex += numLines );
    return isStringArrayRequested ? lineArray : lineArray.map( val => +val );
  };

  return createReader;
})();

var inputProcessor = DATA_READER( require("fs").readFileSync("/dev/stdin", "utf8") );

function createMultiDimArray ( defaultValue ) {
  var argsCollection = arguments,
      dimensionIndex = argsCollection.length,
      arrayCreationString = "Array(argsCollection[" + --dimensionIndex + "]).fill(0).map(itemVal=>{return " + defaultValue + ";})";
  while ( --dimensionIndex ) {
    arrayCreationString = "Array(argsCollection[" + dimensionIndex + "]).fill(0).map(innerItem=>" + arrayCreationString + ")";
  }
  return eval( arrayCreationString );
}

var pointCount,
    xCoords = [ ],
    yCoords = [ ],
    pointAngles = [ ];
var sampleResolution = 10000;

console.log( computeOptimalValue( ) );

function computeOptimalValue ( ) {
  var numInitialPoints = inputProcessor.readNextValue( );
  for ( var pointIdx = 0; pointIdx < numInitialPoints; pointIdx++ ) {
    var currentX = inputProcessor.readNextValue( ),
        currentY = inputProcessor.readNextValue( );
    if ( currentX === 0 && currentY === 0 ) {
      continue;
    }
    xCoords.push( currentX );
    yCoords.push( currentY );
    pointAngles.push( calculateAngle( currentX, currentY ) );
  }

  var actualPointCount = xCoords.length;
  var maxSquaredDistance = 0;

  for ( var sampleIteration = 0; sampleIteration < sampleResolution; sampleIteration++ ) {
    var currentSampleAngle = ( sampleIteration + 0.5 ) / sampleResolution * 360;
    var totalXComponent = 0,
        totalYComponent = 0;

    for ( var dataPointIndex = 0; dataPointIndex < actualPointCount; dataPointIndex++ ) {
      var currentPointAngle = pointAngles[dataPointIndex];
      if ( ( currentSampleAngle - 90 < currentPointAngle && currentPointAngle < currentSampleAngle + 90 ) || currentSampleAngle + 270 < currentPointAngle ) {
        totalXComponent += xCoords[dataPointIndex];
        totalYComponent += yCoords[dataPointIndex];
      }
    }
    var currentSquaredMagnitude = totalXComponent * totalXComponent + totalYComponent * totalYComponent;
    if ( maxSquaredDistance < currentSquaredMagnitude ) {
      maxSquaredDistance = currentSquaredMagnitude;
    }
  }
  return Math.sqrt( maxSquaredDistance );
}

function calculateAngle ( coordA, coordB ) {
  if ( coordA === 0 ) {
    return coordB > 0 ? 90 : 270;
  }
  if ( coordB === 0 ) {
    return coordA > 0 ? 0 : 180;
  }
  var rawAngleDegrees = Math.atan( coordB / coordA ) / Math.PI * 180;
  if ( coordA < 0 ) {
    rawAngleDegrees += 180;
  }
  if ( rawAngleDegrees < 0 ) {
    rawAngleDegrees += 360;
  }
  if ( rawAngleDegrees < 0 || rawAngleDegrees >= 360 ) {
    throw ( new Error("Angle calculation out of bounds") );
  }
  return rawAngleDegrees;
}