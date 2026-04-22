const processDataUnit = (sourceContent) => {
  const dataSegments = sourceContent.replace(/(^\s*)|(\s*$)/g, '').split(/\r?\n/);
  const firstSegment = dataSegments[0];

  const partsCapture = firstSegment.match(/(\d+)\s+(\d+)/);

  const paramA = Number(partsCapture[1]);
  const paramB = Number(partsCapture[2]);

  const resultValue = paramA - paramB + 1;

  globalThis.console.info(resultValue);
};

const obtainSourceMaterial = (fileDescriptor) => {
  return require('node:fs').readFileSync(fileDescriptor, 'utf8');
};

processDataUnit(obtainSourceMaterial(0));