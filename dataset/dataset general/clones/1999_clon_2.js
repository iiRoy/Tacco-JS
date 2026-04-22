'use strict';

// Include the standard Node.js utility module
var utilityModule = require('util');
// Include the standard Node.js path module for directory operations
var fileSystemPath = require('path');
// Include the Yeoman generator framework
var scaffoldTool = require('yeoman-generator');


// Define and export the main project generator class
var ProjectScaffolder = module.exports = function ProjectScaffolder(inputArguments, userOptions, projectConfig) {
  // Call the constructor of the base Yeoman generator class
  scaffoldTool.generators.Base.apply(this, arguments);

  // Register an event handler for the completion of the generator process
  this.on('end', function () {
    // Execute dependency installation, optionally skipping it based on user options
    this.installDependencies({ 'skipInstall': userOptions['skip-install'] });
  });

  // Load and parse the project's package manifest file
  this.appManifest = JSON.parse(this.readFileAsString(fileSystemPath.join(__dirname, '../package.json')));
};

// Establish the inheritance chain from Yeoman's Base generator
utilityModule.inherits(ProjectScaffolder, scaffoldTool.generators.Base);

/**
 * Method to prompt the user for various project details.
 */
ProjectScaffolder.prototype.gatherInput = function gatherInput() {
  var callbackFn = this.async(); // Get an asynchronous callback function

  // Developer note: The generator can display a greeting here if desired.
  // Example: console.log(this.scaffoldTool);

  // Example structure for a prompt object:
  // {
  //   type: 'confirm',
  //   name: 'useSass',
  //   message: 'Do you want to use Sass for stylesheets?',
  //   default: false
  // }

  var questionList = []; // Initialize an array to hold all questions

  // Present the prompts to the user and process their responses
  this.prompt(questionList, function (answers) {
    // Store a user-defined setting from the responses
    this.selectedSetting = answers.someOption;

    callbackFn(); // Signal that the asynchronous operation is complete
  }.bind(this)); // Ensure correct 'this' context within the callback
};

/**
 * Main method for scaffolding the application's directory structure and base files.
 */
ProjectScaffolder.prototype.constructProject = function constructProject() {

  // Log a message indicating the directory creation phase
  console.log('Beginning directory creation...');
  this.mkdir('source');
  this.mkdir('source/assets');
  this.mkdir('source/scripts');
  this.mkdir('source/styles');
  this.mkdir('source/templates');
  this.mkdir('unit_tests');
  this.mkdir('build_output');
  this.mkdir('.temporary');


  // Duplicate essential configuration and project files
  this.copy('_package_descriptor.json', 'package.json');
  this.copy('_bower_descriptor.json', 'bower.json');
  this.copy('bower_config', '.bowerrc');
  this.copy('git_ignore_template', '.gitignore');
  this.copy('travis_ci_config.yml', '.travis.yml');
  this.copy('_project_readme.md','README.md');
  this.copy('_grunt_tasks.js','Gruntfile.js');
};

/**
 * Copies application-specific configuration files.
 */
ProjectScaffolder.prototype.configurationFiles = function configurationFiles() {
  this.copy('editor_configuration', '.editorconfig');
  this.copy('jshint_rules', '.jshintrc');
};

/**
 * Sets up the primary application files.
 */
ProjectScaffolder.prototype.prepareAppStructure = function(){
  this.copy('unit_tests/test_runner.html', 'test/index.html');
  this.copy('unit_tests/libs/chai_library.js', 'test/lib/chai.js');
  this.copy('unit_tests/libs/expect_library.js', 'test/lib/expect.js');
  this.copy('unit_tests/libs/mocha_framework/mocha_base.css', 'test/lib/mocha/mocha.css');
  this.copy('unit_tests/libs/mocha_framework/mocha_core.js', 'test/lib/mocha/mocha.js');
  this.copy('unit_tests/specs/sample_spec.js', 'test/spec/test.js');
  this.copy('unit_tests/specs/main_spec.js', 'test/spec/main.js');
};

/**
 * Configures the test environment by copying necessary files.
 */
ProjectScaffolder.prototype.configureTesting = function(){
  this.copy('source/main_index.html', 'src/index.html');
  this.copy('source/server_config', 'src/.htaccess');
  this.copy('source/error_404.html', 'src/404.html');
  this.copy('source/site_favicon.ico', 'src/favicon.ico');
  this.copy('source/robots_txt.txt', 'src/robots.txt');
  this.copy('source/styles/primary_style.less', 'src/css/main.less');
  this.copy('source/scripts/main_app.js', 'src/js/app.js');
  this.copy('source/scripts/entry_script.js', 'src/js/main.js');
  this.copy('source/assets/company_logo.png', 'src/img/logo.png');
  this.copy('source/templates/welcome_message.html','src/templates/allo.html');
};