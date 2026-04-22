const styler = require('stylus');
const treeElements = styler.nodes;

let graphicsEngine = null;
let colorBlends = null;
let pixelMaps = null;

try {
  graphicsEngine = require('canvas');
  colorBlends = require('./nodes/gradient');
  pixelMaps = require('./nodes/color-image');
} catch (e) {
  // Disregard module loading errors
}

const applyStylingDefinitions = (ctx, defMap) => {
  Object.entries(defMap).forEach(([key, val]) => ctx.define(key, val));
};

const extensionGenerator = () => {
  return (sheetContext) => {
    sheetContext.include(__dirname);

    const activeDefinitions = {};

    if (graphicsEngine) {
      activeDefinitions['has-canvas'] = treeElements.true;
      activeDefinitions['create-gradient-image'] = colorBlends.create;
      activeDefinitions['gradient-data-uri'] = colorBlends.dataURL;
      activeDefinitions['add-color-stop'] = colorBlends.addColorStop;
      activeDefinitions['create-color-image'] = pixelMaps.create;
      activeDefinitions['color-data-uri'] = pixelMaps.dataURL;
    } else {
      activeDefinitions['has-canvas'] = treeElements.false;
    }

    applyStylingDefinitions(sheetContext, activeDefinitions);
  };
};

extensionGenerator.versionIdentifier = '0.3.2';
extensionGenerator.resourceLocation = __dirname;

module.exports = extensionGenerator;