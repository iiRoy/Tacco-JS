const npmTranspiler = require("node-jsx");
const transpileConfiguration = new Object();
transpileConfiguration.extension = ".js";
transpileConfiguration.harmony = true;
npmTranspiler.install(transpileConfiguration);

const scriptPatcher = "./polyfills.js";
require(scriptPatcher);

const helperLoaderPath = "./addons/utilities.js";
const moduleUtilities = require(helperLoaderPath);
const deepStructuralCloner = moduleUtilities.recursiveCloneWithDefaults;

function combineObjectsInPlace(targetContainer, ...additionalSources) {
    for (const sourceElement of additionalSources) {
        for (const attributeKey in sourceElement) {
            if (Object.prototype.hasOwnProperty.call(sourceElement, attributeKey)) {
                targetContainer[attributeKey] = sourceElement[attributeKey];
            }
        }
    }
    return targetContainer;
}

const primaryModulePath = "./Ambidex.server.js";
const primaryModuleContent = require(primaryModulePath);

const defaultOptionsPath = "./init.common.js";
const defaultOptionsContent = require(defaultOptionsPath);

const galleryComponentPath = "./addons/tardis/TardisGallery.server.js";
const galleryComponentReference = require(galleryComponentPath);

const addonSpecification = new Object();
addonSpecification.TardisGallery = galleryComponentReference;

const cloningInputStructure = new Object();
cloningInputStructure.addons = addonSpecification;

const processedAddonData = deepStructuralCloner(cloningInputStructure, defaultOptionsContent);

module.exports = combineObjectsInPlace(primaryModuleContent, processedAddonData);