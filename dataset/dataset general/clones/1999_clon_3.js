'use strict';

// Import necessary Node.js modules and the Yeoman generator core.
const nodeUtilities = require('util');
const fileSystemPath = require('path');
const yGeneratorCore = require('yeoman-generator');

/**
 * @function establishInheritance
 * @description A helper function to set up prototype inheritance between a child and parent constructor.
 *              Mimics `util.inherits` but uses `Object.setPrototypeOf` for modern JS.
 * @param {Function} childConstructor - The constructor function that will inherit.
 * @param {Function} parentConstructor - The constructor function to inherit from.
 */
function establishInheritance(childConstructor, parentConstructor) {
  // Set the prototype of the child constructor's prototype to the parent's prototype.
  Object.setPrototypeOf(childConstructor.prototype, parentConstructor.prototype);
  // Ensure the constructor property on the child's prototype points back to the child constructor.
  childConstructor.prototype.constructor = childConstructor;
}

/**
 * @class ProjectScaffoldGen
 * @augments yGeneratorCore.generators.Base
 * @description A robust Yeoman generator designed for scaffolding new project structures.
 *              It handles initial setup, dependency management, and file generation.
 */
const ProjectScaffoldGen = module.exports = function ProjectScaffoldGen(invocationArguments, configurationOptions, environmentSettings) {
  // Call the parent (Base) constructor to initialize fundamental generator features.
  yGeneratorCore.generators.Base.apply(this, invocationArguments); // Changed `arguments` to `invocationArguments` for clarity.

  // Store the command-line options provided during generator invocation.
  this._generatorOptions = configurationOptions;

  // Perform early validation on critical generator options.
  this._validateGeneratorOptions();

  // Register an event handler to execute specific actions upon the generator's completion.
  this.registerEventHandler('end', () => {
    // Determine whether to skip dependency installation based on the 'omit-dependency-installation' option.
    const shouldOmitInstall = this._generatorOptions['omit-dependency-installation'] || false;
    this.setupProjectDependencies({ skipInstall: shouldOmitInstall });
    this.logToConsole('Project scaffolding and dependency setup process concluded successfully.');
  });

  // Attempt to load the generator's package manifest (package.json) for versioning and metadata.
  try {
    const manifestAbsolutePath = fileSystemPath.join(__dirname, '..', 'package.json'); // Updated path join
    const manifestFileContents = this.readTextFileContent(manifestAbsolutePath);
    this.projectManifest = JSON.parse(manifestFileContents);
    this.logToConsole(`Generator initialized. Version: ${this.projectManifest.version}`);
  } catch (manifestError) {
    this.logToConsole(`Warning: Failed to load generator manifest. Details: ${manifestError.message}`);
    // Provide a fallback manifest to prevent further errors.
    this.projectManifest = { name: 'unidentified-generator', version: '0.0.0-dev' };
  }

  // Initialize an object to store user-selected features and preferences.
  this.selectedFeatureSet = {};
};

// Establish the inheritance chain from Yeoman's Base Generator to ProjectScaffoldGen.
establishInheritance(ProjectScaffoldGen, yGeneratorCore.generators.Base);

// --- Custom Utility Methods for ProjectScaffoldGen ---

/**
 * @method logToConsole
 * @description A custom logging utility that prefixes messages with the generator's context.
 * @param {string} message - The message string to be logged.
 */
ProjectScaffoldGen.prototype.logToConsole = function(message) {
  console.log(`[BlueprintCreator] ${message}`);
};

/**
 * @method _validateGeneratorOptions
 * @private
 * @description Validates the data types and values of important generator options.
 *              Logs warnings for invalid types and applies default values if necessary.
 */
ProjectScaffoldGen.prototype._validateGeneratorOptions = function() {
  const skipInstallOption = this._generatorOptions['omit-dependency-installation'];
  if (typeof skipInstallOption !== 'boolean' && skipInstallOption !== undefined) {
    this.logToConsole('Warning: The "omit-dependency-installation" option expects a boolean value. Defaulting to false.');
    this._generatorOptions['omit-dependency-installation'] = false; // Enforce default
  }
};

/**
 * @method _greetUser
 * @private
 * @description Displays an initial welcoming message to the user, enhancing the interaction.
 */
ProjectScaffoldGen.prototype._greetUser = function() {
  this.logToConsole(`Hello! Welcome to the ${this.projectManifest.name} project generator (v${this.projectManifest.version}).`);
  this.logToConsole('Let\'s configure your new application blueprint.');
};

