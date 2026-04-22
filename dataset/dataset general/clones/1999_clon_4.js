'use strict';
var u_tool = require('util');
var f_path = require('path');
var y_man = require('yeoman-generator');

function BuildMachine(initArgs, initOpts, initConfig) {
  y_man.generators.Base.apply(this, arguments);

  var currentInstance = this;
  var setupOptions = initOpts;

  this.on('end', function () {
    currentInstance.installDependencies({ skipInstall: setupOptions['skip-install'] });
  });

  var packagePath = f_path.join(__dirname, '../package.json');
  this.packageData = JSON.parse(this.readFileAsString(packagePath));
}

BuildMachine.prototype = Object.create(y_man.generators.Base.prototype);
BuildMachine.prototype.constructor = BuildMachine;

module.exports = BuildMachine;

BuildMachine.prototype.interrogateUser = function interrogationStep() {
  var asyncComplete = this.async();

  var requestItems = [];

  this.prompt(requestItems, function (responses) {
    this.userChoice = responses.someOption;
    asyncComplete();
  }.bind(this));
};

BuildMachine.prototype.assembleStructure = function buildApplication() {
  console.info('Initiating directory creation process.');

  var folderList = ['src', 'src/img', 'src/js', 'src/css', 'src/templates', 'test', 'build', '.tmp'];
  folderList.forEach(function(directoryName) {
    this.mkdir(directoryName);
  }.bind(this));

  var fileCopies = [
    { source: '_package.json', destination: 'package.json' },
    { source: '_bower.json', destination: 'bower.json' },
    { source: 'bowerrc', destination: '.bowerrc' },
    { source: 'gitignore', destination: '.gitignore' },
    { source: 'travis.yml', destination: '.travis.yml' },
    { source: '_README.md', destination: 'README.md' },
    { source: '_Gruntfile.js', destination: 'Gruntfile.js' }
  ];

  fileCopies.forEach(function(fileSpec) {
    this.copy(fileSpec.source, fileSpec.destination);
  }.bind(this));
};

BuildMachine.prototype.provisionFiles = function projectFilesSetup() {
  var specificFiles = {
    'editorconfig': '.editorconfig',
    'jshintrc': '.jshintrc'
  };

  for (var srcFile in specificFiles) {
    if (Object.prototype.hasOwnProperty.call(specificFiles, srcFile)) {
      this.copy(srcFile, specificFiles[srcFile]);
    }
  }
};

BuildMachine.prototype.establishTests = function setupApplicationTests() {
  var testResources = [
    ['test/index.html', 'test/index.html'],
    ['test/lib/chai.js', 'test/lib/chai.js'],
    ['test/lib/expect.js', 'test/lib/expect.js'],
    ['test/lib/mocha/mocha.css', 'test/lib/mocha/mocha.css'],
    ['test/lib/mocha/mocha.js', 'test/lib/mocha/mocha.js'],
    ['test/spec/test.js', 'test/spec/test.js'],
    ['test/spec/main.js', 'test/spec/main.js']
  ];

  for (var k = 0; k < testResources.length; k++) {
    this.copy(testResources[k][0], testResources[k][1]);
  }
};

BuildMachine.prototype.configureSource = function initializeApplicationSource() {
  var applicationAssets = [
    { s: 'src/index.html', d: 'src/index.html' },
    { s: 'src/.htaccess', d: 'src/.htaccess' },
    { s: 'src/404.html', d: 'src/404.html' },
    { s: 'src/favicon.ico', d: 'src/favicon.ico' },
    { s: 'src/robots.txt', d: 'src/robots.txt' },
    { s: 'src/css/main.less', d: 'src/css/main.less' },
    { s: 'src/js/app.js', d: 'src/js/app.js' },
    { s: 'src/js/main.js', d: 'src/js/main.js' },
    { s: 'src/img/logo.png', d: 'src/img/logo.png' },
    { s: 'src/templates/allo.html', d: 'src/templates/allo.html' }
  ];

  var copier = this;
  applicationAssets.reduce(function(accumulator, item) {
    copier.copy(item.s, item.d);
    return accumulator;
  }, null);
};