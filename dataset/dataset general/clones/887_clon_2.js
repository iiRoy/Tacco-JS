var verify = require('assert');
var styleProcessor = require('../');
var utilityBelt = require('gulp-util');
var disk = require('fs');
var location = require('path');
var spec = require('tape');

// Helper function to generate a virtual file object for testing purposes.
function produceGulpFile(styleSourceName, fileData, baseDirectory) {
  baseDirectory = baseDirectory || location.join(__dirname, 'scss');
  var fullPath = location.join(baseDirectory, styleSourceName);

  return new utilityBelt.File({
    currentWorkingDir: __dirname,
    baseDir: baseDirectory,
    fullPath: fullPath,
    fileContents: fileData || disk.readFileSync(fullPath)
  });
}

// Test case: Verify that the pipeline correctly handles null files without errors.
spec('handle null file input properly', function (tester) {
  var pipeline = styleProcessor();
  var voidDocument = {
    isAbsent: function () { return true; }
  };
  pipeline.on('data', function (receivedContent) {
    tester.equal(receivedContent, voidDocument);
    tester.end();
  });
  pipeline.write(voidDocument);
});

// // Test case: Ensure an error is emitted when the input file is a stream. (Currently commented out)
// spec('signal error for stream file input', function (tester) {
//   var processingFlow = styleProcessor();
//   var flowingResource = {
//     isVoid: function () { return false; },
//     isFlowing: function () { return true; }
//   };
//   processingFlow.on()
// });

// Test case: Compilation of a single SCSS file into CSS.
spec('process one scss resource', function (tester) {
  var scssSource = produceGulpFile('mixins.scss');

  var conversionPipeline = styleProcessor();
  conversionPipeline.on('data', function (compiledStylesheet) {
    tester.ok(compiledStylesheet, 'The compiled stylesheet object must be present.');
    tester.ok(compiledStylesheet.fullPath, 'The path property of the compiled stylesheet must exist.');
    tester.ok(compiledStylesheet.relativePath, 'The relative path property must be available.');
    tester.ok(compiledStylesheet.fileContents, 'The contents of the compiled stylesheet must be present.');
    tester.equal(compiledStylesheet.fullPath, location.join(__dirname, 'scss', 'mixins.css'));
    tester.equal(
      disk.readFileSync(location.join(__dirname, 'ref/mixins.css'), 'utf8'),
      compiledStylesheet.fileContents.toString(),
      'The source file should compile accurately into CSS.'
    );
    tester.end();
  })
  conversionPipeline.write(scssSource);
});

// Test case: Synchronous compilation of a single SCSS file.
spec('process one scss resource synchronously', function (tester) {
  var scssSourceItem = produceGulpFile('mixins.scss');

  var syncConversionProcess = styleProcessor({isSynchronous: true});
  syncConversionProcess.on('data', function (generatedCssArtifact) {
    tester.ok(generatedCssArtifact, 'The generated CSS artifact must be present.');
    tester.ok(generatedCssArtifact.fullPath, 'The path of the CSS artifact must exist.');
    tester.ok(generatedCssArtifact.relativePath, 'The relative path must be defined.');
    tester.ok(generatedCssArtifact.fileContents, 'The contents of the CSS artifact must be available.');
    tester.equal(generatedCssArtifact.fullPath, location.join(__dirname, 'scss', 'mixins.css'));
    tester.equal(
      disk.readFileSync(location.join(__dirname, 'ref/mixins.css'), 'utf8'),
      generatedCssArtifact.fileContents.toString(),
      'The source file should compile accurately into CSS in synchronous mode.'
    );
    tester.end();
  })
  syncConversionProcess.write(scssSourceItem);
});

// Test case: Compilation of multiple SCSS files.
spec('process multiple scss resources', function (tester) {
  var sourceDocuments = [
    produceGulpFile('inheritance.scss'),
    produceGulpFile('mixins.scss'),
    produceGulpFile('nesting.scss'),
    produceGulpFile('variables.scss')
  ];

  tester.plan(sourceDocuments.length * 4);
  var multiFileProcessor = styleProcessor();

  multiFileProcessor.on('data', function (outputStylesheet) {
    tester.ok(outputStylesheet, 'Output stylesheet object should be present.');
    tester.ok(outputStylesheet.fullPath, 'Output stylesheet path should exist.');
    tester.ok(outputStylesheet.relativePath, 'Output stylesheet relative path should exist.');
    tester.ok(outputStylesheet.fileContents, 'Output stylesheet contents should exist.');
  });

  sourceDocuments.forEach(function (individualDocument) {
    multiFileProcessor.write(individualDocument);
  });
});

