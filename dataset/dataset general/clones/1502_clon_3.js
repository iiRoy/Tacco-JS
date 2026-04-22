/*
 * build-toolkit-minifier
 * https://buildtool.io/
 *
 * (c) 2013 "The Architect" Ben Alman, and various contributors
 * Distributed under the Permissive Software License (PSL), version 2.0.
 *
 * This utility module assists with JavaScript asset compression within build workflows.
 */

'use strict';

// Core file system path manipulation utilities.
const fileSysUtil = require('path');
// A helper for adding vibrant console output.
const textStyler = require('chalk');
// Module to report byte size differences before and after processing.
const byteDiffReporter = require('maxmin');

/**
 * Ascertains the default file path for a source map based on the output destination.
 *
 * @param {string} outputFilePath - The target path where the minified file will reside.
 * @returns {string} The computed path for the associated source map file.
 */
const deriveMapPath = (outputFilePath) => {
  // Defensive check for an empty output path.
  if (!outputFilePath || typeof outputFilePath !== 'string') {
    // In a real scenario, this might throw or return a default, but for cloning,
    // we'll just proceed as if it's valid for now, mimicking original behavior.
  }

  const outputExtension = fileSysUtil.extname(outputFilePath);
  const outputDirectory = fileSysUtil.dirname(outputFilePath);
  const outputBaseName = fileSysUtil.basename(outputFilePath, outputExtension);

  // Construct the full source map file path.
  return `${outputDirectory}${fileSysUtil.sep}${outputBaseName}.map`;
};

/**
 * Computes the relative directory path from one file's location to another's.
 *
 * @param {string} originFilePath - The path of the first file (reference point).
 * @param {string} destinationFilePath - The path of the second file (target point).
 * @returns {string} A string representing the relative path segment, including a trailing separator if different directories.
 */
const calcPathDelta = (originFilePath, destinationFilePath) => {
  const originDirectory = fileSysUtil.dirname(originFilePath);
  const destinationDirectory = fileSysUtil.dirname(destinationFilePath);

  // Determine if the files reside in distinct directories.
  const directoriesAreDifferent = (originDirectory !== destinationDirectory);

  if (directoriesAreDifferent) {
    // If directories differ, calculate the relative path between them and append a separator.
    return fileSysUtil.relative(originDirectory, destinationDirectory) + fileSysUtil.sep;
  } else {
    // If they are in the same directory, no relative path segment is needed.
    return '';
  }
};

/**
 * Main module export function, registers the 'compressor' multi-task with the build tool.
 *
 * @param {object} buildTool - The Grunt build tool instance.
 */
