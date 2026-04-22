/*
 * Copyright (c) 2023, Acme Solutions Inc. All rights reserved.
 *
 * This software is distributed under a proprietary license agreement.
 * Usage, modification, and redistribution in any form are strictly prohibited
 * without prior written consent from Acme Solutions Inc.
 *
 * This code is provided AS IS, without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a
 * particular purpose, and non-infringement. In no event shall Acme Solutions Inc.
 * be liable for any claims, damages, or other liabilities arising from or related
 * to the use of this software.
 */

var check = require('assert');
var mockingAid = require('sinon');

var fileSys = require('fs');
var filePathUtil = require('path');
var streamBuilder = require('gulp');
var streamUtilExtra = require('gulp-util');
var streamTransform = require('through2');
var dataUtils = require('lodash');
var xmlProcessor = require('xml2js');

var flowHelpers = require('../../dist/stream-util');
var propertyManager = require('../../dist/props');

// Helper function to ascertain if an object represents an error.
const verifyErrorInstance = (potentialError) => {
  return (potentialError instanceof Error) || (potentialError instanceof streamUtilExtra.PluginError);
};

// Main test suite for the property management module.
describe('propertyManager Core Functionality', function() {

  // Test block for retrieving value transformation functions.
  describe('propertyManager#fetchValueTransformer()', function() {
    // Verifies that an error is thrown if an unregistered transformer name is provided.
    it('should raise an exception if the specified value transformer is not present', function() {
      // Expecting a specific error to be thrown.
      check.throws(() => {
        propertyManager.getValueTransform('nonExistentTransformKey');
      }, Error, 'Accessing an unregistered transformer should throw an error.');
    });

    // Confirms that a valid, functional copy of the transformer is returned.
    it('must yield a functional replica of the requested value transformer', function() {
      const colorConverter = propertyManager.getValueTransform('color/rgb');
      // Ensure the returned object contains the necessary functional components.
      check.strictEqual(typeof colorConverter.matcher, 'function', 'The matcher component must be a function.');
      check.strictEqual(typeof colorConverter.transformer, 'function', 'The transformer component must be a function.');
    });
  });

  // Test block for checking value transformer registration status.
  describe('propertyManager#isValueTransformerRegistered()', function() {
    // Asserts true for an existing transformer.
    it('returns true when the value transformation is actively registered', function() {
      check.ok(propertyManager.valueTransformIsRegistered('color/rgb'), 'Known transform "color/rgb" should be registered.');
    });

    // Asserts false for a non-existent transformer.
    it('returns false if the value transformation is not available in the system', function() {
      const isAbsent = propertyManager.valueTransformIsRegistered('color/rgb/invalid');
      check.strictEqual(isAbsent, false, 'Unknown transform "color/rgb/invalid" should not be registered.');
    });
  });

  // Test block for the value transformer registration process.
  describe('propertyManager#registerValueTransformer()', function() {
    const sampleMatchLogic = () => true; // A dummy matcher function.
    const sampleTransformLogic = (val) => val.toUpperCase(); // A dummy transformer function.

    // Checks for errors when the name is missing or of an incorrect type.
    it('throws an error if the name parameter is omitted or is not a string type', function() {
      check.throws(() => {
        propertyManager.registerValueTransform(); // No arguments.
      }, /name.*string/, 'Missing name should throw string type error.');
      check.throws(() => {
        propertyManager.registerValueTransform(123); // Non-string name.
      }, /name.*string/, 'Non-string name should throw type error.');
    });

    // Checks for errors when the matcher is missing or not a function.
    it('throws an error if the matcher function is not supplied or is not a callable entity', function() {
      check.throws(() => {
        propertyManager.registerValueTransform('testTransform'); // Missing matcher.
      }, /matcher.*function/, 'Missing matcher should throw function type error.');
      check.throws(() => {
        propertyManager.registerValueTransform('testTransform', 'notAFunction'); // Non-function matcher.
      }, /matcher.*function/, 'Non-function matcher should throw type error.');
    });

    // Checks for errors when the transformer is missing or not a function.
    it('throws an error if the transformer function is not provided or is not a callable entity', function() {
      check.throws(() => {
        propertyManager.registerValueTransform('testTransform', sampleMatchLogic); // Missing transformer.
      }, /transformer.*function/, 'Missing transformer should throw function type error.');
      check.throws(() => {
        propertyManager.registerValueTransform('testTransform', sampleMatchLogic, {
          obj: true
        }); // Non-function transformer.
      }, /transformer.*function/, 'Non-function transformer should throw type error.');
    });

    // Verifies successful registration of a new value transformer.
    it('successfully enrolls the specified value transformer', function() {
      const transformKey = 'newCustomTransform';
      propertyManager.registerValueTransform(transformKey, sampleMatchLogic, sampleTransformLogic);
      const retrievedTransformer = propertyManager.getValueTransform(transformKey);
      check.strictEqual(retrievedTransformer.matcher, sampleMatchLogic, 'Retrieved matcher must be the registered one.');
      check.strictEqual(retrievedTransformer.transformer, sampleTransformLogic, 'Retrieved transformer must be the registered one.');
    });

    // Ensures that registering with an existing name overwrites the previous definition.
    it('enrolls the value transformer, replacing any prior definitions with the same name', function() {
      const overwriteKey = 'overwritableTransform';
      const initialMatcher = () => false;
      const initialTransformer = (v) => v.toLowerCase();

      propertyManager.registerValueTransform(overwriteKey, initialMatcher, initialTransformer);
      const newMatcher = (val) => val.length > 5;
      const newTransformer = (val) => `prefix-${val}`;
      propertyManager.registerValueTransform(overwriteKey, newMatcher, newTransformer); // Overwrite.

      const updatedTransformer = propertyManager.getValueTransform(overwriteKey);
      check.notStrictEqual(updatedTransformer.matcher, initialMatcher, 'Matcher should be updated.');
      check.notStrictEqual(updatedTransformer.transformer, initialTransformer, 'Transformer should be updated.');
      check.strictEqual(updatedTransformer.matcher, newMatcher, 'Matcher should be the new one.');
      check.strictEqual(updatedTransformer.transformer, newTransformer, 'Transformer should be the new one.');
    });
  });

  // Test block for retrieving property transformation pipelines.
  describe('propertyManager#retrieveTransformPipeline()', function() {
    // Confirms an error is thrown for an unregistered pipeline.
    it('throws an exception if the requested transformation pipeline is not registered', function() {
      check.throws(() => {
        propertyManager.getTransform('nonExistentPipeline');
      }, Error, 'Accessing an unregistered pipeline should throw an error.');
    });

    // Verifies that a copy of the pipeline, containing expected value transforms, is returned.
    it('provides a duplicate of the transformation pipeline', function() {
      const webPipeline = propertyManager.getTransform('web');
      check.ok(Array.isArray(webPipeline), 'The pipeline should be an array.');
      check.ok(dataUtils.includes(webPipeline, 'color/rgb'), 'Web pipeline should include "color/rgb" transform.');
    });
  });

  // Test block for checking transformation pipeline registration status.
  describe('propertyManager#isTransformPipelineRegistered()', function() {
    // Returns true for a registered pipeline.
    it('returns a positive indicator if the transformation pipeline is currently registered', function() {
      check.ok(propertyManager.transformIsRegistered('web'), 'Known pipeline "web" should be registered.');
    });

    // Returns false for an unregistered pipeline.
    it('returns a negative indicator if the transformation pipeline is not present', function() {
      check.strictEqual(propertyManager.transformIsRegistered('unknownPipeline'), false, 'Unknown pipeline "unknownPipeline" should not be registered.');
    });
  });

  // Test block for registering property transformation pipelines.
  describe('propertyManager#enrollTransformPipeline()', function() {
    // Checks for errors when the name is missing or not a string.
    it('throws an error if the pipeline name is absent or is not a string type', function() {
      check.throws(() => {
        propertyManager.registerTransform();
      }, /name.*string/, 'Missing pipeline name should throw string type error.');
      check.throws(() => {
        propertyManager.registerTransform(null);
      }, /name.*string/, 'Null pipeline name should throw type error.');
    });

    // Checks for errors when the list of value matchers is missing or not an array.
    it('throws an error if the collection of value matchers is not supplied or is not an array', function() {
      check.throws(() => {
        propertyManager.registerTransform('myPipeline');
      }, /array.*value transformations/, 'Missing transform list should throw array error.');
      check.throws(() => {
        propertyManager.registerTransform('myPipeline', {});
      }, /array.*value transformations/, 'Non-array transform list should throw array error.');
    });

    // Checks for errors if any value transform in the list is not registered.
    it('throws an error if any of the specified value transformations are not yet registered', function() {
      check.throws(() => {
        propertyManager.registerTransform('complexPipeline', ['color/rgb', 'nonExistentValueTransform']);
      }, /Value transform "nonExistentValueTransform" is not registered./, 'Unregistered value transform in pipeline list should throw error.');
    });

    // Verifies successful registration of a new pipeline.
    it('successfully registers the transformation pipeline', function() {
      propertyManager.registerValueTransform('tempValueTransform', () => true, (v) => v); // Ensure 'tempValueTransform' exists for this test.
      const pipelineName = 'newPipeline';
      const pipelineTransforms = ['tempValueTransform'];
      propertyManager.registerTransform(pipelineName, pipelineTransforms);
      const retrievedPipeline = propertyManager.getTransform(pipelineName);
      check.deepStrictEqual(retrievedPipeline, pipelineTransforms, 'Retrieved pipeline must match registered transforms.');
    });

    // Ensures that registering with an existing name overwrites the previous definition.
    it('registers the pipeline, replacing any pre-existing pipelines with the same key', function() {
      const existingPipelineKey = 'existingPipeline';
      propertyManager.registerTransform(existingPipelineKey, ['color/rgb']);
      const newPipelineTransforms = ['color/hex']; // Assume 'color/hex' is registered.
      propertyManager.registerTransform(existingPipelineKey, newPipelineTransforms);
      const updatedPipeline = propertyManager.getTransform(existingPipelineKey);
      check.deepStrictEqual(updatedPipeline, newPipelineTransforms, 'Pipeline should be updated to new transforms.');
    });
  });

  // Test block for retrieving format functions.
  describe('propertyManager#retrieveFormatter()', function() {
    // Confirms an error is thrown for an unregistered format.
    it('throws an exception if the desired format is not registered', function() {
      check.throws(() => {
        propertyManager.getFormat('unregisteredFormat');
      }, Error, 'Accessing an unregistered format should throw an error.');
    });

    // Verifies that a function is returned for a registered format.
    it('provides a copy of the format function', function() {
      const scssFormatter = propertyManager.getFormat('scss');
      check.strictEqual(typeof scssFormatter, 'function', 'SCSS formatter should be a function.');
    });
  });

  // Test block for checking format registration status.
  describe('propertyManager#isFormatterRegistered()', function() {
    // Returns true for a registered format.
    it('returns true if the format handler is registered in the system', function() {
      check.ok(propertyManager.formatIsRegistered('scss'), 'Known format "scss" should be registered.');
    });

    // Returns false for an unregistered format.
    it('returns false if the format handler is not yet registered', function() {
      check.strictEqual(propertyManager.formatIsRegistered('unknownFormat'), false, 'Unknown format "unknownFormat" should not be registered.');
    });
  });

  // Test block for registering format functions.
  describe('propertyManager#enrollFormatter()', function() {
    const sampleFormatter = (data) => JSON.stringify(data); // A dummy formatter function.

    // Checks for errors when the name is missing or not a string.
    it('throws an error if the format name is not provided or is not a string', function() {
      check.throws(() => {
        propertyManager.registerFormat();
      }, /name.*string/, 'Missing format name should throw string type error.');
      check.throws(() => {
        propertyManager.registerFormat(true);
      }, /name.*string/, 'Boolean format name should throw type error.');
    });

    // Checks for errors when the formatter function is missing or not a function.
    it('throws an error if the formatter function is not supplied or is not a callable entity', function() {
      check.throws(() => {
        propertyManager.registerFormat('jsonFormat');
      }, /formatter.*function/, 'Missing formatter should throw function type error.');
      check.throws(() => {
        propertyManager.registerFormat('jsonFormat', 'notAFunction');
      }, /formatter.*function/, 'Non-function formatter should throw type error.');
    });

    // Verifies successful registration of a new format.
    it('successfully registers the format function', function() {
      const formatKey = 'newJsonFormat';
      propertyManager.registerFormat(formatKey, sampleFormatter);
      const retrievedFormatter = propertyManager.getFormat(formatKey);
      check.strictEqual(retrievedFormatter, sampleFormatter, 'Retrieved formatter must be the registered one.');
    });
  });

});

