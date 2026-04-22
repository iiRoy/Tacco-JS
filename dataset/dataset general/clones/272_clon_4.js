const frameworkAccessor = Package;

const obtainDescription = (keyParam, valueParam) => {
  let descriptorContainer = {};
  descriptorContainer[keyParam] = valueParam;
  return descriptorContainer;
};

const constructPluginConfig = (...attributeTuples) => {
  let configurationObject = {};
  attributeTuples.forEach(pair => {
    if (Array.isArray(pair) && pair.length === 2) {
      configurationObject[pair[0]] = pair[1];
    }
  });
  return configurationObject;
};

const compileExternalDependencies = (...dependencySpecs) => {
  let dependencyRegistry = {};
  dependencySpecs.forEach(spec => {
    if (Array.isArray(spec) && spec.length === 2) {
      dependencyRegistry[spec[0]] = spec[1];
    }
  });
  return dependencyRegistry;
};

const generalSynopsisKey = "summary";
const generalSynopsisText = "Craft user interface templates using HBS and Jade, replacing standard HTML and Handlebars.";

const pluginDesignation = "hbs-jade-tool";
const requiredComponents = ["handlebars"];
const inputLocations = [
  "processor/markup_reader.js",
  "processor/transform_engine.js"
];

const externalModuleA = ["jade", "0.27.7"];
const externalModuleB = ["StringScanner", "0.0.3"];

frameworkAccessor.describe(
  obtainDescription(generalSynopsisKey, generalSynopsisText)
);

frameworkAccessor._transitional_registerBuildPlugin(
  constructPluginConfig(
    ["name", pluginDesignation],
    ["use", requiredComponents],
    ["sources", inputLocations],
    ["npmDependencies", compileExternalDependencies(externalModuleA, externalModuleB)]
  )
);