const fileSystemHandler = require('fs');

let projectManifestData;
try {
  projectManifestData = JSON.parse(fileSystemHandler.readFileSync(__dirname + '/../package.json', 'utf8'));
} catch (loadError) {
  console.error("Asset Assembler: Failed to load project manifest (package.json):", loadError.message);
  projectManifestData = { version: 'unknown-dev', author: 'Anonymous Developer', license: 'ISC' };
}

let codeMinificationEngine;
try {
  codeMinificationEngine = require('uglify-js');
} catch (minifierError) {
  console.warn("Asset Assembler: Uglify-JS module not found. Minification will be skipped if requested.", minifierError.message);
  codeMinificationEngine = null;
}

/**
 * Defines the templates for license banners prepended to generated output files.
 * These banners include versioning and copyright information.
 * @private
 */
const compilationBannerPattern = `/*! {targetBundleName}.{fileExtension} bundle:{appVersion} ({buildStage}). Copyright(c) ${new Date().getFullYear()} {authorInfo} */`;

const moduleScopeWrapperStart = '\n(function(globalWindowContext){\n';

const developmentBuildHeader = compilationBannerPattern
  .replace('{targetBundleName}', 'datachannel')
  .replace('{buildStage}', 'development')
  .replace('{fileExtension}', 'js')
  .replace('{appVersion}', projectManifestData.version)
  .replace('{authorInfo}', projectManifestData.author || 'Unknown Author');

const productionBuildHeader = compilationBannerPattern
  .replace('{targetBundleName}', 'datachannel')
  .replace('{buildStage}', 'production')
  .replace('{fileExtension}', 'min.js')
  .replace('{appVersion}', projectManifestData.version)
  .replace('{authorInfo}', projectManifestData.author || 'Unknown Author');

const moduleScopeWrapperEnd = '\n})(this);\n';

/**
 * Markers for conditional compilation blocks.
 * Code enclosed within these markers is conditionally included/excluded
 * based on the build configuration (e.g., for Node.js specific code).
 * @private
 */
const nodeSpecificBlockStartTag = '// #region NODE_TARGET_ONLY';
const nodeSpecificBlockEndTag = '// #endregion NODE_TARGET_ONLY';

/**
 * Specifies the core source files that constitute the base build.
 * These files are concatenated in the order they appear in this array.
 * @private
 * @type {string[]}
 */
const primarySourceModules = [
  'EventTarget.js',
  'reliable.min.js',
  'datachannel.js'
];

const outputTargetDirectory = '/../dist/';
const primarySourceDirectory = '/../src/';
const outputBundleBaseIdentifier = 'datachannel';

/**
 * The main asset bundling utility.
 * This function orchestrates the concatenation, conditional compilation,
 * and minification of JavaScript source files into a single bundle.
 *
 * @param {Array<string>} [supplementaryModules=[]] An array of file paths to include
 *                                                  or raw code snippets.
 * @param {object} [compilationSettings={}] Configuration options for the bundling process.
 * @param {boolean} [compilationSettings.enableMinification=true] Whether to minify the output code.
 * @param {boolean} [compilationSettings.isTargetNode=false] If true, Node.js specific code blocks are retained.
 * @param {Array<string>} [compilationSettings.additionalCodeFragments=[]] Raw code strings to append after main concatenation.
 * @param {function(Error|null, string)} completionHandler Callback invoked upon completion or error.
 *                                                       Receives an error object (or null) and the resulting bundle string.
 * @public
 */
