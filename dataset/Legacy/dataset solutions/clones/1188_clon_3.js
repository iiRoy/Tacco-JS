function DieSimulator(initialFaceValues) {
  this.faceUp    = initialFaceValues[0];
  this.faceFront  = initialFaceValues[1];
  this.faceRight  = initialFaceValues[2];
  this.faceLeft   = initialFaceValues[3];
  this.faceBack   = initialFaceValues[4];
  this.faceDown = initialFaceValues[5];

  // Helper function to perform a cyclic shift of four values
  // Given [A, B, C, D], it returns [B, C, D, A]
  const _cycleFourFaces = (valA, valB, valC, valD) => {
    return [valB, valC, valD, valA];
  };

  this.performRotation = function(rotationType) {
    switch (rotationType) {
      case 'E': // East: Up -> Left -> Down -> Right -> Up
        [this.faceUp, this.faceLeft, this.faceDown, this.faceRight] = _cycleFourFaces(this.faceUp, this.faceLeft, this.faceDown, this.faceRight);
        break;
      case 'N': // North: Up -> Front -> Down -> Back -> Up
        [this.faceUp, this.faceFront, this.faceDown, this.faceBack] = _cycleFourFaces(this.faceUp, this.faceFront, this.faceDown, this.faceBack);
        break;
      case 'S': // South: Up -> Back -> Down -> Front -> Up
        [this.faceUp, this.faceBack, this.faceDown, this.faceFront] = _cycleFourFaces(this.faceUp, this.faceBack, this.faceDown, this.faceFront);
        break;
      case 'W': // West: Up -> Right -> Down -> Left -> Up
        [this.faceUp, this.faceRight, this.faceDown, this.faceLeft] = _cycleFourFaces(this.faceUp, this.faceRight, this.faceDown, this.faceLeft);
        break;
    }
  };
}

let rawInputBuffer = "";
const standardInput = process.stdin;

standardInput.resume();
standardInput.setEncoding('utf-8');

standardInput.on('data', (chunk) => {
  rawInputBuffer += chunk;
});
 
standardInput.on('end', () => {
  // Helper function to parse the raw input string into structured data
  const parseInputData = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    const initialFaceNumbers = inputLines[0].split(' ').map(Number);
    const rotationSequence = inputLines[1].split('');
    return { initialFaceNumbers, rotationSequence };
  };

  const { initialFaceNumbers: parsedFaceNumbers, rotationSequence: rotationMoves } = parseInputData(rawInputBuffer);
  
  const activeDie = new DieSimulator(parsedFaceNumbers);

  rotationMoves.forEach(move => {
    activeDie.performRotation(move);
  });
  
  console.log(activeDie.faceUp);
});
