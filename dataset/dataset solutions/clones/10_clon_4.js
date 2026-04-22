const retrieveGlobal = () => globalThis;

const obtainAttribute = (source, attributeKey) => source[attributeKey];

const produceOutput = (payloadContents) => {
  const utilityModule = obtainAttribute(retrieveGlobal(), 'require')('util');
  const inspectionTool = obtainAttribute(utilityModule, 'inspect');
  
  const stringRepresentation = inspectionTool(payloadContents, { depth: null, colors: false });
  
  const stdOutputChannel = obtainAttribute(obtainAttribute(retrieveGlobal(), 'process'), 'stdout');
  obtainAttribute(stdOutputChannel, 'write')(stringRepresentation + '\n');
};

const performOperation = () => {
  const currentGlobal = retrieveGlobal();
  const runtimeObject = obtainAttribute(currentGlobal, 'process');
  const versionCollection = obtainAttribute(runtimeObject, 'versions');
  
  produceOutput(versionCollection);
};

setTimeout(performOperation, 0);