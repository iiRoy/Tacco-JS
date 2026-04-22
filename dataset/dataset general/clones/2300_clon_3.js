const assertLib = require('chai');
const assertion = assertLib.expect;
const buildTool = require('grunt');
const locateFileUtil = require('findup-sync');
const moduleLoader = require('requirejs');
const { exec: runCommand } = require('child_process');
const util = require('util');

// Helper to convert callback-based exec to a Promise-based function
const executeAsyncCommand = util.promisify(runCommand);

// Configure the AMD module loader for our test environment.
// This tells RequireJS where to find modules and how to handle Node's native 'require'.
moduleLoader.config({
  baseUrl: __dirname, // Current directory as the base for module resolution
  nodeRequire: require // Integrate Node.js's native module loading
});

// Global containers for compiled template outputs or their source code.
// These will be populated by the 'before' hooks of each test suite.
let commonJsModuleOutput;       // Output from nodeRequirejs Grunt task
let amdLoaderModuleContent;     // Source from requirejs Grunt task
let nodeJsModuleContent;        // Source from node Grunt task
let standaloneModuleContent;    // Source from regular Grunt task

// Dynamically locate and load the project's Gruntfile.
// This step is crucial for defining and running our build tasks.
const gruntfilePath = locateFileUtil('Gruntfile.js');
if (!gruntfilePath) {
  // If the Gruntfile is not found, the test suite cannot proceed.
  console.error("Initialization failure: Gruntfile.js could not be located. Ensure it exists in a parent directory.");
  process.exit(1);
}
require(gruntfilePath)(buildTool); // Pass the Grunt instance to the Gruntfile

