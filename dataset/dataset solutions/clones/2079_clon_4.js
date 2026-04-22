function emitLine(content) {
  console.log(content);
}

const symbolRegistry = ['a', 'b', 'c'];

const sequenceMatrix = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [0, 1, 1],
  [0, 1, 2]
];

function executeOutputFlow() {
  sequenceMatrix.forEach(indexTuple => {
    const generatedPhrase = indexTuple.map(charIndex => symbolRegistry[charIndex]).join('');
    emitLine(generatedPhrase);
  });
}

executeOutputFlow();