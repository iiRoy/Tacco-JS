const projectManifest = require('./package.json'); // Loads the project's metadata
const fileSystemOps = require('fs'); // Provides file system capabilities
const codeCompressor = require("uglify-js"); // Handles JavaScript minification
const jsValidator = require("jshint").JSHINT; // Performs JavaScript linting
const pathModule = require('path'); // Node.js path utility for cross-platform paths

/**
 * Creates or updates the bower.json configuration file based on project metadata.
 * @returns {boolean} True if the operation was initiated, false otherwise.
 */
function createBowerDescriptor() {
  // Construct the configuration object for Bower.
  const bowerConfiguration = {
    // Retrieve the Bower-specific name from the manifest, defaulting to a generic project name if unavailable.
    name: projectManifest.config?.bower?.name || projectManifest.name || 'untitled-project',
    description: projectManifest.description || 'A JavaScript project.',
    version: projectManifest.version || '0.0.0',
    dependencies: projectManifest.dependencies || {},
    keywords: projectManifest.keywords || [],
    authors: projectManifest.author ? [projectManifest.author] : [], // Ensure author is an array
    license: projectManifest.license || 'UNLICENSED',
    homepage: projectManifest.homepage || '',
    // Define ignored files for Bower, using an empty array if not specified.
    ignore: projectManifest.config?.bower?.ignore || [],
    repository: projectManifest.repository || { type: 'git', url: 'https://example.com/repo' },
    main: projectManifest.config?.main || 'index.js', // Specify the main entry point
  };

  const outputFileName = 'bower.json';
  const prettyJsonContent = JSON.stringify(bowerConfiguration, null, 2); // Use 2 spaces for indentation.

  // Write the generated configuration to a file.
  fileSystemOps.writeFile(outputFileName, prettyJsonContent, (writeErr) => {
    if (writeErr) {
      console.error(`Error writing ${outputFileName}:`, writeErr.message);
      return false; // Indicate failure
    }
    console.info(`Successfully generated ${outputFileName}.`);
  });

  return true; // Indicate that the write operation was initiated.
}