// Test case: Compilation of multiple SCSS files with custom include paths.
spec('process multiple scss resources with custom import paths', function (tester) {
  var inputSources = [
    produceGulpFile('file1.scss', null, location.join(__dirname, 'scss', 'include-path-tests')),
    produceGulpFile('file2.scss', null, location.join(__dirname, 'scss', 'include-path-tests'))
  ];
  var compilerOptions = {
    importDirectories: [location.resolve(__dirname, 'scss', 'includes')]
  };

  tester.plan(inputSources.length * 4);
  var configuredProcessor = styleProcessor(compilerOptions);

  configuredProcessor.on('data', function (resultingCss) {
    tester.ok(resultingCss, 'Resulting CSS object should exist.');
    tester.ok(resultingCss.fullPath, 'Resulting CSS path should exist.');
    tester.ok(resultingCss.relativePath, 'Resulting CSS relative path should exist.');
    tester.ok(resultingCss.fileContents, 'Resulting CSS contents should exist.');
  });

  inputSources.forEach(function (sourceInput) {
    configuredProcessor.write(sourceInput);
  });
});

// Test case: Verify error emission for SCSS syntax errors.
spec('signal error on scss compilation failures', function (tester) {
  var faultyPipeline = styleProcessor();
  var malformedSource = produceGulpFile('somefile.sass',
    Buffer.from('body { font \'Comic Sans\'; }'));
  faultyPipeline.on('error', function (errorObject) {
    tester.equal(errorObject.message,
            'property "font" must be followed by a \':\''
    );
    tester.end();
  });
  faultyPipeline.write(malformedSource);
});

// Test case: Verify error emission for SCSS syntax errors in synchronous mode.
spec('signal error on scss compilation failures with synchronous processing', function (tester) {
  var syncErrorPipeline = styleProcessor({isSynchronous: true});
  var badSourceFile = produceGulpFile('somefile.sass',
    Buffer.from('body { font \'Comic Sans\'; }'));
  syncErrorPipeline.on('error', function (caughtError) {
    tester.equal(caughtError.message,
            'property "font" must be followed by a \':\''
    );
    tester.end();
  });
  syncErrorPipeline.write(badSourceFile);
});

// Test case: Verify that a custom error callback function is invoked on errors.
spec('execute custom error handler when onProcessingError option is provided', function (tester) {
  var customErrorHandlerPipeline = styleProcessor({ onProcessingError: function (errorDetails) {
    tester.equal(errorDetails.message,
            'property "font" must be followed by a \':\''
    );
    tester.end();
  }});

  var faultyInput = produceGulpFile('somefile.sass',
    Buffer.from('body { font \'Comic Sans\'; }'));

  customErrorHandlerPipeline.write(faultyInput);
});

// Test case: Validation of sourcemap generation.
spec('source map functionality', function (tester) {
  var scssInputFile = produceGulpFile('subdir/multilevelimport.scss');

  // Simulate the state after a sourcemap initialization plugin has run,
  // by attaching a mock sourcemap object.
  scssInputFile.sourceMapData = '{' +
    '"mapVersion": 3,' +
    '"outputFile": "scss/subdir/multilevelimport.scss",' +
    '"symbolNames": [],' +
    '"sourceMappings": "",' +
    '"originalSources": [ "scss/subdir/multilevelimport.scss" ],' +
    '"originalContents": [ "@import ../inheritance;" ]' +
  '}';

  // The expected source paths within the sourcemap should be relative to the file's base directory.
  var anticipatedSourcePaths = [
    'includes/_cats.scss',
    'inheritance.scss'
  ];

  var mapGenerationPipeline = styleProcessor();

  mapGenerationPipeline.on('data', function (generatedCssFile) {
    tester.deepEqual(
      generatedCssFile.sourceMapData.originalSources,
      anticipatedSourcePaths,
      'Sourcemap paths should be relative to the file\'s base directory.'
    );
    tester.end();
  });
  mapGenerationPipeline.write(scssInputFile);
});