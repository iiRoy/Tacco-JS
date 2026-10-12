let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
  inputBuffer += buf;
});

process.stdin.on('end', () => {
  const [firstCube, secondCube] = inputBuffer
    .trim()
    .split('\n')
    .map(line => line.split(' ').map(n => parseInt(n, 10)))
    .map(faceValues => formCube(faceValues));

  console.log(checkEquivalence(firstCube, secondCube) ? 'Yes' : 'No');
});

const formCube = faceValues => ({
  up: faceValues[0],
  front: faceValues[4],
  right: faceValues[2],
  left: faceValues[3],
  back: faceValues[1],
  down: faceValues[5],
});

const rotateCube = (currentCube, motion) => {
  const { up, front, right, left, back, down } = currentCube;
  const transformations = {
    'N': { up: front, front: down, right: right, left: left, back: up, down: back },
    'S': { up: back, front: up, right: right, left: left, back: down, down: front },
    'W': { up: right, front: front, right: down, left: up, back: back, down: left },
    'E': { up: left, front: front, right: up, left: down, back: back, down: right }
  };
  return transformations[motion];
};

const areCubesIdentical = (cube1, cube2) => {
  return (
    cube1.up === cube2.up &&
    cube1.front === cube2.front &&
    cube1.right === cube2.right &&
    cube1.left === cube2.left &&
    cube1.back === cube2.back &&
    cube1.down === cube2.down
  );
};

const getAllOrientations = (initialCube) => {
  const allStates = [];
  const addRotations = (baseCube) => {
    let tempCube = baseCube;
    for (let i = 0; i < 4; i++) {
      allStates.push(tempCube);
      tempCube = rotateCube(tempCube, 'E');
    }
  };

  addRotations(initialCube);
  addRotations(rotateCube(initialCube, 'N'));
  addRotations(rotateCube(initialCube, 'S'));
  addRotations(rotateCube(rotateCube(initialCube, 'N'), 'N'));
  addRotations(rotateCube(initialCube, 'W'));
  addRotations(rotateCube(initialCube, 'E'));

  return allStates;
};

const checkEquivalence = (firstCube, secondCube) => {
  const allFirstCubeOrientations = getAllOrientations(firstCube);
  return allFirstCubeOrientations.some(orientedCube => areCubesIdentical(orientedCube, secondCube));
};
