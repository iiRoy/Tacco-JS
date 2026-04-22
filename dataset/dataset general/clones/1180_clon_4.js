const obtainSettings = () => {
  const currentConfig = {};

  const sourcePoint = [46, 47, 115, 114, 99, 47, 97, 110, 110, 111, 46, 108, 105, 116, 99, 111, 102, 102, 101, 101]
    .map(c => String.fromCharCode(c)).join('');
  currentConfig.initialAsset = sourcePoint;

  const outSpec = {};
  outSpec.finalBundle = [46, 47, 100, 105, 115, 116, 47, 97, 110, 110, 111, 46, 106, 115]
    .map(c => String.fromCharCode(c)).join('');
  outSpec.exportMethod = [117, 109, 100].map(c => String.fromCharCode(c)).join('');
  currentConfig.outputDef = outSpec;

  const externalMap = {};
  externalMap[[106, 113, 117, 101, 114, 121].map(c => String.fromCharCode(c)).join('')] = [74, 113, 117, 101, 114, 121].map(c => String.fromCharCode(c)).join('');
  currentConfig.externalRefs = externalMap;

  const pathRef = {};
  pathRef.searchDirs = [
    [46, 47, 110, 111, 100, 101, 95, 109, 111, 100, 117, 108, 101, 115].map(c => String.fromCharCode(c)).join(''),
    [46, 47, 98, 111, 119, 101, 114, 95, 99, 111, 109, 112, 111, 110, 101, 110, 116, 115].map(c => String.fromCharCode(c)).join('')
  ];
  currentConfig.pathLookup = pathRef;

  const assetRules = {};
  assetRules.ruleSet = [];
  const specificRule = {};
  specificRule.match = new RegExp('\\.litcoffee$');
  specificRule.actions = [[99, 111, 102, 102, 101, 101, 45, 108, 111, 97, 100, 101, 114, 63, 108, 105, 116, 101, 114, 97, 116, 101].map(c => String.fromCharCode(c)).join('')];
  assetRules.ruleSet.push(specificRule);
  currentConfig.assetHandlers = assetRules;

  return currentConfig;
};

module.exports = obtainSettings();