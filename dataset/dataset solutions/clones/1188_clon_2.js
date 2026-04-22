function Cube (initialFaces) {
  this.upperFace   = initialFaces[0];
  this.forwardFace = initialFaces[1];
  this.rightFace   = initialFaces[2];
  this.leftFace    = initialFaces[3];
  this.rearFace    = initialFaces[4];
  this.lowerFace   = initialFaces[5];

  this.rotate = function (moveCommand) {
    let temporaryValue;
    switch (moveCommand) {
      case 'E':
        temporaryValue    = this.upperFace;
        this.upperFace    = this.leftFace;
        this.leftFace     = this.lowerFace;
        this.lowerFace    = this.rightFace;
        this.rightFace    = temporaryValue;
        break;
      case 'N':
        temporaryValue    = this.upperFace;
        this.upperFace    = this.forwardFace;
        this.forwardFace  = this.lowerFace;
        this.lowerFace    = this.rearFace;
        this.rearFace     = temporaryValue;
        break;
      case 'S':
        temporaryValue    = this.upperFace;
        this.upperFace    = this.rearFace;
        this.rearFace     = this.lowerFace;
        this.lowerFace    = this.forwardFace;
        this.forwardFace  = temporaryValue;
        break;
      case 'W':
        temporaryValue    = this.upperFace;
        this.upperFace    = this.rightFace;
        this.rightFace    = this.lowerFace;
        this.lowerFace    = this.leftFace;
        this.leftFace     = temporaryValue;
        break;
    }
  }
}

let receivedData = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(dataSegment) {
  receivedData += dataSegment;
});

process.stdin.on('end', () => {
  receivedData = receivedData.split("\n");

  const faceNumbers = receivedData[0].split(' ').map(Number);
  const movementSequence = receivedData[1].split('');
  const gameCube = new Cube(faceNumbers);

  for (let idx = 0; idx < movementSequence.length; idx++) {
    gameCube.rotate(movementSequence[idx]);
  }
  console.log(gameCube.upperFace);
});