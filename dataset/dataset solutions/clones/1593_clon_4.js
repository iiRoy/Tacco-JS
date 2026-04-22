const analyzeSequence = (sequenceData) => {
  const lineContent = sequenceData.split('\n')[0];
  
  const pattern = /(^R|(?<=R)R)/g;
  
  const matchCollection = lineContent.match(pattern);
  
  const outcomeValue = matchCollection ? matchCollection.length : 0;
  
  globalThis.process.stdout.write(outcomeValue.toString() + '\n');
};

const systemResourceAcquirer = typeof globalThis.require === 'function' ? globalThis.require : null;

if (!systemResourceAcquirer) {
  throw new Error("Node.js 'require' function not found in global scope.");
}

const systemIOModule = systemResourceAcquirer('node:fs');

const rawSourceInput = systemIOModule.readFileSync(0, 'utf8');

analyzeSequence(rawSourceInput);