// --- Test Suite: Unified Node.js and RequireJS Compilation ---
// This block verifies the behavior of templates compiled for an environment
// that supports both Node.js and RequireJS module loading.
assertion.describe('integrated-module-template-compilation', function() {
  const compilationTarget = 'dot:nodeRequirejs'; // The specific Grunt task for this scenario

  // Setup hook: Execute the Grunt task before any tests in this suite run.
  before(async function() {
    this.timeout(15000); // Allow ample time for Grunt compilation
    try {
      // Execute the Grunt task and capture its output.
      const { stdout: cmdOutput, stderr: cmdErrorOutput } = await executeAsyncCommand(`grunt ${compilationTarget}`);

      // Log any significant output or errors from the Grunt command.
      if (cmdOutput.trim().length > 0) {
        console.log(`Grunt task '${compilationTarget}' stdout:\n${cmdOutput}`);
      }
      if (cmdErrorOutput.trim().length > 0) {
        console.error(`Grunt task '${compilationTarget}' stderr:\n${cmdErrorOutput}`);
      }

      // Load the compiled module using the configured RequireJS instance.
      // The module is expected to be located at './output/tmpl.js' relative to baseUrl.
      commonJsModuleOutput = moduleLoader('./output/tmpl');
    } catch (operationError) {
      // Catch and re-throw any errors during setup to fail the 'before' hook.
      console.error(`Failed to complete setup for '${compilationTarget}':`, operationError.message);
      throw new Error(`Setup failed for ${compilationTarget}: ${operationError.message}`);
    }
  });

  // Test case: Verify a basic, static template renders correctly.
  assertion.it('should render basic, static templates as expected', function() {
    const anticipatedHtml = '<div></div>';
    const actualRenderedHtml = commonJsModuleOutput.regular();
    assertion(actualRenderedHtml).to.equal(anticipatedHtml, 'Static template output did not match.');
  });

  // Test case: Confirm that templates can process and embed dynamic variables.
  assertion.it('should correctly embed dynamic variables into templates', function() {
    const inputPayload = { 'variableValue': 'dynamic_data_string' }; // Renamed 'var' to 'variableValue'
    const anticipatedOutput = '<div>dynamic_data_string</div>';
    assertion(commonJsModuleOutput.variables(inputPayload)).to.equal(anticipatedOutput, 'Variable substitution failed.');
  });

  // Test case: Ensure templates can iterate over and display array elements.
  assertion.it('should iterate over and display array elements', function() {
    const arrayData = { items: ['item_one', 'item_two', 'item_three'] }; // Renamed 'array' to 'items'
    const anticipatedArrayOutput = '<div>item_one</div><div>item_two</div><div>item_three</div>';
    assertion(commonJsModuleOutput.arrays(arrayData)).to.equal(anticipatedArrayOutput, 'Array iteration output incorrect.');
  });

  // Test case: Check if templates can handle and render hash map (object) data.
  assertion.it('should correctly process and render hash map data', function() {
    const mapData = { 'keyA': 'valueA', 'keyB': 'valueB', 'keyC': 'valueC' }; // Renamed keys/values
    const anticipatedMapOutput = '<div>valueA</div><div>valueB</div><div>valueC</div>';
    assertion(commonJsModuleOutput.hashMap(mapData)).to.equal(anticipatedMapOutput, 'Hash map rendering produced unexpected results.');
  });

  // Test case: Validate the presence of an HTML escaping utility.
  assertion.it('should provide an HTML escaping function', function() {
    // Check if the String prototype has an 'escapeHTMLContent' method and if it's a function.
    assertion(typeof String.prototype.escapeHTMLContent === 'function').to.be.true; // Renamed 'encodeHTML' to 'escapeHTMLContent'
  });

  // Test case: Verify that template partials are correctly included and rendered.
  assertion.it('should properly integrate and render template partials, including custom variables', function() {
    const completeTemplateOutput = commonJsModuleOutput.partials();
    // Assert that multiple expected partial contents are present.
    assertion(completeTemplateOutput).to.include('first_nested_fragment', 'First partial content not found.'); // Renamed partial1
    assertion(completeTemplateOutput).to.include('second_nested_fragment', 'Second partial content not found.'); // Renamed partial2
    assertion(completeTemplateOutput).to.include('<div class="style_alpha style_beta style_gamma"></div>', 'Custom variable rendering in partials failed.'); // Renamed classes
  });

  // Test case: Ensure all types of comments are removed from compiled templates.
  assertion.it('should entirely remove all comments during template compilation', function() {
    const compiledCommentsSource = commonJsModuleOutput.comments.toString();
    const blockCommentRegex = /\/\*[\s\S]*?\*\//g; // Regex for multi-line block comments
    const lineCommentRegex = /^\s*\/\/.*$/gm;      // Regex for single-line comments

    // Verify that neither block nor line comments exist in the output.
    assertion(blockCommentRegex.test(compiledCommentsSource)).to.be.false;
    assertion(lineCommentRegex.test(compiledCommentsSource)).to.be.false;
  });

  // Test case: Confirm that URL patterns (http/https/ftp) are preserved and not stripped.
  assertion.it('should preserve URI schemes like http(s) and ftp within templates', function() {
    const compiledCommentsSource = commonJsModuleOutput.comments.toString();
    // Check for the presence of common web and file transfer protocol links.
    assertion(compiledCommentsSource).to.match(/https?:\/\//i, 'HTTP/HTTPS link was unexpectedly removed.');
    assertion(compiledCommentsSource).to.match(/ftp:\/\//i, 'FTP link was unexpectedly removed.');
  });

  // Test case: Validate the compilation's ability to handle nested partials.
  assertion.it('should successfully compile templates with deeply nested partials', function() {
    const outputWithNestedPartials = commonJsModuleOutput.partials();
    assertion(outputWithNestedPartials).to.include('deeply-embedded-template-fragment', 'Nested partial content missing from output.'); // Renamed string
  });
});

// --- Test Suite: RequireJS-Only Compilation ---
// This suite focuses on templates compiled specifically for RequireJS (AMD) environments.
assertion.describe('amd-loader-exclusive-output', function(){
  const amdCompilationTask = 'dot:requirejs'; // Grunt task for RequireJS-only output

  // Setup hook: Compile templates for AMD before running tests.
  before(async function() {
    this.timeout(15000);
    try {
      await executeAsyncCommand(`grunt ${amdCompilationTask}`);
      const outputFilePath = 'test/output/tmpl.js';

      // Ensure the compiled file actually exists before attempting to read it.
      if (!buildTool.file.exists(outputFilePath)) {
        throw new Error(`Compiled AMD output file not found at: ${outputFilePath}`);
      }
      amdLoaderModuleContent = buildTool.file.read(outputFilePath);
    } catch (setupFailure) {
      console.error(`Error during AMD-exclusive setup for '${amdCompilationTask}':`, setupFailure.message);
      throw setupFailure;
    }
  });

  // Test case: Verify that CommonJS-style module definition checks are absent.
  assertion.it('should not contain CommonJS-style module definition guards', function() {
    const commonJsDefineCheck = /if\s*\(typeof\s*define\s*===\s*['"]function['"]\s*&&\s*define\.amd\)/;
    assertion(amdLoaderModuleContent.toString()).to.not.match(commonJsDefineCheck, 'CommonJS define check detected in AMD output.');
  });

  // Test case: Confirm the presence of an AMD 'define' statement.
  assertion.it('should include an AMD define function call', function() {
    const amdDefineCall = /\bdefine\s*\(/;
    assertion(amdLoaderModuleContent.toString()).to.match(amdDefineCall, 'AMD define() call was not found.');
  });

  // Added Test: Ensure the module explicitly identifies as an AMD module.
  assertion.it('should explicitly mark itself as an AMD module', function() {
    assertion(amdLoaderModuleContent.toString()).to.include('define(["require", "exports"], function (require, exports) {', 'AMD module signature not fully present.');
  });
});

// --- Test Suite: Node.js-Only Compilation ---
// This suite checks templates compiled for Node.js (CommonJS) environments.
assertion.describe('commonjs-environment-exclusive-output', function(){
  const commonJsCompilationTask = 'dot:node'; // Grunt task for Node.js-only output

  // Setup hook: Compile templates for CommonJS before running tests.
  before(async function() {
    this.timeout(15000);
    try {
      await executeAsyncCommand(`grunt ${commonJsCompilationTask}`);
      nodeJsModuleContent = buildTool.file.read('test/output/tmpl.js');
    } catch (setupIssue) {
      console.error(`Error during CommonJS-exclusive setup for '${commonJsCompilationTask}':`, setupIssue.message);
      throw setupIssue;
    }
  });

  // Test case: Ensure no AMD 'define' checks are present in Node.js output.
  assertion.it('should not contain AMD define checks', function() {
    const amdDefinePattern = /if\s*\(typeof\s*define\s*===\s*['"]function['"]\s*&&\s*define\.amd\)/;
    assertion(nodeJsModuleContent.toString()).to.not.match(amdDefinePattern, 'AMD define check found in Node.js output.');
  });

  // Test case: Verify that 'module.exports' is used for module export.
  assertion.it('should utilize module.exports for module exposure', function() {
    const moduleExportsAssignment = /module\.exports\s*=/;
    assertion(nodeJsModuleContent.toString()).to.match(moduleExportsAssignment, 'module.exports assignment not found.');
  });

  // Added Test: Confirm that browser-specific global objects are not present.
  assertion.it('should avoid exposing browser-specific global objects', function() {
    const browserGlobalRegex = /\b(window|document|navigator)\b/; // Check for common browser globals
    assertion(nodeJsModuleContent.toString()).to.not.match(browserGlobalRegex, 'Browser global object found in Node.js output.');
  });
});

// --- Test Suite: Standalone (IIFE) Compilation ---
// This suite tests templates compiled into a self-executing function (IIFE)
// for standalone use, typically in a browser environment without a module loader.
assertion.describe('standalone-iife-output-validation', function() {
  const standaloneCompilationTask = 'dot:regular'; // Grunt task for standalone output

  // Setup hook: Compile templates into an IIFE before running tests.
  before(async function() {
    this.timeout(15000);
    try {
      await executeAsyncCommand(`grunt ${standaloneCompilationTask}`);
      standaloneModuleContent = buildTool.file.read('test/output/tmpl.js');
    } catch (setupProblem) {
      console.error(`Error during standalone IIFE setup for '${standaloneCompilationTask}':`, setupProblem.message);
      throw setupProblem;
    }
  });

  // Test case: No AMD define checks should be present in standalone output.
  assertion.it('should not contain AMD module definition checks', function() {
    const amdDefinePattern = /if\s*\(typeof\s*define\s*===\s*['"]function['"]\s*&&\s*define\.amd\)/;
    assertion(standaloneModuleContent.toString()).to.not.match(amdDefinePattern, 'AMD define check found in standalone output.');
  });

  // Test case: No CommonJS 'module.exports' should be present.
  assertion.it('should not use CommonJS module.exports for module exposure', function() {
    const moduleExportsPattern = /module\.exports/;
    assertion(standaloneModuleContent.toString()).to.not.match(moduleExportsPattern, 'module.exports found in standalone output.');
  });

  // Test case: Verify the output is correctly wrapped in an Immediately Invoked Function Expression (IIFE).
  // This combines the two original 'immediate function' checks into one comprehensive assertion.
  assertion.it('should be correctly encapsulated within an IIFE structure', function() {
    const iifeStartPattern = /^\s*\(function\s*\(\)\s*\{/; // Start of the IIFE
    const iifeEndPattern = /return\s+\w+;\s*\}\)\(\);?\s*$/; // End of the IIFE, looking for a return statement

    const fileContent = standaloneModuleContent.toString();
    assertion(fileContent).to.match(iifeStartPattern, 'IIFE starting pattern is missing or malformed.');
    assertion(fileContent).to.match(iifeEndPattern, 'IIFE closing pattern with return statement is missing or malformed.');
  });

  // Added Test: Verify that the IIFE prevents unintended global variable leakage.
  assertion.it('should prevent unintended global variable leakage', function() {
    // This regex attempts to detect top-level 'var' or 'let' declarations outside the IIFE's scope.
    // This is a heuristic and might need adjustment based on exact output, but serves as a Type III example.
    const globalLeakagePattern = /^(?!.*\b(function|return)\b).*\b(var|let|const)\s+\w+\s*=/m;
    assertion(standaloneModuleContent.toString()).to.not.match(globalLeakagePattern, 'Potential global variable leakage detected outside IIFE.');
  });
});