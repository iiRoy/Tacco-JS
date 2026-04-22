var inputBuffer = [];
var inputProcessor = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function axisRollNorth(orientation) {
  return {
    u: orientation.f,
    f: orientation.d,
    r: orientation.r,
    l: orientation.l,
    b: orientation.u,
    d: orientation.b,
  };
}

function axisRollEast(orientation) {
  return {
    u: orientation.l,
    f: orientation.f,
    r: orientation.u,
    l: orientation.d,
    b: orientation.b,
    d: orientation.r,
  };
}

function axialTurn(orientation) {
  return {
    u: orientation.u,
    f: orientation.l,
    r: orientation.f,
    l: orientation.b,
    b: orientation.r,
    d: orientation.d,
  };
}

function faceLocator(targetUpValue, targetFrontValue, initialDieLayout) {
  var currentDieLayout = { ...initialDieLayout
  };

  if (currentDieLayout.f === targetUpValue) {
    currentDieLayout = axisRollNorth(currentDieLayout);
  } else if (currentDieLayout.b === targetUpValue) {
    currentDieLayout = axisRollNorth(axisRollNorth(axisRollNorth(currentDieLayout)));
  } else if (currentDieLayout.r === targetUpValue) {
    currentDieLayout = axisRollEast(currentDieLayout);
  } else if (currentDieLayout.l === targetUpValue) {
    currentDieLayout = axisRollEast(axisRollEast(axisRollEast(currentDieLayout)));
  } else if (currentDieLayout.d === targetUpValue) {
    currentDieLayout = axisRollNorth(axisRollNorth(currentDieLayout));
  }
  // If currentDieLayout.u === targetUpValue, no rotation needed for 'up' face

  while (currentDieLayout.f !== targetFrontValue) {
    currentDieLayout = axialTurn(currentDieLayout);
  }

  return currentDieLayout.r;
}

inputProcessor.on("line", (datum) => {
  inputBuffer.push(datum);
});

inputProcessor.on("close", () => {
  var faceConfiguration = inputBuffer.shift().split(" ");
  var queryQuantity = parseInt(inputBuffer.shift(), 10);

  var initialDieLayout = {
    u: faceConfiguration[0],
    f: faceConfiguration[1],
    r: faceConfiguration[2],
    l: faceConfiguration[3],
    b: faceConfiguration[4],
    d: faceConfiguration[5],
  };

  for (var q = 0; q < queryQuantity; ++q) {
    var queryPair = inputBuffer.shift().split(" ");
    var targetUpValue = queryPair[0];
    var targetFrontValue = queryPair[1];
    var outcome = faceLocator(targetUpValue, targetFrontValue, initialDieLayout);
    console.log(outcome);
  }
});