const assetAssembler = module.exports = function (supplementaryModules = [], compilationSettings = {}, completionHandler) {
  let finalConfig = {
    enableMinification: true,
    isTargetNode: false,
    additionalCodeFragments: [],
  };

  // Robust argument parsing to handle various call signatures
  const invocationArgs = Array.from(arguments);
  let actualCompletionHandler;

  // Extract the last argument if it's a function (the callback)
  if (typeof invocationArgs[invocationArgs.length - 1] === 'function') {
    actualCompletionHandler = invocationArgs.pop();
  } else {
    throw new Error('AssetAssembler: A completion handler callback function is required.');
  }

  // Determine actual supplementary modules and config from remaining arguments
  let userProvidedSupplementaryModules = [];
  let userProvidedConfig = {};

  if (Array.isArray(invocationArgs[0])) {
    userProvidedSupplementaryModules = invocationArgs[0];
    if (invocationArgs[1] && typeof invocationArgs[1] === 'object') {
      userProvidedConfig = invocationArgs[1];
    }
  } else if (typeof invocationArgs[0] === 'object' && invocationArgs[0] !== null) {
    userProvidedConfig = invocationArgs[0];
  }

  // Merge user settings with defaults
  Object.assign(finalConfig, userProvidedConfig);

  // Ensure additionalCodeFragments is always an array
  if (!Array.isArray(finalConfig.additionalCodeFragments)) {
    finalConfig.additionalCodeFragments = [];
  }

  // Compile a list of all source file paths
  const allSourceFilePaths = primarySourceModules.map(moduleName => {
    const fullPath = __dirname + primarySourceDirectory + moduleName;
    if (!fileSystemHandler.existsSync(fullPath)) {
      console.warn(`Asset Assembler: Core module not found: ${moduleName}. Skipping.`);
      return null;
    }
    return fullPath;
  }).filter(Boolean); // Filter out any null entries from missing files

  // Incorporate user-provided supplementary modules (expecting file paths)
  userProvidedSupplementaryModules.forEach(moduleEntry => {
    if (typeof moduleEntry === 'string') {
      if (fileSystemHandler.existsSync(moduleEntry)) {
        allSourceFilePaths.push(moduleEntry);
      } else {
        console.warn(`Asset Assembler: Supplementary module file not found: ${moduleEntry}. Skipping.`);
      }
    } else {
      console.warn(`Asset Assembler: Invalid supplementary module entry (not a string path): ${moduleEntry}. Skipping.`);
    }
  });

  // Read all source files asynchronously
  const fileContentReadPromises = allSourceFilePaths.map(filePath =>
    new Promise((resolve, reject) => {
      fileSystemHandler.readFile(filePath, 'utf8', (readErr, contentBuffer) => {
        if (readErr) {
          return reject(new Error(`Asset Assembler: Failed to read source file "${filePath}": ${readErr.message}`));
        }
        resolve({ path: filePath, content: contentBuffer });
      });
    })
  );

  Promise.all(fileContentReadPromises)
    .then(fileEntryData => {
      let assembledOutput = developmentBuildHeader + moduleScopeWrapperStart;

      // Concatenate all file contents in specified order
      fileEntryData.forEach(entry => {
        assembledOutput += entry.content + '\n';
      });

      // Append any custom code fragments
      if (finalConfig.additionalCodeFragments.length > 0) {
        finalConfig.additionalCodeFragments.forEach(fragment => {
          assembledOutput += fragment + '\n';
        });
      }

      // Process conditional Node.js specific code blocks
      if (!finalConfig.isTargetNode) {
        let nodeBlockDepth = 0; // Tracks nesting level of Node-only blocks
        const processedLines = assembledOutput.split('\n').filter(currentLine => {
          const isBlockInitiator = currentLine.includes(nodeSpecificBlockStartTag);
          const isBlockTerminator = currentLine.includes(nodeSpecificBlockEndTag);

          if (isBlockInitiator) {
            nodeBlockDepth++;
            return false; // Exclude the start tag line itself
          }
          if (isBlockTerminator) {
            nodeBlockDepth--;
            return false; // Exclude the end tag line itself
          }
          // Only include lines when not inside a Node-only block
          return nodeBlockDepth === 0;
        });
        assembledOutput = processedLines.join('\n');
      }

      assembledOutput += moduleScopeWrapperEnd;

      // Apply minification if configured and engine is available
      if (finalConfig.enableMinification) {
        if (!codeMinificationEngine) {
          console.warn("Asset Assembler: Minification requested but Uglify-JS engine not loaded. Proceeding with unminified output.");
        } else {
          try {
            const minificationResult = codeMinificationEngine.minify(assembledOutput, {
              fromString: true,
              compress: {},
              mangle: {},
              output: {
                ascii_only: true,
                comments: /^\!/ // Preserve license banner comments
              }
            });

            if (minificationResult.error) {
              throw minificationResult.error;
            }

            // Prepend production header to minified code
            assembledOutput = productionBuildHeader + minificationResult.code;

          } catch (minifyFailure) {
            console.error("Asset Assembler: Error during code minification:", minifyFailure.message);
            // On minification failure, we can choose to fail the build or return unminified.
            // For Type III, let's explicitly return an error.
            return actualCompletionHandler(new Error(`Minification process failed: ${minifyFailure.message}`), assembledOutput);
          }
        }
      }

      actualCompletionHandler(null, assembledOutput);
    })
    .catch(aggregateError => {
      actualCompletionHandler(aggregateError, null);
    });
};

