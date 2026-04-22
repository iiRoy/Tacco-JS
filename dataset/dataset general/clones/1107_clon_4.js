const transpilerCore = require('babel-core');
const fileSystemOps = require('fs');
const pathUtilities = require('path');

const combineObjects = (target, ...sources) => Object.assign(target, ...sources);

const baseSettings = {
  "debugMode": false,
  "detailedOutput": true,
  "codeExtensions": ['es6.js', 'es6', 'jsx'],
  "esNextStage": 0
};

const processorFunction = (processingContext, isLiterateCode) => {
  const inputCodeString = processingContext.read().toString('utf8');
  const generatedFilePath = processingContext.inputPath + ".js";
  let transformationResult = { code: '', map: null };

  try {
    transformationResult = transpilerCore.transform(inputCodeString, {
      blacklist: ["useStrict"],
      sourceMap: true,
      stage: activeSettings.esNextStage,
      filename: processingContext.pathForSourceMap
    });
  } catch (err) {
    console.log(err);
    return processingContext.error({
      message: 'Code transformation failure',
      sourcePath: processingContext.inputPath,
      line: err.loc.line,
      column: err.loc.column
    });
  }

  processingContext.addJavaScript({
    path: generatedFilePath,
    sourcePath: processingContext.inputPath,
    data: transformationResult.code,
    sourceMap: JSON.stringify(transformationResult.map)
  });
};

const applicationRootDirectory = process.env.PWD || process.cwd();
const configurationFilePath = pathUtilities.join(applicationRootDirectory, 'babel.json');
let externalSettings = {};

if (fileSystemOps.existsSync(configurationFilePath)) {
  const rawExternalConfig = fileSystemOps.readFileSync(configurationFilePath, { encoding: 'utf8' });
  externalSettings = JSON.parse(rawExternalConfig);
}

const activeSettings = combineObjects({}, baseSettings, externalSettings);

for (const extensionEntry of activeSettings.codeExtensions) {
  Plugin.registerSourceHandler(extensionEntry, processorFunction);
}

activeSettings.detailedOutput && console.log(`Babel enabled for: ${activeSettings.codeExtensions.join(', ')}`);

activeSettings.debugMode && (() => {
  console.log("\nBabel configuration details:");
  console.log(activeSettings);
})();