const sourceDataAccumulator = [];
const inputFlow = globalThis.process.stdin;
inputFlow.resume();
inputFlow.setEncoding('utf8');

const transformingFunction = (unitGlyph) => {
  if (/[a-z]/.test(unitGlyph)) {
    return unitGlyph.toUpperCase();
  } else if (/[A-Z]/.test(unitGlyph)) {
    return unitGlyph.toLowerCase();
  } else {
    return unitGlyph;
  }
};

inputFlow.on('data', (incomingSlice) => {
  sourceDataAccumulator.push(incomingSlice);

  const currentFullContent = sourceDataAccumulator.join('');
  const modifiedElements = currentFullContent.split('').map(transformingFunction);

  globalThis.console.log(modifiedElements.join(''));
});