// --- Generator Lifecycle Methods (Steps) ---

/**
 * @method gatherUserPreferences
 * @description Prompts the user for various project configuration preferences, such as
 *              stylesheet preprocessors or JavaScript frameworks.
 */
ProjectScaffoldGen.prototype.gatherUserPreferences = function() {
  // Obtain an asynchronous callback handle to manage Yeoman's task flow.
  const asyncOperationComplete = this.getAsyncHandle();

  // Greet the user to start the interaction.
  this._greetUser();

  // Define the set of interactive questions for the user.
  const userInquiries = [
    {
      type: 'confirm',
      name: 'includeLessStyles',
      message: 'Would you like to integrate LESS for dynamic stylesheet generation?',
      default: true
    },
    {
      type: 'list',
      name: 'jsFrameworkChoice',
      message: 'Select your preferred JavaScript framework for the frontend:',
      choices: ['None', 'React', 'Vue.js', 'AngularJS (v1.x)'],
      default: 'None'
    }
  ];

  // If no inquiries are defined, bypass prompting and proceed directly.
  if (userInquiries.length === 0) {
    this.logToConsole('No specific user preferences to gather. Continuing with default settings.');
    asyncOperationComplete();
    return;
  }

  // Initiate the prompting process and capture the user's responses.
  this.requestUserInput(userInquiries, (inputProperties) => {
    // Store the gathered preferences on the generator instance for subsequent use in file generation.
    this.selectedFeatureSet = {
      usesLess: inputProperties.includeLessStyles,
      chosenFramework: inputProperties.jsFrameworkChoice
    };

    this.logToConsole(`User choices: LESS=${this.selectedFeatureSet.usesLess}, JS Framework=${this.selectedFeatureSet.chosenFramework}`);

    // Signal the completion of this asynchronous step.
    asyncOperationComplete();
  });
};

/**
 * @method generateCoreApplicationFiles
 * @description Establishes the fundamental directory structure and copies essential
 *              project configuration and build-related files.
 */
ProjectScaffoldGen.prototype.generateCoreApplicationFiles = function() {
  this.logToConsole('Initiating core project directory and configuration file generation...');

  // Define a list of directories that form the project's base structure.
  const baseDirectories = [
    'sourceDir',
    'sourceDir/imageAssets',
    'sourceDir/scriptFiles',
    'sourceDir/styleSheets',
    'sourceDir/htmlTemplates',
    'testSuite',
    'buildOutput',
    'temporaryFiles',
    'documentation' // Added a new directory for documentation
  ];

  // Create each specified directory.
  baseDirectories.forEach(dirPath => {
    this.createDirectory(dirPath);
  });
  this.logToConsole(`Created ${baseDirectories.length} foundational directories.`);

  // Define a mapping of source template files to their final destination paths.
  const rootConfigurationFiles = {
    '_packageDefinition.json': 'packageDefinition.json',
    '_bowerConfiguration.json': 'bower.json', // Renamed source
    'bowerRcFile': '.bowerrc',
    'gitIgnoreRules': '.gitignore',
    'travisCiConfig.yml': '.travis.yml',
    '_projectReadme.md': 'README.md',
    '_gruntConfiguration.js': 'Gruntfile.js',
    'license.txt': 'LICENSE.txt' // Added a new file
  };

  // Copy each configuration file from its template to the project root.
  for (const sourceTemplate in rootConfigurationFiles) {
    if (Object.prototype.hasOwnProperty.call(rootConfigurationFiles, sourceTemplate)) {
      this.replicateFile(sourceTemplate, rootConfigurationFiles[sourceTemplate]);
    }
  }
  this.logToConsole(`Copied ${Object.keys(rootConfigurationFiles).length} essential root configuration files.`);
};

/**
 * @method setupDevelopmentToolsConfiguration
 * @description Copies configuration files for common development tools like EditorConfig and JSHint.
 */
ProjectScaffoldGen.prototype.setupDevelopmentToolsConfiguration = function() {
  this.logToConsole('Setting up development tool configuration files...');
  this.replicateFile('editorConfigSchema', '.editorconfig');
  this.replicateFile('jsHintConfiguration', '.jshintrc');
  // Optionally, add more configuration files based on user preferences or common tools
  // this.replicateFile('eslintConfig', '.eslintrc.js'); // Example addition
  this.logToConsole('Development environment configuration files established.');
};