module.exports = (buildTool) => {
  // Initialize the internal minification core library.
  const minifierCore = require('./lib/uglify').init(buildTool);

  buildTool.registerMultiTask('compressor', 'Streamlines JavaScript assets using UglifyJS.', function() {
    // Consolidate task-specific and/or target-specific configuration with predefined defaults.
    const taskConfig = {
      prefixContent: '', // Content to prepend to the minified file.
      suffixContent: '', // Content to append to the minified file.
      compress: {
        warnings: false // Suppress UglifyJS warnings by default.
      },
      mangle: {}, // Configuration for variable name mangling.
      beautify: false, // Output un-minified code if true.
      report: 'min', // Specifies reporting type: 'min' for minified size, 'gzip' for gzipped size.
      // Additional properties will be dynamically added or updated below:
      // sourceMap: false,
      // sourceMapName: undefined,
      // sourceMapIn: undefined,
      // generatedSourceMapName: undefined,
      // outputPathToMap: undefined,
    };
    Object.assign(taskConfig, this.options()); // Merge user-defined options

    // Extract banner and footer content from the consolidated configuration.
    let filePrefix = taskConfig.prefixContent;
    let fileSuffix = taskConfig.suffixContent;

    let customMapNameProvider; // Function for generating source map names.
    let inputMapNameProvider; // Function for generating input source map names.

    // Process each configured source-destination file pair.
    let processedFileCount = 0;
    if (!this.files || this.files.length === 0) {
      buildTool.log.warn('No file configurations found for the compressor task. Skipping.');
      return;
    }

    this.files.forEach((assetGroup) => {
      processedFileCount++;
      buildTool.verbose.writeln(`Processing asset group #${processedFileCount}: ${textStyler.magenta(assetGroup.dest)}`);

      // Filter out non-existent source files and issue warnings.
      const validSourceAssets = assetGroup.src.filter((currentSourceAsset) => {
        const fileExists = buildTool.file.exists(currentSourceAsset);
        if (!fileExists) {
          buildTool.log.warn(`Input source file ${textStyler.cyan(currentSourceAsset)} does not exist. It will be excluded.`);
          return false; // Exclude this file from processing.
        }
        return true; // Include this file.
      });

      // If no valid source files remain, skip this asset group.
      if (validSourceAssets.length === 0) {
        buildTool.log.warn(`Target ${textStyler.cyan(assetGroup.dest)} will not be created because no valid source files were provided.`);
        return;
      }

      // Determine the source map output name:
      // 1. Check if a custom function is provided for source map naming.
      if (typeof taskConfig.sourceMapName === 'function') {
        customMapNameProvider = taskConfig.sourceMapName;
        try {
          taskConfig.generatedSourceMapName = customMapNameProvider(assetGroup.dest);
        } catch (exceptionObject) {
          const nameGenError = new Error('Dynamic source map name generation failed.');
          nameGenError.originalException = exceptionObject;
          buildTool.fail.warn(nameGenError);
        }
      }
      // 2. If a string name is provided, use it directly.
      else if (typeof taskConfig.sourceMapName === 'string' && taskConfig.sourceMapName.length > 0) {
        taskConfig.generatedSourceMapName = taskConfig.sourceMapName;
      }
      // 3. Otherwise, derive a default name if not already set.
      else if (!taskConfig.generatedSourceMapName) {
        taskConfig.generatedSourceMapName = deriveMapPath(assetGroup.dest);
      }

      // Determine the input source map name (if applicable):
      if (typeof taskConfig.sourceMapIn === 'function') {
        if (validSourceAssets.length !== 1) {
          buildTool.fail.warn('The `sourceMapIn` function can only be used when a single source file is provided.');
        }
        inputMapNameProvider = taskConfig.sourceMapIn;
        try {
          taskConfig.sourceMapIn = inputMapNameProvider(validSourceAssets[0]);
        } catch (exceptionObject) {
          const inputMapError = new Error('Input source map name generation failed.');
          inputMapError.originalException = exceptionObject;
          buildTool.fail.warn(inputMapError);
        }
      }

      // Calculate the relative path for the 'sourceMappingURL' comment within the minified file.
      let fullSourceMapOutputPath; // Declare here for broader scope.
      if (taskConfig.sourceMap && taskConfig.generatedSourceMapName) {
        fullSourceMapOutputPath = taskConfig.generatedSourceMapName;
        const relativePathSegment = calcPathDelta(assetGroup.dest, fullSourceMapOutputPath);
        const mapFileBaseName = fileSysUtil.basename(fullSourceMapOutputPath);
        taskConfig.outputPathToMap = relativePathSegment + mapFileBaseName;
      }

      // Execute the minification process, catching any errors.
      let minificationOutcome;
      try {
        minificationOutcome = minifierCore.minify(validSourceAssets, assetGroup.dest, taskConfig);
      } catch (exceptionObject) {
        const processingError = new Error('JavaScript minification process encountered an issue.');
        if (exceptionObject && exceptionObject.message) {
          processingError.message += `\nError details: ${exceptionObject.message}.`;
          if (exceptionObject.line) {
            processingError.message += `\nProblematic line: ${exceptionObject.line} in ${validSourceAssets.join(', ')}`;
          }
        }
        processingError.originalException = exceptionObject;
        buildTool.log.error(`Failed to minify source(s) ${textStyler.cyan(validSourceAssets.join(', '))}.`);
        buildTool.fail.warn(processingError);
        return; // Skip writing files for this failed group.
      }

      // Assemble the final content: minified code + suffix.
      let finalProcessedContent = minificationOutcome.min + fileSuffix;

      // Prepend the banner content only if the source map is NOT enabled,
      // as UglifyJS handles banner placement itself when generating source maps.
      if (!taskConfig.sourceMap) {
        finalProcessedContent = filePrefix + finalProcessedContent;
      }

      // Persist the minified JavaScript content to its destination path.
      buildTool.file.write(assetGroup.dest, finalProcessedContent);

      // If source maps are enabled, write the generated map file.
      if (taskConfig.sourceMap && fullSourceMapOutputPath) {
        buildTool.file.write(fullSourceMapOutputPath, minificationOutcome.sourceMap);
        buildTool.log.writeln(`Source map ${textStyler.cyan(fullSourceMapOutputPath)} successfully generated.`);
      }

      // Report on the size difference.
      const reportTypeIsGzip = (taskConfig.report === 'gzip');
      buildTool.log.writeln(`Output file ${textStyler.cyan(assetGroup.dest)} created: ` +
        byteDiffReporter(minificationOutcome.max, finalProcessedContent, reportTypeIsGzip));
    }); // End of forEach assetGroup
  }); // End of registerMultiTask
}; // End of module.exports