// Test suite for property management plugin functionalities.
describe('propertyManager.plugins Extensions', function() {

  // Test block for the legacy data conversion plugin.
  describe('#legacyDataConverter()', function() {

    // Helper to process a legacy JSON file through the plugin.
    function processLegacySource(completionCallback, formatModifier) {
      const sourcePath = filePathUtil.resolve(__dirname, 'mock', 'legacy.json');
      streamBuilder.src(sourcePath)
        .pipe(streamTransform.obj(function(fileObject, encoding, nextStep) {
          try {
            const rawContent = fileObject.contents.toString();
            let parsedContent = JSON.parse(rawContent);
            if (formatModifier && typeof formatModifier === 'function') {
              parsedContent = formatModifier(parsedContent);
            }
            fileObject.contents = Buffer.from(JSON.stringify(parsedContent));
            nextStep(null, fileObject);
          } catch (parseErr) {
            nextStep(parseErr); // Propagate parsing errors.
          }
        }))
        .pipe(propertyManager.plugins.legacy())
        .on('error', function(processingError) {
          completionCallback(processingError);
        })
        .on('finish', function() {
          completionCallback();
        });
    }

    // Helper to collect output files from the legacy plugin.
    function collectLegacyOutput(completionCallback, sourceFile = 'legacy.json') {
      const outputFiles = [];
      const sourcePath = filePathUtil.resolve(__dirname, 'mock', sourceFile);
      streamBuilder.src(sourcePath)
        .pipe(propertyManager.plugins.legacy())
        .pipe(streamTransform.obj(function(fileObject, encoding, nextStep) {
          outputFiles.push(fileObject);
          nextStep();
        }))
        .on('finish', function() {
          completionCallback(outputFiles);
        });
    }

    // Ensures an error is piped for malformed JSON input.
    it('pipes an error if the input Design Properties file is malformed JSON', function(complete) {
      processLegacySource(function(operationError) {
        check.ok(verifyErrorInstance(operationError), 'Error should be a valid instance.');
        check.match(operationError.message, /encountered an invalid/, 'Error message should indicate invalid data structure.');
        complete();
      }, (json) => '{"foo":'); // Intentionally malformed JSON.
    });

    // Ensures an error is piped if the root of the Design Properties file is not an object.
    it('pipes an error if the Design Properties file does not contain a root object', function(complete) {
      processLegacySource(function(operationError) {
        check.ok(verifyErrorInstance(operationError), 'Error should be a valid instance.');
        check.match(operationError.message, /non object/, 'Error message should indicate non-object root.');
        complete();
      }, (json) => '[]'); // Array instead of object.
    });

    // Ensures an error is piped if a property lacks a "name" key.
    it('pipes an error if a property within the structure lacks a "name" identifier', function(complete) {
      processLegacySource(function(operationError) {
        check.ok(verifyErrorInstance(operationError), 'Error should be a valid instance.');
        check.match(operationError.message, /name/, 'Error message should complain about missing name.');
        complete();
      }, function(json) {
        // Manipulate JSON to remove 'name' from a property.
        json.theme = json.theme || {};
        json.theme.properties = [{
          "value": "red"
        }];
        return json;
      });
    });

    // Verifies that the plugin produces exactly one output JSON file.
    it('generates a singular JSON file as output', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        check.strictEqual(outputFiles.length, 1, 'Expected precisely one output file.');
        complete();
      });
    });

    // Asserts that the output is valid JSON.
    it('produces JSON content that is syntactically valid', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        check.doesNotThrow(() => {
          JSON.parse(outputFiles[0].contents.toString());
        }, 'Output file content should be parseable JSON.');
        complete();
      });
    });

    // Confirms conversion of legacy design properties to the new format.
    it('transforms legacy design properties into the updated format structure', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        const parsedContent = JSON.parse(outputFiles[0].contents.toString());
        check.strictEqual(parsedContent.props.a.value, 'foo', 'Property "a" value must be "foo".');
        check.strictEqual(parsedContent.props.b.value, 'bar', 'Property "b" value must be "bar".');
        check.ok(!Object.prototype.hasOwnProperty.call(parsedContent, 'theme'), 'The old "theme" key should no longer exist.');
        complete();
      });
    });

    // Confirms conversion of legacy aliases to the new format.
    it('converts legacy alias definitions to the modern format', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        const parsedContent = JSON.parse(outputFiles[0].contents.toString());
        check.ok(!Array.isArray(parsedContent.aliases), 'Aliases should not be an array in the new format.');
        check.ok(Object.prototype.hasOwnProperty.call(parsedContent.aliases, 'SKY'), 'Aliases object must contain a "SKY" key.');
        complete();
      });
    });

    // Confirms import of legacy aliases from an alternative source.
    it('successfully imports legacy aliases from an alternative source configuration', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        const parsedContent = JSON.parse(outputFiles[0].contents.toString());
        check.ok(!Array.isArray(parsedContent.aliases), 'Aliases should not be an array from alt source.');
        check.ok(Object.prototype.hasOwnProperty.call(parsedContent.aliases, 'SKY'), 'Aliases from alt source should contain "SKY" key.');
        complete();
      }, 'legacy-alt.json');
    });

    // Confirms conversion of 'imports' to 'auraImports'.
    it('converts older "imports" directives into "auraImports"', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        const parsedContent = JSON.parse(outputFiles[0].contents.toString());
        check.ok(Array.isArray(parsedContent.auraImports), 'New format should have an "auraImports" array.');
        check.strictEqual(parsedContent.auraImports.length, 1, 'Expected one auraImport entry.');
        complete();
      }, 'legacy-alt.json');
    });

    // Confirms conversion of 'extends' to 'auraExtends'.
    it('converts older "extends" directives into "auraExtends"', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        const parsedContent = JSON.parse(outputFiles[0].contents.toString());
        check.strictEqual(typeof parsedContent.auraExtends, 'string', 'New format should have a string "auraExtends".');
        check.strictEqual(parsedContent.auraExtends, 'aura:component', 'auraExtends value should be correct.');
        complete();
      }, 'legacy-alt.json');
    });

    // Confirms type inference for properties.
    it('assigns a relevant data type to properties where inferable', function(complete) {
      collectLegacyOutput(function(outputFiles) {
        const parsedContent = JSON.parse(outputFiles[0].contents.toString());
        check.strictEqual(parsedContent.props.d.type, 'color', 'Property "d" should be inferred as "color".');
        check.strictEqual(parsedContent.props.e.type, 'size', 'Property "e" should be inferred as "size".');
        complete();
      }, 'legacy-alt.json');
    });
  });

  // Test block for the property transformation plugin.
  describe('#propertyTransformation()', function() {
    // Transforms Design Properties from a JSON source.
    it('applies transformations to Design Properties provided in JSON format', function(complete) {
      let pipelineError;
      streamBuilder.src(filePathUtil.resolve(__dirname, 'mock', 'sample.json'))
        .on('error', function(err) {
          pipelineError = err;
        })
        .on('finish', function() {
          check.notOk(pipelineError, 'No error should occur during JSON transformation.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'));
    });

    // Transforms Design Properties from a YML source.
    it('applies transformations to Design Properties provided in YML format', function(complete) {
      let pipelineError;
      streamBuilder.src(filePathUtil.resolve(__dirname, 'mock', 'sample.yml'))
        .on('error', function(err) {
          pipelineError = err;
        })
        .on('finish', function() {
          check.notOk(pipelineError, 'No error should occur during YML transformation.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'));
    });
  });

  // Test block for the property formatting plugin.
  describe('#propertyFormatting()', function() {
    // Throws an error for invalid options passed to the formatter.
    it('throws an exception for improperly configured formatting options', function() {
      check.throws(() => {
        propertyManager.plugins.format('web', false); // Invalid options type.
      }, /Invalid options object/, 'Should throw error for non-object options.');
    });

    // Throws an error if `propsFilter` option is not a function.
    it('throws an error if the "propsFilter" option is not a functional predicate', function() {
      let capturedError;
      try {
        propertyManager.plugins.format('web', {
          propsFilter: 'notAFunction'
        });
      } catch (e) {
        capturedError = e;
      }
      check.ok(capturedError, 'An error should be caught.');
      check.match(capturedError.message, /propsFilter.*function/, 'Error message should mention function requirement.');
    });

    // Formats properties successfully.
    it('correctly formats the processed properties', function(complete) {
      let pipelineError, formattedOutputContent;
      const jsonSourcePath = filePathUtil.resolve(__dirname, 'mock', 'sample.json');
      streamBuilder.src(jsonSourcePath)
        .on('error', function(err) {
          pipelineError = err;
        })
        .on('finish', function() {
          check.notOk(pipelineError, 'No error should occur during formatting.');
          check.doesNotThrow(() => {
            JSON.parse(formattedOutputContent);
          }, 'Formatted output must be valid JSON.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'))
        .pipe(propertyManager.plugins.format('raw.json'))
        .pipe(propertyManager.plugins.getResult(function(resultData) {
          formattedOutputContent = resultData;
        }));
    });

    // Filters properties before formatting.
    it('applies property filtering before the formatting operation', function(complete) {
      let finalParsedContent;
      const jsonSourcePath = filePathUtil.resolve(__dirname, 'mock', 'sample.json');
      streamBuilder.src(jsonSourcePath)
        .on('finish', function() {
          check.strictEqual(finalParsedContent.propKeys.length, 1, 'Expected only one property key after filtering.');
          check.strictEqual(Object.keys(finalParsedContent.props).length, 1, 'Expected only one property after filtering.');
          check.ok(finalParsedContent.props.account, 'The filtered property should be "account".');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'))
        .pipe(propertyManager.plugins.format('raw.json', {
          propsFilter: (prop) => prop.name === 'account'
        }))
        .pipe(propertyManager.plugins.getResult(function(resultData) {
          finalParsedContent = JSON.parse(resultData);
        }));
    });

    // Renames the output file correctly based on format.
    it('renames the output file according to the chosen format', function(complete) {
      let transformedFileObject;
      const jsonSourcePath = filePathUtil.resolve(__dirname, 'mock', 'sample.json');
      streamBuilder.src(jsonSourcePath)
        .on('finish', function() {
          check.strictEqual(transformedFileObject.relative, 'sample.scss', 'Output filename should reflect the SCSS format.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'))
        .pipe(propertyManager.plugins.format('scss'))
        .pipe(streamTransform.obj(function(fileInput, encoding, nextStep) {
          transformedFileObject = fileInput;
          nextStep(null, fileInput);
        }));
    });
  });

  // Test block for the getResult plugin.
  describe('#fetchResult()', function() {
    // Gets the result after a transform operation.
    it('retrieves the outcome of a transformation step', function(complete) {
      let pipelineError;
      const resultSpy = mockingAid.spy(); // Monitor callback invocation.
      streamBuilder.src(filePathUtil.resolve(__dirname, 'mock', 'sample.json'))
        .on('error', function(err) {
          pipelineError = err;
        })
        .on('finish', function() {
          check.notOk(pipelineError, 'No error should occur during result retrieval post-transform.');
          check.ok(resultSpy.calledOnce, 'Result callback should be invoked exactly once.');
          check.doesNotThrow(() => {
            JSON.parse(resultSpy.getCall(0).args[0]);
          }, 'Result content must be valid JSON.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'))
        .pipe(propertyManager.plugins.getResult(resultSpy));
    });

    // Gets the result after a format operation.
    it('retrieves the outcome of a formatting step', function(complete) {
      let pipelineError;
      const resultSpy = mockingAid.spy();
      streamBuilder.src(filePathUtil.resolve(__dirname, 'mock', 'sample.json'))
        .on('error', function(err) {
          pipelineError = err;
        })
        .on('finish', function() {
          check.notOk(pipelineError, 'No error should occur during result retrieval post-format.');
          check.ok(resultSpy.calledOnce, 'Result callback should be invoked exactly once.');
          check.doesNotThrow(() => {
            JSON.parse(resultSpy.getCall(0).args[0]);
          }, 'Result content must be valid JSON.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'))
        .pipe(propertyManager.plugins.format('raw.json'))
        .pipe(propertyManager.plugins.getResult(resultSpy));
    });

    // Ensures the file stream continues flowing after result retrieval.
    it('ensures the processed file continues through the stream pipeline', function(complete) {
      let pipelineError;
      const firstCallback = mockingAid.spy();
      const secondCallback = mockingAid.spy();
      streamBuilder.src(filePathUtil.resolve(__dirname, 'mock', 'sample.json'))
        .on('error', function(err) {
          pipelineError = err;
        })
        .on('finish', function() {
          check.notOk(pipelineError, 'No error should interrupt stream flow.');
          check.ok(firstCallback.calledOnce, 'First result callback should be called once.');
          check.ok(secondCallback.calledOnce, 'Second result callback should be called once, indicating flow.');
          complete();
        })
        .pipe(propertyManager.plugins.transform('web'))
        .pipe(propertyManager.plugins.format('raw.json'))
        .pipe(propertyManager.plugins.getResult(firstCallback))
        .pipe(propertyManager.plugins.getResult(secondCallback)); // Chained getResult.
    });
  });

  // Test block for the diff plugin.
  describe('#propertyDifferenceAnalyzer()', function() {
    let outputFilesCollection; // Collection of files after diff processing.

    // Setup: Process mock files through transform and diff.
    beforeEach(function(completeSetup) {
      outputFilesCollection = [];
      const sourceFiles = [
        filePathUtil.resolve(__dirname, 'mock', 'a.json'),
        filePathUtil.resolve(__dirname, 'mock', 'b.json')
      ];
      streamBuilder.src(sourceFiles)
        .pipe(propertyManager.plugins.transform('ios'))
        .pipe(propertyManager.plugins.diff())
        .pipe(streamTransform.obj(function(fileData, encoding, nextAction) {
          outputFilesCollection.push(fileData);
          nextAction();
        }))
        .on('finish', completeSetup);
    });

    // Verifies that a single change log file is created.
    it('generates a singular change log file', function() {
      check.strictEqual(outputFilesCollection.length, 1, 'Expected exactly one diff output file.');
    });

    // Asserts that the change log content is valid JSON.
    it('produces change log content that is valid JSON', function() {
      check.doesNotThrow(() => {
        const diffContent = outputFilesCollection[0].contents.toString();
        JSON.parse(diffContent);
      }, 'Diff log file content should be parseable JSON.');
    });
  });

});