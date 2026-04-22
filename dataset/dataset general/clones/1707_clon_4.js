const prettyPrint = require('js-beautify').js_beautify;
const combineObjects = require('deepmerge');
const processStream = require('through2');
const GulpIssueConstructor = require('gulp-util').PluginError;
const analyzeSpacing = require('detect-indent');

module.exports = function (transformationConfig, formattingOptionsCollection) {

  const acquireDataModifier = (configInput) => {
    const typeIndicator = typeof configInput;

    if (typeIndicator === 'function') {
      return (dataPayload) => configInput(dataPayload);
    }

    if (typeIndicator === 'object') {
      return (dataPayload) => combineObjects(dataPayload, configInput);
    }

    const issueText = typeIndicator === 'undefined'
      ? 'missing "configInput" parameter'
      : '"configInput" parameter must be a function or object';
    throw new GulpIssueConstructor('data-transformer-module', issueText);
  };

  const dataModifier = acquireDataModifier(transformationConfig);

  formattingOptionsCollection = formattingOptionsCollection || {};

  return processStream.obj(function (resourceUnit, charEncoding, flowCompletion) {

    if (resourceUnit.isNull()) {
      this.push(resourceUnit);
      return flowCompletion();
    }

    if (resourceUnit.isStream()) {
      this.emit('fault', new GulpIssueConstructor('data-transformer-module', 'Stream processing is not supported'));
      return flowCompletion();
    }

    try {
      const executeContentTransformation = (inputBuffer, globalFormattingSettings) => {
        const textContent = inputBuffer.toString('utf8');
        const spacingCharacteristics = analyzeSpacing(textContent);

        const activeBeautifySettings = combineObjects({}, globalFormattingSettings);
        activeBeautifySettings.indent_size = activeBeautifySettings.indent_size || spacingCharacteristics.amount || 2;
        activeBeautifySettings.indent_char = activeBeautifySettings.indent_char || (spacingCharacteristics.type === 'tab' ? '\t' : ' ');

        const parsedStructure = JSON.parse(textContent);
        const modifiedStructure = dataModifier(parsedStructure);
        const stringifiedRepresentation = JSON.stringify(modifiedStructure, null, spacingCharacteristics.indent);

        const fullyFormattedString = prettyPrint(stringifiedRepresentation, activeBeautifySettings);
        return Buffer.from(fullyFormattedString);
      };

      resourceUnit.contents = executeContentTransformation(resourceUnit.contents, formattingOptionsCollection);

    } catch (issue) {
      this.emit('fault', new GulpIssueConstructor('data-transformer-module', issue));
    }

    this.push(resourceUnit);
    flowCompletion();
  });
};