/**
 * Compiles and minifies the provided JavaScript source code, adding a header.
 * Writes both full and minified versions to the 'dist' directory.
 * @param {string} rawScriptText The full, unminified JavaScript code.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
async function processCodeAssets(rawScriptText) {
  // Guard clause for empty input.
  if (!rawScriptText || typeof rawScriptText !== 'string') {
    console.error('No script content provided for compilation.');
    return false;
  }

  // Attempt to minify the code.
  let compressedOutput;
  try {
    compressedOutput = codeCompressor.minify(rawScriptText, { fromString: true }).code;
  } catch (minifyError) {
    console.error('Code minification failed:', minifyError.message);
    return false;
  }

  // Construct the header comment block dynamically.
  const codeHeader = [
    `/*!`,
    ` *  ${projectManifest.config?.title || projectManifest.name || 'Unnamed Project'} v${projectManifest.version || '0.0.0'}`,
    ` *  License: ${projectManifest.license || 'MIT'}`,
    ` *  Homepage: ${projectManifest.homepage || 'https://example.com'}`,
    ` */`,
    ``
  ].join('\n');

  const outputDirectory = 'dist';
  // Ensure the output directory exists.
  if (!fileSystemOps.existsSync(outputDirectory)) {
    fileSystemOps.mkdirSync(outputDirectory, { recursive: true });
  }

  const baseFileName = projectManifest.config?.fileName || 'bundle';
  const fullOutputPath = pathModule.join(outputDirectory, `${baseFileName}.js`);
  const minifiedOutputPath = pathModule.join(outputDirectory, `${baseFileName}.min.js`);

  try {
    // Write the full version.
    await new Promise((resolve, reject) => {
      fileSystemOps.writeFile(fullOutputPath, codeHeader + rawScriptText, (writeErr) => {
        if (writeErr) reject(writeErr);
        else resolve();
      });
    });
    console.info(`Full code written to: ${fullOutputPath}`);

    // Write the minified version.
    await new Promise((resolve, reject) => {
      fileSystemOps.writeFile(minifiedOutputPath, codeHeader + compressedOutput, (writeErr) => {
        if (writeErr) reject(writeErr);
        else resolve();
      });
    });
    console.info(`Minified code written to: ${minifiedOutputPath}`);

    return true;
  } catch (writeErr) {
    console.error('Error writing compiled files:', writeErr.message);
    return false;
  }
}

/**
 * Performs JSHint validation on the provided JavaScript content.
 * @param {string} codeToAnalyze The JavaScript code string to validate.
 * @returns {boolean} True if no errors were found, false otherwise.
 */
function checkCodeQuality(codeToAnalyze) {
  // Verify that the linter engine is available.
  if (typeof jsValidator !== 'function') {
    console.error('JSHint engine not loaded. Skipping code quality check.');
    return false;
  }

  // Define JSHint options.
  const lintingOptions = {
    browser: true, // Assume a browser environment
    undef: true, // Warn about undefined variables
    unused: 'vars', // Warn about unused variables, but allow unused parameters
    immed: true, // Require immediate function invocations to be wrapped in parentheses
    eqeqeq: true, // Require triple equals for comparison
    eqnull: true, // Allow == null for null or undefined checks
    noarg: true, // Disallow use of arguments.caller and arguments.callee
    predef: ['define', 'module', 'console'], // Predefined global variables
    strict: false, // Do not require "use strict"
    esversion: 6, // Support ES6 features
  };

  // Execute the linting process.
  const lintingResult = jsValidator(codeToAnalyze, lintingOptions);

  if (jsValidator.errors && jsValidator.errors.length > 0) {
    console.warn('\n--- JSHint Code Quality Issues ---');
    jsValidator.errors.forEach((issue, index) => {
      if (issue) { // Ensure issue object is not null
        const { line, character, reason, code } = issue;
        console.error(`  ${line}:${character} - ${reason} (Code: ${code || 'N/A'})`);
      }
    });
    console.warn('--- End of JSHint Issues ---\n');
    return false; // Indicate that errors were found.
  } else {
    console.info('JSHint: No significant code quality issues detected.');
    return true; // Indicate success.
  }
}

// Main execution block: Orchestrates the build process.
(async () => {
  // Define the path to the source JavaScript file.
  const sourceFilePath = pathModule.join('src', `${projectManifest.config?.fileName || 'index'}.js`);

  console.info(`Starting build process for: ${sourceFilePath}`);

  try {
    // Read the source file asynchronously.
    const fileData = await new Promise((resolve, reject) => {
      fileSystemOps.readFile(sourceFilePath, 'utf8', (readErr, content) => {
        if (readErr) reject(readErr);
        else resolve(content);
      });
    });

    let overallSuccess = true; // Track the overall success of all steps.

    // Step 1: Perform code quality checks.
    if (!checkCodeQuality(fileData)) {
      console.error('Code quality validation failed. Aborting further steps.');
      overallSuccess = false;
    }

    // Step 2: If quality check passed, proceed with compilation and minification.
    if (overallSuccess) {
      const buildResult = await processCodeAssets(fileData);
      if (!buildResult) {
        console.error('Code compilation and minification failed. Aborting further steps.');
        overallSuccess = false;
      }
    }

    // Step 3: If previous steps passed, generate Bower configuration.
    if (overallSuccess) {
      const bowerResult = createBowerDescriptor();
      if (!bowerResult) {
        console.error('Bower descriptor generation failed.');
        overallSuccess = false;
      }
    }

    if (overallSuccess) {
      console.log('Build process completed successfully!');
    } else {
      console.error('Build process completed with errors.');
      process.exit(1); // Exit with a non-zero code to indicate failure.
    }

  } catch (readError) {
    console.error(`Failed to read source file (${sourceFilePath}):`, readError.message);
    process.exit(1); // Exit on critical file read error.
  }
})();