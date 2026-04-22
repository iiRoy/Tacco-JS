'use strict';

const filesystem = require('node:fs');
const cleaner    = require('strip-json-comments');
const helpers    = require('loader-utils');
const ConfigFinder = require('rcloader');
const Linter       = require('jscs');

const mergeObjects = function (targetObj) {
  let sourceObj, propertyKey, idx, limit;
  for (idx = 1, limit = arguments.length; idx < limit; idx++) {
    sourceObj = arguments[idx];
    for (propertyKey in sourceObj) {
      if (Object.prototype.hasOwnProperty.call(sourceObj, propertyKey)) {
        targetObj[propertyKey] = sourceObj[propertyKey];
      }
    }
  }
  return targetObj;
};

const configLocator = new ConfigFinder('.jscsrc', null, {
  loader: function (filePath) {
    return filePath;
  }
});

const retrieveSettingsSync = function () {
  const configPath = configLocator.for(this.resourcePath);
  if (typeof configPath !== 'string') {
    return {};
  }

  this.addDependency(configPath);
  const fileContents = filesystem.readFileSync(configPath, 'utf8');
  return JSON.parse(cleaner(fileContents));
};

const retrieveSettingsAsync = function (completionHandler) {
  configLocator.for(this.resourcePath, function (errorObject, configPath) {
    if (typeof configPath !== 'string') {
      return completionHandler(null, {});
    }

    this.addDependency(configPath);
    filesystem.readFile(configPath, 'utf8', function (errorObject, fileContents) {
      let parsedOptions;

      if (!errorObject) {
        try {
          parsedOptions = JSON.parse(cleaner(fileContents));
        }
        catch (exception) {
          errorObject = exception;
        }
      }
      completionHandler(errorObject, parsedOptions);
    });
  }.bind(this));
};


const analyzeCode = function (codeString, configuration) {
  const loaderOptions = this.options.jscs;
  mergeObjects(configuration, loaderOptions);

  const loaderQuery = helpers.parseQuery(this.query);
  mergeObjects(configuration, loaderQuery);

  const reportErrors = configuration.emitErrors;
  delete configuration.emitErrors;
  const haltOnError = configuration.failOnHint;
  delete configuration.failOnHint;

  const reportGenerator = configuration.reporter;
  delete configuration.reporter;

  const codeLinter = new Linter();
  codeLinter.registerDefaultRules();
  codeLinter.configure(configuration);

  const lintResult = codeLinter.checkString(codeString);

  if (!lintResult.isEmpty()) {
    if (reportGenerator) {
      reportGenerator.call(this, lintResult);
    }
    else {
      const errorMessage = lintResult.getErrorList().map(function (issue) {
        return `  ${issue.rule}` +
          ` @ line ${issue.line}` +
          ` column ${issue.column}` +
          `\n    ${issue.message}`;
      }).join('\n\n');

      const notifier = reportErrors ? this.emitError : this.emitWarning;
      if (notifier) {
        notifier(`JSCS issues found:\n${errorMessage}`);
      }
      else {
        throw new Error('Your module system lacks an error/warning emitter.' +
          ' Consider updating or checking environment.\n' + errorMessage);
      }
    }

    if (haltOnError) {
      throw new Error('Module processing terminated due to JSCS style violations.');
    }
  }
};


module.exports = function (inputCode) {
  this.cacheable();

  const asyncCallback = this.async();

  if (!asyncCallback) {
    const retrievedConfig = retrieveSettingsSync.call(this);
    analyzeCode.call(this, inputCode, retrievedConfig);

    return inputCode;
  }

  retrieveSettingsAsync.call(this, function (errorObject, retrievedConfig) {
    if (errorObject) {
      return asyncCallback(errorObject);
    }

    try {
      analyzeCode.call(this, inputCode, retrievedConfig);
    }
    catch (exception) {
      return asyncCallback(exception);
    }

    asyncCallback(null, inputCode);
  }.bind(this));
};