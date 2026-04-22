const diskOps = require('fs');
const commentRemover = require('strip-json-comments');
const utilityBelt = require('loader-utils');
const ConfigFetcher = require('rcloader');
const StyleValidator = require('jscs');
const nodeUtil = require('util');

const readDiskFile = nodeUtil.promisify(diskOps.readFile);
const obtainConfigPath = nodeUtil.promisify(ConfigFetcher.for).bind(new ConfigFetcher('.styleguide', null, {
  fileProcessor: (filePath) => filePath
}));

const combineObjects = Object.assign;

class ConfigurationProcessor {
  constructor(loaderInstance) {
    this.context = loaderInstance;
  }

  async acquireAsyncSettings() {
    const resourceLocation = this.context.resourcePath;
    let settingsFilePath;

    try {
      settingsFilePath = await obtainConfigPath(resourceLocation);
    } catch (problem) {
      // If rcloader itself throws, it's a real error.
      // If no config is found, it resolves with undefined.
    }

    if (typeof settingsFilePath !== 'string') {
      return {};
    }

    this.context.addDependency(settingsFilePath);

    const contentFromDisk = await readDiskFile(settingsFilePath, 'utf8');
    return JSON.parse(commentRemover(contentFromDisk));
  }

  acquireSyncSettings() {
    const resourceLocation = this.context.resourcePath;
    const settingsFetcher = new ConfigFetcher('.styleguide', null, {
      fileProcessor: (filePath) => filePath
    });
    const settingsFilePath = settingsFetcher.for(resourceLocation);

    if (typeof settingsFilePath !== 'string') {
      return {};
    }

    this.context.addDependency(settingsFilePath);

    const contentFromDisk = diskOps.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(commentRemover(contentFromDisk));
  }
}

const performStyleCheck = (sourceContent, baseConfig, loaderInstance) => {
  const finalConfig = combineObjects(
    {},
    baseConfig,
    loaderInstance.options.jscs,
    utilityBelt.parseQuery(loaderInstance.query)
  );

  const raiseErrors = finalConfig.emitErrors;
  delete finalConfig.emitErrors;
  const terminateOnFail = finalConfig.failOnHint;
  delete finalConfig.failOnHint;
  const customReport = finalConfig.reporter;
  delete finalConfig.reporter;

  const styleExaminer = new StyleValidator();
  styleExaminer.registerDefaultRules();
  styleExaminer.configure(finalConfig);

  const checkResults = styleExaminer.checkString(sourceContent);

  if (!checkResults.isEmpty()) {
    if (customReport) {
      customReport.call(loaderInstance, checkResults);
    } else {
      const issueLog = checkResults.getErrorList();
      const formattedLog = issueLog.reduce((report, currentIssue) => {
        return report + `\n  Rule: ${currentIssue.rule}` +
               `\n    Position: Line ${currentIssue.line}, Column ${currentIssue.column}` +
               `\n    Message: ${currentIssue.message}`;
      }, 'Detected style violations:');

      const messageEmitter = raiseErrors ? loaderInstance.emitError : loaderInstance.emitWarning;
      if (messageEmitter) {
        messageEmitter('Code style validation failed\n' + formattedLog);
      } else {
        throw new Error('Loader context lacks error/warning dispatchers. Webpack version outdated? \n' + formattedLog);
      }
    }

    if (terminateOnFail) {
      throw new Error('Build process terminated due to code style errors.');
    }
  }
};

module.exports = function (inputCode) {
  this.cacheable();

  const loaderCallback = this.async();
  const configProcessor = new ConfigurationProcessor(this);

  if (!loaderCallback) {
    const resolvedConfig = configProcessor.acquireSyncSettings();
    performStyleCheck(inputCode, resolvedConfig, this);
    return inputCode;
  }

  configProcessor.acquireAsyncSettings()
    .then(resolvedConfig => {
      try {
        performStyleCheck(inputCode, resolvedConfig, this);
        loaderCallback(null, inputCode);
      } catch (error) {
        loaderCallback(error);
      }
    })
    .catch(error => {
      loaderCallback(error);
    });
};