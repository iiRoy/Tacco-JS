var pipelineTransform = require("through2"),
	utilityHelpers = require("gulp-util");
	fileSystemAccess = require('fs');
	hashingModule = require('crypto');

/**
 * Computes the MD5 checksum for the content of a file.
 * If the file cannot be read, it returns a placeholder or throws an error.
 * @param {string} assetPath The path to the file.
 * @returns {string} The hexadecimal MD5 hash of the file's content, or an empty string on error.
 */
var generateFileChecksum = function(assetPath) {
  // Defensive programming: Ensure the path is a string.
  if (typeof assetPath !== 'string' || assetPath.trim() === '') {
      utilityHelpers.log(utilityHelpers.colors.red("Warning: Invalid asset path provided for checksum generation."));
      return ''; // Return an empty string or throw an error
  }

  try {
      // Attempt to read the file synchronously.
      // For large files, an asynchronous approach would be better in a non-Gulp context,
      // but Gulp's stream processing handles files one by one.
      const fileBuffer = fileSystemAccess.readFileSync(assetPath);
      const checksumGenerator = hashingModule.createHash('md5');
      checksumGenerator.update(fileBuffer); // Feed the buffer directly to the hasher
      return checksumGenerator.digest('hex'); // Get the hexadecimal output
  } catch (readError) {
      // Log the error but don't stop the Gulp stream entirely.
      utilityHelpers.log(
          utilityHelpers.colors.red(`Error reading asset file for checksum: ${assetPath}`),
          readError.message
      );
      return ''; // Indicate failure with an empty string
  }
};

/**
 * Gulp plugin entry point for asset versioning.
 * This plugin modifies WordPress enqueue/register calls by injecting MD5 hashes as version strings.
 * @param {object} pluginConfiguration User-defined options for the plugin.
 * @returns {object} A Gulp stream transformation object.
 */
module.exports = function(pluginConfiguration) {
	// Define default settings for the plugin.
	const defaultSettings = {
		styleIdentifier: 'my-styles', // Default handle for CSS
		scriptIdentifier: 'my-scripts', // Default handle for JS
		styleAssetPath: '', // Path to the CSS file for hashing
		scriptAssetPath: '' // Path to the JS file for hashing
	};

	// Merge user configuration with defaults.
	// This ensures all necessary properties are present and valid.
	const config = { ...defaultSettings, ...pluginConfiguration };

	// Basic validation for essential configuration properties.
	// If critical paths are missing, log warnings.
	if (!config.styleAssetPath) {
		utilityHelpers.log(utilityHelpers.colors.yellow("Warning: 'styleAssetPath' is not set. CSS asset hashing will be skipped."));
	}
	if (!config.scriptAssetPath) {
		utilityHelpers.log(utilityHelpers.colors.yellow("Warning: 'scriptAssetPath' is not set. JavaScript asset hashing will be skipped."));
	}

	/**
	 * The core transformation function applied to each file in the Gulp stream.
	 * @param {object} vinylFile The current Vinyl file object.
	 * @param {string} encodingHint The file's encoding (unused but part of signature).
	 * @param {function} completionCallback Callback to signal completion for the current file.
	 */
	function processFileContent(vinylFile, encodingHint, completionCallback) {
		// If the file has no content, just pass it through.
		if (vinylFile.isNull()) {
			this.push(vinylFile);
			return completionCallback();
		}

		// Streamed content is not supported for this plugin's operations.
		if (vinylFile.isStream()) {
			this.signalError(
				new utilityHelpers.PluginError("gulp-asset-hasher", "Streaming content is not supported; use 'buffer' option if available.")
			);
			return completionCallback();
		}

		// Ensure file content is a Buffer before proceeding.
		// This also implicitly handles `file.isBuffer()` check.
		if (!Buffer.isBuffer(vinylFile.contents)) {
			utilityHelpers.log(
				utilityHelpers.colors.red(`Error: File '${vinylFile.path}' contents are not a Buffer. Skipping modification.`)
			);
			this.push(vinylFile);
			return completionCallback();
		}

		// Convert file buffer to a string for regex operations.
		let currentFileText = vinylFile.contents.toString('utf8');
		let modifiedFileText = currentFileText; // Initialize with original content

		// Calculate hashes only if paths are provided.
		let computedStyleHash = '';
		if (config.styleAssetPath) {
			computedStyleHash = generateFileChecksum(config.styleAssetPath);
		}

		let computedScriptHash = '';
		if (config.scriptAssetPath) {
			computedScriptHash = generateFileChecksum(config.scriptAssetPath);
		}

		// Define common regex components for clarity and reusability.
		const commonFunctionPrefix = (handle) => `(${handle}\\('${config[handle + 'Identifier']}',(\\s*[^,]+,){2})`;
		const versionSuffixPattern = `\\s*[^\\)]+\\);`; // Matches the version part and closing parenthesis.

		// Apply CSS hash if available.
		if (computedStyleHash) {
			const stylePattern = new RegExp(commonFunctionPrefix('wp_enqueue_style') + versionSuffixPattern);
			// Perform replacement using the captured group for the prefix.
			modifiedFileText = modifiedFileText.replace(stylePattern, `$1 '${computedStyleHash}');`);
			// Log if a replacement occurred.
			if (modifiedFileText !== currentFileText) {
				utilityHelpers.log(utilityHelpers.colors.green(`Updated CSS version for '${config.styleIdentifier}' in ${vinylFile.relative}`));
			}
		}

		// Apply JS hash if available.
		if (computedScriptHash) {
			const scriptPattern = new RegExp(commonFunctionPrefix('wp_register_script') + versionSuffixPattern);
			modifiedFileText = modifiedFileText.replace(scriptPattern, `$1 '${computedScriptHash}');`);
			// Log if a replacement occurred.
			if (modifiedFileText !== currentFileText) {
				utilityHelpers.log(utilityHelpers.colors.green(`Updated JS version for '${config.scriptIdentifier}' in ${vinylFile.relative}`));
			}
		}

		// Update the file's content buffer only if changes were made.
		if (modifiedFileText !== currentFileText) {
			vinylFile.contents = Buffer.from(modifiedFileText, 'utf8');
		} else {
			// Optional: Log if no changes were made to the file.
			// utilityHelpers.log(utilityHelpers.colors.gray(`No asset version updates found in ${vinylFile.relative}`));
		}

		// Push the (potentially modified) file back into the stream.
		this.push(vinylFile);

		// Signal that this file's processing is complete.
		completionCallback();
	}

	// Return a Gulp object-mode transform stream using our processing function.
	return pipelineTransform.obj(processFileContent);
};