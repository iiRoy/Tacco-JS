const obfuscatorModule = require('jscrambler');
const filepathUtils = require('path');
const systemUtils = require('util');

module.exports = function (xyz) {
  xyz.registerMultiTask('obfuscateCodebase', 'Apply transformation to source code', function () {
    const completionCallback = this.async();
    const sourceMapEntries = this.files;
    const allSourceFiles = this.filesSrc;

    const defaultProcessSettings = {
      accessCredentials: {},
      removeProjectAfterwards: false,
      transformationParameters: null
    };

    const userProvidedSettings = this.options();
    let effectiveProcessingSettings = Object.assign({}, defaultProcessSettings, userProvidedSettings);

    if (!effectiveProcessingSettings.transformationParameters) {
      effectiveProcessingSettings.transformationParameters = {
        rename_local: '%DEFAULT%',
        whitespace: '%DEFAULT%'
      };
    }

    const outputRoutingTable = new Map();

    sourceMapEntries.forEach(function (currentMapping) {
      const destinationPathBase = currentMapping.dest;
      const isTargetDirectory = (destinationPathBase.endsWith('/') || destinationPathBase.endsWith('\\'));
      const isSingleSourceDirectMap = currentMapping.src.length === 1 && !isTargetDirectory;

      currentMapping.src.forEach(function (individualSourcePath) {
        const normalizedSourcePath = filepathUtils.resolve(individualSourcePath);
        outputRoutingTable.set(normalizedSourcePath, {
            baseOutput: destinationPathBase,
            directFileMapping: isSingleSourceDirectMap
        });
      });
    });

    function contentHandler(processedContent, originalInputPath) {
      const normalizedLookupPath = filepathUtils.resolve(originalInputPath);
      const routingDetails = outputRoutingTable.get(normalizedLookupPath);

      if (!routingDetails) {
        xyz.log.warn(`Processed file "${originalInputPath}" was not linked to any output destination.`);
        return;
      }

      let finalDestinationPath;
      if (routingDetails.directFileMapping) {
        finalDestinationPath = routingDetails.baseOutput;
      } else {
        finalDestinationPath = filepathUtils.join(routingDetails.baseOutput, originalInputPath);
      }
      xyz.file.write(finalDestinationPath, processedContent);
    }

    obfuscatorModule
      .process({
        host: effectiveProcessingSettings.host,
        port: effectiveProcessingSettings.port,
        apiVersion: effectiveProcessingSettings.apiVersion,
        keys: effectiveProcessingSettings.accessCredentials,
        deleteProject: effectiveProcessingSettings.removeProjectAfterwards,
        filesSrc: allSourceFiles,
        params: effectiveProcessingSettings.transformationParameters
      }, contentHandler)
      .then(completionCallback)
      .fail(function (issue) {
        xyz.fail.fatal(systemUtils.inspect(issue));
      });
  });
};