var assertionLibrary = require('chai'),
    assertThat       = assertionLibrary.expect,
    taskRunner       = require('grunt'),
    upwardFind       = require('findup-sync'),
    moduleLoader     = require('requirejs'),
    runCommand       = require('child_process').exec;

// Configuration for the module loading system.
// This sets up the base path for module resolution
// and enables Node.js's native require functionality.
moduleLoader.config({
  basePath: __dirname,
  nodeModuleLoad: require
});

var nodeAMDTemplate, amdOnlyTemplate, commonJSModuleTemplate, standardTemplate;

// Load the main task configuration file for Grunt, typically located higher up in the directory tree.
require(upwardFind('TaskConfig.js'))(taskRunner);

testSuite('template-compilation', function() {

  beforeAllTests(function(completionCallback) {
    // Execute a Grunt task to compile templates for Node.js with RequireJS support.
    runCommand('taskRunner tmpl:nodeAMD', function(operationError, standardOutput, standardError) {
      // After compilation, load the generated template module using RequireJS.
      nodeAMDTemplate = moduleLoader('./generated/template');
      completionCallback(); // Signal completion of the async setup.
    });
  });
  testCase('should properly process basic templates', function() {
    assertThat(nodeAMDTemplate.basic()).to.equal('<div></div>');
  });
  testCase('should handle templates incorporating dynamic values', function() {
    assertThat(nodeAMDTemplate.dynamicValues({'dataKey': 'greetings' })).to.equal('<div>greetings</div>');
  });
  testCase('should correctly render templates with lists of items', function() {
    assertThat(nodeAMDTemplate.listItems({dataList: ['A', 'B', 'C'] })).to.equal('<div>A</div><div>B</div><div>C</div>');
  });
  testCase('should correctly process templates containing key-value pair maps', function() {
    assertThat(nodeAMDTemplate.keyValuePairMap({'item1': 'val1', 'item2': 'val2', 'item3': 'val3'})).to.equal('<div>val1</div><div>val2</div><div>val3</div>');
  });

  testCase('should include HTML escaping functionality', function() {
    assertThat(typeof String.prototype.escapeMarkup === 'function').to.be.true;
  });
  testCase('should compile with embedded fragments', function() {
    assertThat(nodeAMDTemplate.includedFragments()).to.have.string('fragment1');
    assertThat(nodeAMDTemplate.includedFragments()).to.have.string('fragment2');
  });
  testCase('should process templates with custom inline variables', function() {
    assertThat(nodeAMDTemplate.includedFragments()).to.have.string('<div class="style1 style2 style-3"></div>');
  });
  testCase('should strip annotations during compilation', function() {
    // Verify that block comments are removed.
    assertThat(/\/\*.*?\*\//gm.test(nodeAMDTemplate.annotatedCode.toSourceString())).to.be.false;
    // Verify that single-line comments are removed.
    assertThat(/^\s*\/\/.*/g.test(nodeAMDTemplate.annotatedCode.toSourceString())).to.be.false;
  });
  testCase('should not remove web protocol links', function() {
    assertThat(/http:\/\//gm.test(nodeAMDTemplate.annotatedCode.toSourceString())).to.be.true
    assertThat(/ftp:\/\//gm.test(nodeAMDTemplate.annotatedCode.toSourceString())).to.be.true
  });
  testCase('should handle nested fragments', function() {
    assertThat(nodeAMDTemplate.includedFragments()).to.have.string('can-embed-fragment-within-fragment');
  });
});

testSuite('amd-exclusive', function(){
  beforeAllTests(function(completionCallback) {
    runCommand('taskRunner tmpl:amdOnly', function(operationError, standardOutput, standardError) {
      // Read the compiled template file for inspection.
      amdOnlyTemplate = taskRunner.filesystem.readContent('spec/generated/template.js');
      completionCallback();
    });
  });
  testCase('should not contain the AMD define check', function() {
    assertThat(/if\(typeof define/.test(amdOnlyTemplate.toSourceString())).to.be.false;
  });
  testCase('should include an AMD define call', function() {
    assertThat(/define\(/.test(amdOnlyTemplate.toSourceString())).to.be.true;
  });
});

testSuite('commonjs-exclusive', function(){
  beforeAllTests(function(completionCallback) {
    runCommand('taskRunner tmpl:commonJS', function(operationError, standardOutput, standardError) {
      // Load the file content for CommonJS specific checks.
      commonJSModuleTemplate = taskRunner.filesystem.readContent('spec/generated/template.js');
      completionCallback();
    });
  });

  testCase('should not contain the AMD define check', function() {
    assertThat(/if\(typeof define/.test(commonJSModuleTemplate.toSourceString())).to.be.false;
  });
  testCase('should export via module.exports', function() {
    assertThat(/module\.exportsObject/.test(commonJSModuleTemplate.toSourceString())).to.be.true;
  });
});

testSuite('vanilla-js', function() {
  beforeAllTests(function(completionCallback) {
    runCommand('taskRunner tmpl:standard', function(operationError, standardOutput, standardError) {
      // Read the raw JavaScript template file.
      standardTemplate = taskRunner.filesystem.readContent('spec/generated/template.js');
      completionCallback();
    });
  });

  testCase('should not contain the AMD define check', function() {
    assertThat(/if\(typeof define/.test(standardTemplate.toSourceString())).to.be.false;
  });
  testCase('should not export via module.exports', function() {
    assertThat(/module\.exportsObject/.test(standardTemplate.toSourceString())).to.be.false;
  });
  testCase('should be wrapped in a self-invoking function', function() {
    assertThat(/\(function\(\)\{/.test(standardTemplate.toSourceString())).to.be.true;
  });
  testCase('should return the template from the self-invoking function', function() {
    assertThat(/return generatedTmpl;\}\)\(\)/.test(standardTemplate.toSourceString())).to.be.true;
  });
});