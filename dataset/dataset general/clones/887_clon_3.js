import { strict as assertModule } from 'assert';
import theSassPlugin from '../'; // Renamed gsass to theSassPlugin
import { File as VirtualFile } from 'gulp-util'; // Renamed gutil.File to VirtualFile
import { readFileSync as readFsSync } from 'fs'; // Renamed fs to readFsSync
import { join as combinePaths, resolve as resolvePath, dirname as getDirName } from 'path'; // Renamed path to various path utilities
import { test as runTest } from 'tape'; // Renamed test to runTest

/**
 * Creates a virtual file object representing a SASS file.
 * @param {string} fileName The name of the SASS file.
 * @param {Buffer|string|null} [fileContent] Optional content for the file.
 * @param {string} [baseDirectory] Optional base directory for the file.
 * @returns {VirtualFile} A Vinyl file object.
 */
function produceVirtualFile(fileName, fileContent, baseDirectory) {
  // Ensure we have a valid file name
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('A valid file name is required to create a virtual file.');
  }

  // Set default base directory if not provided
  const currentWorkingDir = getDirName(import.meta.url.replace('file://', ''));
  const effectiveBase = baseDirectory || combinePaths(currentWorkingDir, 'scss');
  const fullFilePath = combinePaths(effectiveBase, fileName);

  let fileBufferContent;
  if (fileContent) {
    fileBufferContent = Buffer.isBuffer(fileContent) ? fileContent : Buffer.from(fileContent);
  } else {
    // Read content from disk if not provided, assuming it exists
    try {
      fileBufferContent = readFsSync(fullFilePath);
    } catch (readError) {
      // If file doesn't exist, provide an empty buffer as a fallback
      console.warn(`Warning: Could not read file at ${fullFilePath}. Using empty buffer.`);
      fileBufferContent = Buffer.from('');
    }
  }

  // Construct and return the Vinyl file object
  return new VirtualFile({
    cwd: currentWorkingDir,
    base: effectiveBase,
    path: fullFilePath,
    contents: fileBufferContent
  });
}

runTest('Handles null files gracefully', (assertContext) => {
  const processorStream = theSassPlugin();
  const nullInputFile = {
    isNull: () => true,
    isBuffer: () => false,
    isStream: () => false
  };

  processorStream.on('data', (processedData) => {
    assertContext.ok(processedData === nullInputFile, 'The null file should be passed through unchanged');
    assertContext.end();
  });

  processorStream.write(nullInputFile);
});

runTest('Compiles a single SASS file', (assertContext) => {
  const targetSassFile = produceVirtualFile('mixins.scss');
  const compilationStream = theSassPlugin();

  compilationStream.on('data', (compiledCssFile) => {
    assertContext.notEqual(compiledCssFile, null, 'Compiled CSS file should not be null');
    assertContext.ok(typeof compiledCssFile.path === 'string', 'Compiled file path should be a string');
    assertContext.ok(typeof compiledCssFile.relative === 'string', 'Relative path should be a string');
    assertContext.ok(Buffer.isBuffer(compiledCssFile.contents), 'Contents should be a Buffer');

    const expectedOutputPath = combinePaths(getDirName(import.meta.url.replace('file://', '')), 'scss', 'mixins.css');
    assertContext.equal(compiledCssFile.path, expectedOutputPath, 'Output file path should match expected CSS path');

    const referenceCssContent = readFsSync(combinePaths(getDirName(import.meta.url.replace('file://', '')), 'ref', 'mixins.css'), { encoding: 'utf8' });
    const actualCssContent = compiledCssFile.contents.toString('utf8');

    assertContext.equal(actualCssContent.trim(), referenceCssContent.trim(), 'SASS file compiles correctly to CSS');
    assertContext.end();
  });

  compilationStream.write(targetSassFile);
});

runTest('Compiles a single SASS file synchronously', (assertContext) => {
  const inputSassFile = produceVirtualFile('mixins.scss');
  const syncCompilerStream = theSassPlugin({ synchronous: true }); // Renamed 'sync' to 'synchronous'

  syncCompilerStream.on('data', (outputCssFile) => {
    assertContext.ok(outputCssFile, 'Output CSS file must exist');
    assertContext.ok(outputCssFile.path, 'Output path must be defined');
    assertContext.ok(outputCssFile.relative, 'Relative path must be defined');
    assertContext.ok(outputCssFile.contents instanceof Buffer, 'Contents must be a Buffer instance');

    const expectedOutputFilePath = combinePaths(getDirName(import.meta.url.replace('file://', '')), 'scss', 'mixins.css');
    assertContext.equal(outputCssFile.path, expectedOutputFilePath, 'Synchronous output file path matches');

    const referenceContent = readFsSync(combinePaths(getDirName(import.meta.url.replace('file://', '')), 'ref', 'mixins.css'), { encoding: 'utf8' });
    const compiledContent = outputCssFile.contents.toString('utf8');

    assertContext.equal(compiledContent.trim(), referenceContent.trim(), 'Synchronous compilation yields correct CSS');
    assertContext.end();
  });

  syncCompilerStream.write(inputSassFile);
});