/**
 * @method prepareTestEnvironment
 * @description Configures the testing environment by copying test runner libraries and example specifications.
 */
ProjectScaffoldGen.prototype.prepareTestEnvironment = function() {
  this.logToConsole('Configuring the project\'s test environment...');

  // Ensure all necessary nested test directories exist before copying files.
  this.createDirectory('testSuite/libraryDependencies');
  this.createDirectory('testSuite/libraryDependencies/mochaTestRunner');
  this.createDirectory('testSuite/specifications');
  this.createDirectory('testSuite/mockData'); // Added a new directory for test mocks

  const testAssetsMapping = {
    'test/indexPage.html': 'testSuite/index.html', // Renamed destination
    'test/libraryDependencies/chaiAssertionLib.js': 'testSuite/libraryDependencies/chai.js',
    'test/libraryDependencies/expectAssertionLib.js': 'testSuite/libraryDependencies/expect.js',
    'test/libraryDependencies/mochaTestRunner/mochaStyles.css': 'testSuite/libraryDependencies/mocha/mocha.css', // Renamed source and destination
    'test/libraryDependencies/mochaTestRunner/mochaRunner.js': 'testSuite/libraryDependencies/mocha/mocha.js', // Renamed source and destination
    'test/specifications/exampleUnitTest.js': 'testSuite/specifications/test.js', // Renamed source and destination
    'test/specifications/mainSpecRunner.js': 'testSuite/specifications/main.js' // Renamed source and destination
  };

  // Copy each test-related asset to its designated location.
  for (const sourcePath in testAssetsMapping) {
    if (Object.prototype.hasOwnProperty.call(testAssetsMapping, sourcePath)) {
      this.replicateFile(sourcePath, testAssetsMapping[sourcePath]);
    }
  }
  this.logToConsole(`Copied ${Object.keys(testAssetsMapping).length} files for the test environment.`);
};

/**
 * @method scaffoldSourceApplication
 * @description Copies the main application source files to their respective directories,
 *              including HTML, CSS, JS, and image assets.
 */
ProjectScaffoldGen.prototype.scaffoldSourceApplication = function() {
  this.logToConsole('Scaffolding main application source files into "sourceDir"...');

  let applicationSourceFiles = [ // Changed from const to let because of potential additions
    { src: 'sourceDir/mainIndex.html', dest: 'sourceDir/index.html' },
    { src: 'sourceDir/apacheAccessConfig', dest: 'sourceDir/.htaccess' },
    { src: 'sourceDir/notFoundPage.html', dest: 'sourceDir/404.html' },
    { src: 'sourceDir/siteFavicon.ico', dest: 'sourceDir/favicon.ico' },
    { src: 'sourceDir/searchEngineRobots.txt', dest: 'sourceDir/robots.txt' },
    { src: 'sourceDir/styleSheets/primaryStyles.less', dest: 'sourceDir/css/main.less' },
    { src: 'sourceDir/scriptFiles/applicationLogic.js', dest: 'sourceDir/js/app.js' },
    { src: 'sourceDir/scriptFiles/entryPointScript.js', dest: 'sourceDir/js/main.js' },
    { src: 'sourceDir/imageAssets/companyLogo.png', dest: 'sourceDir/img/logo.png' },
    { src: 'sourceDir/htmlTemplates/helloTemplate.html', dest: 'sourceDir/templates/allo.html' }
  ];

  // Conditionally add framework-specific files based on user's choice.
  if (this.selectedFeatureSet.chosenFramework !== 'None') {
    const frameworkFileName = this.selectedFeatureSet.chosenFramework.toLowerCase().replace('.', ''); // Normalize name
    applicationSourceFiles.push({
      src: `sourceDir/scriptFiles/frameworks/${frameworkFileName}.js`, // Example: source/js/frameworks/react.js
      dest: `sourceDir/js/vendor/${frameworkFileName}.js` // Example: js/vendor/react.js
    });
    this.logToConsole(`Including template file for ${this.selectedFeatureSet.chosenFramework} framework.`);
  }

  // Iterate and copy all defined application source files.
  applicationSourceFiles.forEach(filePair => {
    this.replicateFile(filePair.src, filePair.dest);
  });
  this.logToConsole(`Copied ${applicationSourceFiles.length} main application source files.`);
};

// End of ProjectScaffoldGen definition.