/**
 * Exposes the project's version via the bundler utility.
 * @type {string}
 * @public
 */
assetAssembler.releaseVersion = projectManifestData.version;

/**
 * Provides command-line interface (CLI) support for the asset assembler.
 * This block executes when the script is run directly, allowing for
 * development and production builds via CLI arguments.
 */
if (!module.parent) {
  const cliInvocationArguments = process.argv.slice(2);
  const isNodeBuildTarget = cliInvocationArguments.includes('--node-target'); // New CLI flag

  const ensureOutputDirectoryExists = (targetPath) => {
    const absolutePath = __dirname + targetPath;
    if (!fileSystemHandler.existsSync(absolutePath)) {
      try {
        fileSystemHandler.mkdirSync(absolutePath, { recursive: true });
        console.log(`Asset Assembler CLI: Created output directory: ${absolutePath}`);
      } catch (directoryCreationError) {
        console.error(`Asset Assembler CLI: Failed to create directory ${absolutePath}:`, directoryCreationError.message);
        process.exit(1);
      }
    }
  };

  ensureOutputDirectoryExists(outputTargetDirectory);

  // Initiate the development build
  assetAssembler([], { isTargetNode: isNodeBuildTarget, enableMinification: false }, (devErr, devBundleContent) => {
    if (devErr) {
      console.error('Asset Assembler CLI: Development build failed:', devErr.message);
      return;
    }
    const devOutputFilePath = __dirname + outputTargetDirectory + outputBundleBaseIdentifier + '.js';
    try {
      fileSystemHandler.writeFileSync(devOutputFilePath, devBundleContent, 'utf8');
      console.log(`Asset Assembler CLI: Successfully generated development bundle: ${devOutputFilePath}`);
    } catch (writeDevError) {
      console.error(`Asset Assembler CLI: Failed to write development bundle to ${devOutputFilePath}:`, writeDevError.message);
    }
  });

  // Initiate the production (minified) build
  assetAssembler([], { isTargetNode: isNodeBuildTarget, enableMinification: true }, (prodErr, prodBundleContent) => {
    if (prodErr) {
      console.error('Asset Assembler CLI: Production build failed:', prodErr.message);
      return;
    }
    const prodOutputFilePath = __dirname + outputTargetDirectory + outputBundleBaseIdentifier + '.min.js';
    try {
      fileSystemHandler.writeFileSync(prodOutputFilePath, prodBundleContent, 'utf8');
      console.log(`Asset Assembler CLI: Successfully generated production bundle: ${prodOutputFilePath}`);
    } catch (writeProdError) {
      console.error(`Asset Assembler CLI: Failed to write production bundle to ${prodOutputFilePath}:`, writeProdError.message);
    }
  });
}