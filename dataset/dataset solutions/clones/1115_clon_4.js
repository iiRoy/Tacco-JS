(function entryPoint() {
  const fileSystem = require('fs');
  const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = inputContent.trim().split('\n');
  const count = Number(inputLines.shift());
  const dataElements = inputLines.shift().split(' ');
  console.log(' ' + constructMaxPile(dataElements).join(' '));
})();

function constructMaxPile(sourceArray) {
  const pile = [];

  sourceArray.forEach(element => {
    pile.push(element);
    let currentPosition = pile.length - 1;
    let parentPosition = Math.floor((currentPosition - 1) / 2);

    while (currentPosition > 0 && Number(pile[currentPosition]) > Number(pile[parentPosition])) {
      [pile[currentPosition], pile[parentPosition]] = [pile[parentPosition], pile[currentPosition]];
      currentPosition = parentPosition;
      parentPosition = Math.floor((currentPosition - 1) / 2);
    }
  });

  return pile;
}
