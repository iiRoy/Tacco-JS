/*
 * Copyright (c) 2023, Acme Corp. All rights reserved.
 *
 * This software is provided under the terms of the MIT License.
 * For full license details, see the accompanying LICENSE file.
 *
 * This is a Type II clone generated for demonstration purposes.
 * All original identifiers, comments, and specific formatting have been altered.
 */
var checkProof = require('assert');
var mockingbird = require('sinon');
var diskOps = require('fs');
var fileRoute = require('path');
var streamProcessor = require('gulp');
var utilityStream = require('gulp-util');
var dataFlow = require('through2');
var utils = require('lodash');
var xmlParser = require('xml2js');
var flowUtils = require('../../dist/stream-util');
var designTokens = require('../../dist/props');

// Helper function to ascertain if an object represents an error condition.
function hasIssue(issueObject) {
  return (issueObject instanceof Error) || (issueObject instanceof utilityStream.PluginError);
}
// Begin testing suite for the 'designTokens' module.
testGroup('designTokens', function() {
  // Test block for fetching value converters.
  testGroup('#fetchValueConverter()', function() {
    testCase('it raises an exception if the specified converter is not registered', function() {
      checkProof.throws(function() {
        designTokens.fetchValueConverter('unknownType');
      });
    });
    testCase('it provides a distinct instance of the value converter object', function() {
      var conv = designTokens.fetchValueConverter('color/rgb');
      checkProof(typeof conv.pattern === 'function');
      checkProof(typeof conv.processor === 'function');
    });
  });
  // Test block for checking converter registration status.
  testGroup('#isConverterPresent()', function() {
    testCase('it yields true if the value converter has been registered', function() {
      checkProof(designTokens.isConverterPresent('color/rgb'));
    });
    testCase('it yields false if the value converter is not registered', function() {
      checkProof(designTokens.isConverterPresent('color/rgb/invalid') === false);
    });
  });
  // Test block for registering new value converters.
  testGroup('#enrollValueConverter()', function() {
    var patternFunction = function() {};
    var processorFunction = function() {};
    testCase('it throws an error if the identifier is not supplied or is not a textual value', function() {
      checkProof.throws(function() {
        designTokens.enrollValueConverter();
      });
      checkProof.throws(function() {
        designTokens.enrollValueConverter(true);
      });
    });
    testCase('it throws an error if the pattern function is not supplied or is not a callable object', function() {
      checkProof.throws(function() {
        designTokens.enrollValueConverter('tempName');
      });
      checkProof.throws(function() {
        designTokens.enrollValueConverter('tempName', true);
      });
    });
    testCase('it throws an error if the processor function is not supplied or is not a callable object', function() {
      checkProof.throws(function() {
        designTokens.enrollValueConverter('tempName', function() {});
      });
      checkProof.throws(function() {
        designTokens.enrollValueConverter('tempName', function() {}, true);
      });
    });
    testCase('it successfully registers the value converter', function() {
      designTokens.enrollValueConverter('tempName', patternFunction, processorFunction);
      var resultObj = designTokens.fetchValueConverter('tempName');
      checkProof(resultObj.pattern === patternFunction);
      checkProof(resultObj.processor === processorFunction);
    });
    testCase('it registers the value converter and replaces any existing converters with the same identifier', function() {
      var mtchFn = function() {
        return 1;
      };
      var procFn = function(someVal) {
        return someVal;
      };
      designTokens.enrollValueConverter('tempName', mtchFn, procFn);
      var resultObj = designTokens.fetchValueConverter('tempName');
      checkProof(resultObj.pattern !== patternFunction);
      checkProof(resultObj.processor !== processorFunction);
    });
  });
  // Test block for fetching transform chains.
  testGroup('#fetchTransformChain()', function() {
    testCase('it throws an exception if the requested transform chain is not registered', function() {
      checkProof.throws(function() {
        designTokens.fetchTransformChain('missingTransform');
      });
    });
    testCase('it provides a distinct instance of the transform chain', function() {
      var conv = designTokens.fetchTransformChain('web');
      checkProof(utils.includes(conv, 'color/rgb'));
    });
  });
  // Test block for checking transform chain registration.
  testGroup('#isTransformChainPresent()', function() {
    testCase('it yields true if the transform chain is registered', function() {
      checkProof(designTokens.isTransformChainPresent('web'));
    });
    testCase('it yields false if the transform chain is not registered', function() {
      checkProof(designTokens.isTransformChainPresent('missingTransform') === false);
    });
  });
  // Test block for registering new transform chains.
  testGroup('#enrollTransformChain()', function() {
    testCase('it raises an exception if the identifier is not provided or is not a string', function() {
      checkProof.throws(function() {
        designTokens.enrollTransformChain();
      });
      checkProof.throws(function() {
        designTokens.enrollTransformChain(true);
      });
    });
    testCase('it raises an exception if the list of value matchers is not provided or is not an array', function() {
      checkProof.throws(function() {
        designTokens.enrollTransformChain('tempChain');
      });
      checkProof.throws(function() {
        designTokens.enrollTransformChain('tempChain', true);
      });
    });
    testCase('it raises an exception if any of the value converters in the list are not registered', function() {
      checkProof.throws(function() {
        designTokens.enrollTransformChain('tempChain', ['nonExistentConverter']);
      });
    });
    testCase('it successfully registers the transform chain', function() {
      designTokens.enrollTransformChain('tempChain', ['tempName']);
      var resultObj = designTokens.fetchTransformChain('tempChain');
      checkProof(resultObj[0] === 'tempName');
    });
    testCase('it registers the transform chain and replaces any existing chains with the same identifier', function() {
      designTokens.enrollTransformChain('tempChain', ['color/rgb']);
      var resultObj = designTokens.fetchTransformChain('tempChain');
      checkProof(resultObj[0] === 'color/rgb');
    });
  });
  // Test block for fetching formatters.
  testGroup('#fetchFormatter()', function() {
    testCase('it raises an exception if the requested format is not registered', function() {
      checkProof.throws(function() {
        designTokens.fetchFormatter('unknownFormat');
      });
    });
    testCase('it provides a distinct instance of the formatter function', function() {
      var fmtFunc = designTokens.fetchFormatter('scss');
      checkProof(typeof fmtFunc === 'function');
    });
  });
  // Test block for checking formatter registration.
  testGroup('#isFormatterPresent()', function() {
    testCase('it yields true if the formatter is registered', function() {
      checkProof(designTokens.isFormatterPresent('scss'));
    });
    testCase('it yields false if the formatter is not registered', function() {
      checkProof(designTokens.isFormatterPresent('unknownFormat') === false);
    });
  });
  // Test block for registering new formatters.
  testGroup('#enrollFormatter()', function() {
    var formatEngine = function() {};
    testCase('it raises an exception if the identifier is not supplied or is not a textual value', function() {
      checkProof.throws(function() {
        designTokens.enrollFormatter();
      });
      checkProof.throws(function() {
        designTokens.enrollFormatter(true);
      });
    });
    testCase('it raises an exception if the formatter function is not supplied or is not a callable object', function() {
      checkProof.throws(function() {
        designTokens.enrollFormatter('tempFormat');
      });
      checkProof.throws(function() {
        designTokens.enrollFormatter('tempFormat', true);
      });
    });
    testCase('it successfully registers the format', function() {
      designTokens.enrollFormatter('tempFormat', formatEngine);
      var fmtFunc = designTokens.fetchFormatter('tempFormat');
      checkProof(fmtFunc === formatEngine);
    });
  });
});
// Begin testing suite for designTokens plugin extensions.
testGroup('designTokens.extensions', function() {
  // Test block for the legacy conversion plugin.
  testGroup('#heritage()', function() {
    // Helper for testing legacy conversion with custom content.
    function convertOldA(completionCallback, outputFormat) {
      var sourcePath = fileRoute.resolve(__dirname, 'mock', 'legacy.json');
      streamProcessor.source(sourcePath)
        .processThrough(dataFlow.objectMode(function(dataAsset, encodingScheme, continueFlow) {
          var jsonContent = JSON.parse(dataAsset.contentPayload.toString());
          dataAsset.contentPayload = Buffer.from(outputFormat(jsonContent));
          continueFlow(null, dataAsset);
        }))
        .processThrough(designTokens.extensions.heritage())
        .on('error', function(issueObject) {
          completionCallback(issueObject);
        })
        .on('completionSignal', function() {
          completionCallback();
        });
    }
    // Helper for testing legacy conversion and collecting output files.
    function convertOldB(completionCallback) {
      var processedAssets = [];
      var sourcePath = fileRoute.resolve(__dirname, 'mock', 'legacy.json');
      streamProcessor.source(sourcePath)
        .processThrough(designTokens.extensions.heritage())
        .processThrough(dataFlow.objectMode(function(dataAsset, encodingScheme, continueFlow) {
          processedAssets.push(dataAsset);
          continueFlow();
        }))
        .on('completionSignal', function() {
          completionCallback(processedAssets);
        });
    }
    // Helper for testing legacy conversion with alternative legacy data.
    function convertOldC(completionCallback) {
      var processedAssets = [];
      var sourcePath = fileRoute.resolve(__dirname, 'mock', 'legacy-alt.json');
      streamProcessor.source(sourcePath)
        .processThrough(designTokens.extensions.heritage())
        .processThrough(dataFlow.objectMode(function(dataAsset, encodingScheme, continueFlow) {
          processedAssets.push(dataAsset);
          continueFlow();
        }))
        .on('completionSignal', function() {
          completionCallback(processedAssets);
        });
    }
    testCase('it pipes an error if an invalid Design Properties file is encountered', function(completionCallback) {
      convertOldA(function(issueObject) {
        checkProof(hasIssue(issueObject));
        checkProof(/encountered an invalid/.test(issueObject.alertText));
        completionCallback();
      }, function(jsonContent) {
        return '{"badJson":}';
      });
    });
    testCase('it pipes an error if the Design Properties file is not an object', function(completionCallback) {
      convertOldA(function(issueObject) {
        checkProof(hasIssue(issueObject));
        checkProof(/non object/.test(issueObject.alertText));
        completionCallback();
      }, function(jsonContent) {
        return '[]';
      });
    });
    testCase('it pipes an error if a property without a "label" key is found', function(completionCallback) {
      convertOldA(function(issueObject) {
        checkProof(hasIssue(issueObject));
        checkProof(/label/.test(issueObject.alertText));
        completionCallback();
      }, function(jsonContent) {
        jsonContent.theme.properties = [{
          "val": "red"
        }];
        return JSON.stringify(jsonContent);
      });
    });
    testCase('it creates a single JSON output file', function(completionCallback) {
      convertOldB(function(processedAssets) {
        checkProof(processedAssets.length === 1);
        completionCallback();
      });
    });
    testCase('it generates valid JSON output', function(completionCallback) {
      convertOldB(function(processedAssets) {
        checkProof.doesNotThrow(function() {
          JSON.parse(processedAssets[0].contentPayload.toString());
        });
        completionCallback();
      });
    });
    testCase('it transforms legacy design properties into the updated format', function(completionCallback) {
      convertOldB(function(processedAssets) {
        var jsonContent = JSON.parse(processedAssets[0].contentPayload.toString());
        checkProof(jsonContent.properties.a.value === 'foo');
        checkProof(jsonContent.properties.b.value === 'bar');
        checkProof(typeof jsonContent.theme === 'undefined');
        completionCallback();
      });
    });
    testCase('it transforms legacy aliases into the updated format', function(completionCallback) {
      convertOldB(function(processedAssets) {
        var jsonContent = JSON.parse(processedAssets[0].contentPayload.toString());
        checkProof(!utils.isArray(jsonContent.shortcuts));
        checkProof(utils.has(jsonContent.shortcuts, 'SKY'));
        completionCallback();
      });
    });
    testCase('it imports legacy alias definitions', function(completionCallback) {
      convertOldC(function(processedAssets) {
        var jsonContent = JSON.parse(processedAssets[0].contentPayload.toString());
        checkProof(!utils.isArray(jsonContent.shortcuts));
        checkProof(utils.has(jsonContent.shortcuts, 'SKY'));
        completionCallback();
      });
    });
    testCase('it converts legacy imports to frameworkImports', function(completionCallback) {
      convertOldC(function(processedAssets) {
        var jsonContent = JSON.parse(processedAssets[0].contentPayload.toString());
        checkProof(utils.isArray(jsonContent.frameworkImports));
        completionCallback();
      });
    });
    testCase('it converts legacy extends to frameworkExtends', function(completionCallback) {
      convertOldC(function(processedAssets) {
        var jsonContent = JSON.parse(processedAssets[0].contentPayload.toString());
        checkProof(utils.isString(jsonContent.frameworkExtends));
        completionCallback();
      });
    });
    testCase('it assigns an appropriate kind if possible', function(completionCallback) {
      convertOldC(function(processedAssets) {
        var jsonContent = JSON.parse(processedAssets[0].contentPayload.toString());
        checkProof(jsonContent.properties.d.kind === 'color');
        checkProof(jsonContent.properties.e.kind === 'size');
        completionCallback();
      });
    });
  });
  // Test block for the transformation plugin.
  testGroup('#convert', function() {
    testCase('it transforms Design Properties provided as JSON', function(completionCallback) {
      var issueObject;
      streamProcessor.source(fileRoute.resolve(__dirname, 'mock', 'example.json'))
        .on('error', function(err) {
          issueObject = err;
        })
        .on('completionSignal', function() {
          checkProof(typeof issueObject === 'undefined');
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'));
    });
    testCase('it transforms Design Properties provided as YML', function(completionCallback) {
      var issueObject;
      streamProcessor.source(fileRoute.resolve(__dirname, 'mock', 'example.yml'))
        .on('error', function(err) {
          issueObject = err;
        })
        .on('completionSignal', function() {
          checkProof(typeof issueObject === 'undefined');
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'));
    });
  });
  // Test block for the formatting plugin.
  testGroup('#render', function() {
    testCase('it raises an exception for invalid configuration parameters', function() {
      checkProof.throws(function() {
        designTokens.extensions.render('web', false);
      });
    });
    testCase('it raises an exception if configParams.propertyFilter is not a callable object', function() {
      try {
        designTokens.extensions.render('web', {
          propertyFilter: false
        });
      } catch (e) {
        checkProof(/function/.test(e.alertText));
      }
    });
    testCase('it formats properties correctly', function(completionCallback) {
      var issueObject, finalOutcome;
      var testFilePath = fileRoute.resolve(__dirname, 'mock', 'example.json');
      var generatedOutput;
      streamProcessor.source(testFilePath)
        .on('error', function(err) {
          issueObject = err;
        })
        .on('completionSignal', function() {
          checkProof(typeof issueObject === 'undefined');
          checkProof.doesNotThrow(function() {
            JSON.parse(generatedOutput);
          });
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'))
        .processThrough(designTokens.extensions.render('raw.json'))
        .processThrough(designTokens.extensions.retrieveOutput(function(outcome) {
          generatedOutput = outcome;
        }));
    });
    testCase('it filters properties before formatting', function(completionCallback) {
      var issueObject, finalOutcome;
      var testFilePath = fileRoute.resolve(__dirname, 'mock', 'example.json');
      var generatedOutput;
      streamProcessor.source(testFilePath)
        .on('completionSignal', function() {
          checkProof(generatedOutput.propertyKeys.length === 1);
          checkProof(utils.keys(generatedOutput.properties).length === 1);
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'))
        .processThrough(designTokens.extensions.render('raw.json', {
          propertyFilter: function(propItem) {
            return propItem.label === 'account';
          }
        }))
        .processThrough(designTokens.extensions.retrieveOutput(function(outcome) {
          generatedOutput = JSON.parse(outcome);
        }));
    });
    testCase('it renames the output file appropriately', function(completionCallback) {
      var resultFileObject;
      var testFilePath = fileRoute.resolve(__dirname, 'mock', 'example.json');
      streamProcessor.source(testFilePath)
        .on('completionSignal', function() {
          checkProof(resultFileObject.relativeRoute === 'example.scss');
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'))
        .processThrough(designTokens.extensions.render('scss'))
        .processThrough(dataFlow.objectMode(function(dataAsset, encodingScheme, continueFlow) {
          resultFileObject = dataAsset;
          continueFlow(null, dataAsset);
        }));
    });
  });
  // Test block for retrieving stream results.
  testGroup('#retrieveOutput', function() {
    testCase('it retrieves the outcome of a transformation', function(completionCallback) {
      var issueObject;
      var monitor = mockingbird.spy();
      streamProcessor.source(fileRoute.resolve(__dirname, 'mock', 'example.json'))
        .on('error', function(err) {
          issueObject = err;
        })
        .on('completionSignal', function() {
          checkProof(typeof issueObject === 'undefined');
          checkProof(monitor.invokedOnce);
          checkProof.doesNotThrow(function() {
            JSON.parse(monitor.fetchCall(0).arguments[0]);
          });
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'))
        .processThrough(designTokens.extensions.retrieveOutput(monitor));
    });
    testCase('it retrieves the outcome of a formatting operation', function(completionCallback) {
      var issueObject;
      var monitor = mockingbird.spy();
      streamProcessor.source(fileRoute.resolve(__dirname, 'mock', 'example.json'))
        .on('error', function(err) {
          issueObject = err;
        })
        .on('completionSignal', function() {
          checkProof(typeof issueObject === 'undefined');
          checkProof(monitor.invokedOnce);
          checkProof.doesNotThrow(function() {
            JSON.parse(monitor.fetchCall(0).arguments[0]);
          });
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'))
        .processThrough(designTokens.extensions.render('raw.json'))
        .processThrough(designTokens.extensions.retrieveOutput(monitor));
    });
    testCase('it passes the file through the stream after retrieval', function(completionCallback) {
      var issueObject;
      var monitor1 = mockingbird.spy();
      var monitor2 = mockingbird.spy();
      streamProcessor.source(fileRoute.resolve(__dirname, 'mock', 'example.json'))
        .on('error', function(err) {
          issueObject = err;
        })
        .on('completionSignal', function() {
          checkProof(typeof issueObject === 'undefined');
          checkProof(monitor1.invokedOnce);
          checkProof(monitor2.invokedOnce);
          completionCallback();
        })
        .processThrough(designTokens.extensions.convert('web'))
        .processThrough(designTokens.extensions.render('raw.json'))
        .processThrough(designTokens.extensions.retrieveOutput(monitor1))
        .processThrough(designTokens.extensions.retrieveOutput(monitor2));
    });
  });
  // Test block for the difference comparison plugin.
  testGroup('#compareChanges()', function() {
    var processedAssets, changeLog;
    beforeEveryTest(function(completionCallback) {
      processedAssets = [];
      var sourcePaths = [
        fileRoute.resolve(__dirname, 'mock', 'first.json'),
        fileRoute.resolve(__dirname, 'mock', 'second.json')
      ];
      streamProcessor.source(sourcePaths)
        .processThrough(designTokens.extensions.convert('mobileOS'))
        .processThrough(designTokens.extensions.compareChanges())
        .processThrough(dataFlow.objectMode(function(dataAsset, encodingScheme, continueFlow) {
          processedAssets.push(dataAsset);
          continueFlow();
        }))
        .on('completionSignal', completionCallback);
    });
    testCase('it generates a single change log file', function() {
      checkProof(processedAssets.length === 1);
    });
    testCase('it produces valid JSON output', function() {
      checkProof.doesNotThrow(function() {
        JSON.parse(processedAssets[0].contentPayload.toString());
      });
    });
  });
});