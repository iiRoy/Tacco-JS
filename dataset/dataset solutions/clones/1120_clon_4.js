class ElementBasket {
  constructor() {
    this.contents = [];
  }

  addOne(piece) {
    this.contents.push(piece);
    this.contents.sort((alpha, beta) => beta - alpha);
  }

  takeTop() {
    if (this.contents.length === 0) {
      return undefined;
    }
    return this.contents.shift();
  }
}

(function processInput() {
  const sourceDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  sourceDataLines.pop();
  const collection = new ElementBasket();
  let outputBuffer = '';

  for (let k = 0; k < sourceDataLines.length; k++) {
    const currentCommand = sourceDataLines[k];
    const commandType = currentCommand.charAt(0);

    if (commandType === 'i') {
      const valueToAdd = Number(currentCommand.split(' ')[1]);
      collection.addOne(valueToAdd);
    } else if (commandType === 'e') {
      outputBuffer += `${collection.takeTop()}\n`;
    }
  }
  process.stdout.write(outputBuffer);
})();