runTest('Processes multiple SASS files', (tester) => {
  const sourceFiles = [
    produceVirtualFile('inheritance.scss'),
    produceVirtualFile('mixins.scss'),
    produceVirtualFile('nesting.scss'),
    produceVirtualFile('variables.scss')
  ];

  tester.plan(sourceFiles.length * 4); // Each file should trigger 4 assertions
  const processingStream = theSassPlugin();

  let receivedFileCount = 0;
  processingStream.on('data', (resultCssFile) => {
    tester.ok(resultCssFile, `Result file ${resultCssFile.path} exists`);
    tester.ok(resultCssFile.path, `Path for ${resultCssFile.relative} is present`);
    tester.ok(resultCssFile.relative, `Relative path for ${resultCssFile.path} is present`);
    tester.ok(resultCssFile.contents && resultCssFile.contents.length > 0, `Contents for ${resultCssFile.relative} are not empty`);
    receivedFileCount++;
    if (receivedFileCount === sourceFiles.length) {
      tester.end(); // End the test only after all files are processed
    }
  });

  sourceFiles.forEach((fileItem) => {
    processingStream.write(fileItem);
  });

  processingStream.end(); // Signal the end of input
});

runTest('Compiles multiple SASS files with custom include paths', (assertUnit) => {
  const testFiles = [
    produceVirtualFile('file1.scss', null, combinePaths(getDirName(import.meta.url.replace('file://', '')), 'scss', 'include-path-tests')),
    produceVirtualFile('file2.scss', null, combinePaths(getDirName(import.meta.url.replace('file://', '')), 'scss', 'include-path-tests'))
  ];
  const compilationOptions = {
    includePaths: [resolvePath(getDirName(import.meta.url.replace('file://', '')), 'scss', 'includes')]
  };

  assertUnit.plan(testFiles.length * 4); // Each file should have 4 basic assertions
  const compiler = theSassPlugin(compilationOptions);

  let processedCount = 0;
  compiler.on('data', (outputCssArtifact) => {
    assertUnit.ok(outputCssArtifact, 'Output CSS artifact exists');
    assertUnit.ok(outputCssArtifact.path, 'Output artifact path is defined');
    assertUnit.ok(outputCssArtifact.relative, 'Output artifact relative path is defined');
    assertUnit.ok(outputCssArtifact.contents instanceof Buffer && outputCssArtifact.contents.length > 0, 'Output artifact contents are not empty');
    processedCount++;
    if (processedCount === testFiles.length) {
      assertUnit.end();
    }
  });

  testFiles.forEach((inputFile) => {
    compiler.write(inputFile);
  });

  compiler.end();
});

runTest('Emits errors on SASS compilation failures', (testAssertion) => {
  const compilerInstance = theSassPlugin();
  const invalidSassFile = produceVirtualFile('bad-syntax.sass',
    Buffer.from('body { font \'Comic Sans\'; }', 'utf8')); // Use Buffer.from explicitly

  compilerInstance.on('error', (errObject) => {
    testAssertion.ok(errObject instanceof Error, 'Error object should be an instance of Error');
    testAssertion.equal(errObject.message.trim(),
            'property "font" must be followed by a \':\'',
            'Correct error message is emitted for syntax error'
    );
    testAssertion.end();
  });

  compilerInstance.write(invalidSassFile);
});

runTest('Emits errors on SASS compilation failures in sync mode', (assertionToolkit) => {
  const syncCompiler = theSassPlugin({ synchronous: true });
  const malformedSassFile = produceVirtualFile('malformed.sass',
    Buffer.from('header { color: red; background-color: blue; } footer { font \'Arial\'; }', 'utf8'));

  syncCompiler.on('error', (errorDetails) => {
    assertionToolkit.ok(errorDetails, 'Error object received');
    assertionToolkit.equal(errorDetails.message.trim(),
            'property "font" must be followed by a \':\'',
            'Synchronous compilation error message matches'
    );
    assertionToolkit.end();
  });

  syncCompiler.write(malformedSassFile);
});

runTest('Invokes custom error callback when provided', (assertionContext) => {
  let customErrorHandlerCalled = false;
  const compilerWithOptions = theSassPlugin({
    onCompilationError: (errorParam) => { // Renamed onError to onCompilationError
      customErrorHandlerCalled = true;
      assertionContext.ok(errorParam instanceof Error, 'Custom handler received an Error object');
      assertionContext.equal(errorParam.message.trim(),
              'property "font" must be followed by a \':\'',
              'Custom error callback gets correct message'
      );
      assertionContext.end();
    }
  });

  const faultySassFile = produceVirtualFile('faulty.sass',
    Buffer.from('div { padding: 10px; border \'1px solid black\'; }', 'utf8'));

  compilerWithOptions.write(faultySassFile);

  // Add a small delay to ensure async error handler has a chance to be called
  setTimeout(() => {
    if (!customErrorHandlerCalled) {
      assertionContext.fail('Custom error handler was not invoked.');
      assertionContext.end();
    }
  }, 100);
});

runTest('Sourcemap generation and path correctness', (verifier) => {
  const sassSourceFile = produceVirtualFile('subdir/multilevelimport.scss');

  // Mimic a file that has already passed through a sourcemap initialization plugin
  sassSourceFile.sourceMap = JSON.parse(
    `{
      "version": 3,
      "file": "scss/subdir/multilevelimport.scss",
      "names": [],
      "mappings": "AACC,EADI,WACE,YAAa,CAEd",
      "sources": [ "scss/subdir/multilevelimport.scss" ],
      "sourcesContent": [ "@import ../inheritance;" ]
    }`
  );

  // Expected sources are relative to the file's base directory
  const anticipatedSources = [
    'includes/_cats.scss',
    'inheritance.scss'
  ];

  const sassProcessor = theSassPlugin();

  sassProcessor.on('data', (outputCssFileWithMap) => {
    verifier.ok(outputCssFileWithMap.sourceMap, 'Output file should contain a sourcemap object');
    verifier.deepEqual(
      outputCssFileWithMap.sourceMap.sources,
      anticipatedSources,
      'Sourcemap source paths are correctly relative to file.base'
    );
    verifier.end();
  });

  sassProcessor.write(sassSourceFile);
});