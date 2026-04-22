function Cube(faceValues) {
  this.upperFace   = faceValues[0];
  this.forwardFace = faceValues[1];
  this.starboardFace = faceValues[2];
  this.portFace    = faceValues[3];
  this.rearFace    = faceValues[4];
  this.lowerFace   = faceValues[5];

  this.rotate = function(orientation) {
    let tempHold;
    switch (orientation) {
      case 'EAST':
        tempHold        = this.upperFace;
        this.upperFace   = this.portFace;
        this.portFace    = this.lowerFace;
        this.lowerFace   = this.starboardFace;
        this.starboardFace = tempHold;
        break;
      case 'NORTH':
        tempHold        = this.upperFace;
        this.upperFace   = this.forwardFace;
        this.forwardFace = this.lowerFace;
        this.lowerFace   = this.rearFace;
        this.rearFace    = tempHold;
        break;
      case 'SOUTH':
        tempHold        = this.upperFace;
        this.upperFace   = this.rearFace;
        this.rearFace    = this.lowerFace;
        this.lowerFace   = this.forwardFace;
        this.forwardFace = tempHold;
        break;
      case 'WEST':
        tempHold        = this.upperFace;
        this.upperFace   = this.starboardFace;
        this.starboardFace = this.lowerFace;
        this.lowerFace   = this.portFace;
        this.portFace    = tempHold;
        break;
    }
  };

  this.swivel = function(orientation) {
    let tempHold;
    switch (orientation) {
      case 'RIGHT':
        tempHold        = this.forwardFace;
        this.forwardFace = this.starboardFace;
        this.starboardFace = this.rearFace;
        this.rearFace    = this.portFace;
        this.portFace    = tempHold;
        break;
      case 'LEFT':
        tempHold        = this.forwardFace;
        this.forwardFace = this.portFace;
        this.portFace    = this.rearFace;
        this.rearFace    = this.starboardFace;
        this.starboardFace = tempHold;
        break;
    }
  };

  this.alignUpper = function(desiredUpper) {
    switch (desiredUpper) {
      case this.upperFace:
        break;
      case this.forwardFace:
        this.rotate('NORTH');
        break;
      case this.starboardFace:
        this.rotate('WEST');
        break;
      case this.portFace:
        this.rotate('EAST');
        break;
      case this.rearFace:
        this.rotate('SOUTH');
        break;
      case this.lowerFace:
        this.rotate('NORTH');
        this.rotate('NORTH');
        break;
    }
  };

  this.alignForward = function(desiredForward) {
    switch (desiredForward) {
      case this.upperFace:
        break;
      case this.forwardFace:
        break;
      case this.starboardFace:
        this.swivel('RIGHT');
        break;
      case this.portFace:
        this.swivel('LEFT');
        break;
      case this.rearFace:
        this.swivel('RIGHT');
        this.swivel('RIGHT');
        break;
      case this.lowerFace:
        break;
    }
  };
}


let dataBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(dataSegment) {
  dataBuffer += dataSegment;
});

process.stdin.on('end', function() {
  dataBuffer = dataBuffer.split("\n");

  let sourceCube = new Cube(dataBuffer[0].split(' ').map(Number));
  let destinationCube = new Cube(dataBuffer[1].split(' ').map(Number));
  let comparisonOutcome = 'Mismatch';

  for (let outerLoopIdx = 0; outerLoopIdx < 8; ++outerLoopIdx) {
    for (let innerLoopIdx = 0; innerLoopIdx < 4; ++innerLoopIdx) {
      destinationCube.swivel('RIGHT');
      if (sourceCube.upperFace    == destinationCube.upperFace   &&
          sourceCube.forwardFace  == destinationCube.forwardFace &&
          sourceCube.starboardFace == destinationCube.starboardFace &&
          sourceCube.portFace     == destinationCube.portFace    &&
          sourceCube.rearFace     == destinationCube.rearFace    &&
          sourceCube.lowerFace    == destinationCube.lowerFace) {
        comparisonOutcome = 'Match';
      }
    }
    if (outerLoopIdx < 4) {
      destinationCube.rotate('NORTH');
    } else {
      destinationCube.rotate('WEST');
    }
  }
  console.log(comparisonOutcome);
});