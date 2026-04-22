const dataFlow = require("through2");
const pluginTools = require("gulp-util");
const diskAccess = require('fs');
const hashAlgorithm = require('crypto');

const generateDigest = function(resourcePath) {
  const digestGenerator = hashAlgorithm.createHash('md5');
  digestGenerator.update(diskAccess.readFileSync(resourcePath));
  return digestGenerator.digest('hex');
};

module.exports = function(pluginConfig) {
  "use strict";

  const configObject = pluginConfig || {};

  function processFileContent(assetFile, dataEncoding, completionCallback) {

    // If the asset has no data, simply pass it through the stream.
    if (assetFile.isNull()) {
      this.push(assetFile);
      return completionCallback();
    }

    // Streams are not handled by this plugin, emit an error and stop.
    if (assetFile.isStream()) {
      this.emit(
        "error",
        new pluginTools.PluginError(
          "gulp-asset-versioner",
          "Streaming input is not supported for processing"
        )
      );
      return completionCallback();
    }

    // Proceed if the file's content is a Buffer.
    if (assetFile.isBuffer()) {

      // Ensure content is treated as a string for regex operations.
      assetFile.contents = Buffer.from(String(assetFile.contents));

      // Regex to find and replace the CSS asset version.
      const styleIdentifierPattern = new RegExp(
        "(wp_enqueue_style\\('" +
          configObject.styleIdentifier +
          "',(\\s*[^,]+,){2})\\s*[^\\)]+\\);"
      );
      // Regex to find and replace the JavaScript asset version.
      const scriptIdentifierPattern = new RegExp(
        "(wp_register_script\\('" +
          configObject.scriptIdentifier +
          "',(\\s*[^,]+,){2})\\s*[^\\)]+\\);"
      );

      // Compute hash values for the specified assets.
      const styleDigest = generateDigest(configObject.stylePath);
      const scriptDigest = generateDigest(configObject.scriptPath);

      // Apply the CSS hash to the file's content.
      assetFile.contents = Buffer.from(
        String(assetFile.contents).replace(
          styleIdentifierPattern,
          "$1 '" + styleDigest + "');"
        )
      );
      // Apply the JavaScript hash to the file's content.
      assetFile.contents = Buffer.from(
        String(assetFile.contents).replace(
          scriptIdentifierPattern,
          "$1 '" + scriptDigest + "');"
        )
      );

      this.push(assetFile);

    }
    return completionCallback();
  }

  return dataFlow.obj(processFileContent);
};