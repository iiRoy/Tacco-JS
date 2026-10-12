function Cube(initialFaces) {
  this.upperFace   = initialFaces[0];
  this.forwardFace = initialFaces[1];
  this.rightSide   = initialFaces[2];
  this.leftSide    = initialFaces[3];
  this.rearFace    = initialFaces[4];
  this.lowerFace   = initialFaces[5];

  this.rotate = function(rotationDir) {
    let swapVar;
    switch (rotationDir) {
      case 'E':
        swapVar         = this.upperFace;
        this.upperFace   = this.leftSide;
        this.leftSide    = this.lowerFace;
        this.lowerFace   = this.rightSide;
        this.rightSide   = swapVar;
        break;
      case 'N':
        swapVar         = this.upperFace;
        this.upperFace   = this.forwardFace;
        this.forwardFace = this.lowerFace;
        this.lowerFace   = this.rearFace;
        this.rearFace    = swapVar;
        break;
      case 'S':
        swapVar         = this.upperFace;
        this.upperFace   = this.rearFace;
        this.rearFace    = this.lowerFace;
        this.lowerFace   = this.forwardFace;
        this.forwardFace = swapVar;
        break;
      case 'W':
        swapVar         = this.upperFace;
        this.upperFace   = this.rightSide;
        this.rightSide   = this.lowerFace;
        this.lowerFace   = this.leftSide;
        this.leftSide    = swapVar;
        break;
    }
  };
}



let receivedData = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  receivedData += chunk;
});

process.stdin.on('end', function() {
  let lines = receivedData.split("\n");

  let faceNumbers = lines[0].split(' ').map(Number);
  let rotationCommands = lines[1].split('');
  let gameDie = new Cube(faceNumbers);

  for (let idx = 0; idx < rotationCommands.length; idx++) {
    gameDie.rotate(rotationCommands[idx]);
  }
  console.log(gameDie.upperFace);
});
