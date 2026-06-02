class Cube {
  constructor(initialValues) {
    this._faces = [...initialValues];
  }

  get currentTop() {
    return this._faces[0];
  }

  static _rotationMaps = {
    'E': [3, 1, 0, 5, 4, 2], // new_top=old_left, new_right=old_top, new_bottom=old_right, new_left=old_bottom
    'N': [1, 5, 2, 3, 0, 4], // new_top=old_front, new_front=old_bottom, new_bottom=old_back, new_back=old_top
    'S': [4, 0, 2, 3, 5, 1], // new_top=old_back, new_back=old_bottom, new_bottom=old_front, new_front=old_top
    'W': [2, 1, 5, 0, 4, 3]  // new_top=old_right, new_right=old_bottom, new_bottom=old_left, new_left=old_top
  };

  rotate(moveChar) {
    const permutation = Cube._rotationMaps[moveChar];
    const newFaces = new Array(6);
    for (let idx = 0; idx < 6; idx++) {
      newFaces[idx] = this._faces[permutation[idx]];
    }
    this._faces = newFaces;
  }
}

let rawInput = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  rawInput += chunk;
});

process.stdin.on('end', function() {
  const lines = rawInput.split("\n");

  const parsedNumbers = lines[0].split(' ').map(Number);
  const moveSequence = lines[1].split('');
  
  const currentCube = new Cube(parsedNumbers);

  moveSequence.forEach(move => currentCube.rotate(move));
  
  console.log(currentCube.currentTop);
});
