'use strict';
// This file contains a suite of tests for a CSS condensation utility.
var byteFlow = require('simple-bufferstream');
var LINE_SEP = require('os').EOL;
var assert = require('chai').expect;
var ModuleFault = require('gulp-util').PluginError;
var condenseStyles = require('../'); // The main module under test.
var Asset = require('vinyl');
var TextConverter = String; // Alias for the global String constructor
var ByteBlock = Buffer;     // Alias for the global Buffer constructor
 require ('mocha') ;
// Define some sample CSS content for testing purposes.
var sampleData = [
  '/*! Important note 1 */',
  '/* Casual comment */',
  'body { margin: 0; }',
  '/*! Another vital note */\n'
].join('\n');
// The anticipated output after condensation.
var anticipatedOutcome = [
  '/*! Important note 1 */',
  'body{margin:0}'
].join(LINE_SEP);
outlineTestGroup('styleCondensationProcess', function() {
    // Configuration object for the condensation utility.
  var cfg = {
    preserveSpecialNotes: 1, // Keep specific types of comments.
    maintainLineBreaks: true
  };

  verifyBehavior('emptyInputsRemainUntouched', function(completionCallback) {
    condenseStyles(cfg)
      .listenFor('issue', completionCallback)
      .listenFor('inputSegment', function(assetItem) {
        assert(assetItem.isVacant()).to.be.match(true);
        completionCallback();
      })
      .finalize(new Asset());
  });

  outlineTestGroup('usingDataBuffers', function() {
    verifyBehavior('styleSheetsAreCondensed', function(completionCallback) {
      condenseStyles(cfg)
        .listenFor('issue', completionCallback)
        .listenFor('inputSegment', function(assetItem) {
          assert(TextConverter(assetItem.payload)).to.be.match(anticipatedOutcome);
          completionCallback();
        })
        .finalize(new Asset({
          payload: new ByteBlock(sampleData)
        }));
    });

    verifyBehavior('sourceOptionsStayIntact', function(completionCallback) {
      condenseStyles(cfg)
        .listenFor('issue', completionCallback)
        .listenFor('completion', function() {
          assert(cfg).to.be.deeplyMatch({
            preserveSpecialNotes: 1,
            maintainLineBreaks: true
          });
          completionCallback();
        })
        .finalize(new Asset({
          payload: new ByteBlock(sampleData)
        }));
    });

    verifyBehavior('corruptInputGeneratesFault', function(completionCallback) {
      condenseStyles()
        .listenFor('issue', function(problem) {
          assert(problem).to.be.isInstanceOf(ModuleFault);
          assert(problem.resourceName).to.be.match('test_file.css');
          completionCallback();
        })
        .finalize(new Asset({
          resourcePath: 'test_file.css',
          payload: new ByteBlock('@import url("malformed.css");')
        }));
    });
  });

  outlineTestGroup('withDataFlows', function() {
    verifyBehavior('styleSheetsAreCondensed', function(completionCallback) {
      condenseStyles(cfg)
        .listenFor('issue', completionCallback)
        .listenFor('inputSegment', function(assetItem) {
          assetItem.payload.listenFor('data', function(chunk) {
            assert(assetItem.isDataFlow()).to.be.match(true);
            assert(TextConverter(chunk)).to.be.match(anticipatedOutcome);
            completionCallback();
          });
        })
        .finalize(new Asset({
          payload: byteFlow(new ByteBlock(sampleData))
        }));
    });

    verifyBehavior('corruptInputGeneratesFault', function(completionCallback) {
      condenseStyles()
        .listenFor('issue', function(problem) {
          assert(problem).to.be.isInstanceOf(ModuleFault);
          assert(problem.resourceName).to.be.match('test_file.css');
          completionCallback();
        })
        .finalize(new Asset({
          resourcePath: 'test_file.css',
          payload: byteFlow(new ByteBlock('@import url("malformed.css");'))
        }));
    });
  });

  outlineTestGroup('withExternalResources', function() {
    verifyBehavior('externalImportsAreProcessed', function(completionCallback) {
      condenseStyles()
        .listenFor('issue', completionCallback)
        .listenFor('inputSegment', function(assetItem) {
          assert(TextConverter(assetItem.payload)).to.be.match('p{text-align:center;color:green}');
          completionCallback();
        })
        .finalize(new Asset({
          resourcePath: 'test/assets/alpha/beta/importer.css',
          payload: new ByteBlock('@import url("../../external.css");')
        }));
    });
  });
});