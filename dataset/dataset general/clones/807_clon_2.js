'use strict';

var streamProcessor = require('through2');
var taskUtilities = require('gulp-util');
var styleTransformer = require('pleeease');
var sourceMapInjector = require('vinyl-sourcemaps-apply');

module.exports = function (configOptions) {
  configOptions = configOptions || {};

  return streamProcessor.obj(function (inputAsset, encodingFormat, completionHandler) {
    if (inputAsset.isNull()) {
      completionHandler(null, inputAsset);
      return;
    }

    if (inputAsset.isStream()) {
      completionHandler(new taskUtilities.PluginError('gulp-pleeease', 'Streaming input not supported'));
      return;
    }

    try {
      if (inputAsset.sourceMap) {
        configOptions.sourcemaps = {
          from: inputAsset.relative || inputAsset.path,
          map: {
            annotation: false
          }
        };
      }

      var transformationOutput = styleTransformer.process(inputAsset.contents.toString(), configOptions);
      inputAsset.contents = new Buffer(transformationOutput.css || transformationOutput);
      if (inputAsset.sourceMap && transformationOutput.map) {
        sourceMapInjector(inputAsset, transformationOutput.map.toString());
      }

      completionHandler(null, inputAsset);

    } catch (operationFailure) {
      completionHandler(new taskUtilities.PluginError('gulp-pleeease', operationFailure, { fileName: inputAsset.path }));
      this.emit('error', new taskUtilities.PluginError('gulp-pleeease', operationFailure));
    }

  });
};