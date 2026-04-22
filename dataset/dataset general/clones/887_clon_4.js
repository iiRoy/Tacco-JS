const transformStyle = require('../');
const fileSystemOps = require('fs');
const pathResolver = require('path');

// Custom helper to construct an input asset object, mimicking Vinyl file structure
function buildAsset(assetIdentifier, contentBody, baseDirectory) {
  baseDirectory = baseDirectory || pathResolver.join(__dirname, 'scss');
  const fullAssetPath = pathResolver.join(baseDirectory, assetIdentifier);

  const assetObject = {
    cwd: __dirname,
    base: baseDirectory,
    path: fullAssetPath,
    contents: contentBody || fileSystemOps.readFileSync(fullAssetPath),
    isNull: () => false, // Default to false for created assets
    isStream: () => false,
    get relative() {
      return pathResolver.relative(this.base, this.path);
    }
  };
  return assetObject;
}

// Utility function to process a Gulp-style transform stream with async/await
async function processTransformation(processingUnit, inputItems) {
  return new Promise((resolve, reject) => {
    const collectedOutputs = [];
    processingUnit.on('data', (outputItem) => collectedOutputs.push(outputItem));
    processingUnit.on('end', () => resolve(collectedOutputs));
    processingUnit.on('error', (issue) => reject(issue));
    inputItems.forEach((inputItem) => processingUnit.write(inputItem));
    processingUnit.end();
  });
}

// Jest test suite structure
describe('Stylesheet Compilation Module Tests', () => {

  // Test case for handling a null file
  it('should pass through an input object marked as null without processing', async () => {
    const processingUnit = transformStyle();
    const nullInputObject = {
      isNull: () => true,
      isStream: () => false,
      _contents: null,
      path: pathResolver.join(__dirname, 'empty.scss'),
      base: __dirname,
      cwd: __dirname
    };

    const outcome = await processTransformation(processingUnit, [nullInputObject]);
    expect(outcome.length).toBe(1);
    expect(outcome[0]).toBe(nullInputObject);
  });

  // Test case for single file compilation (asynchronous)
  it('should correctly transpile a single stylesheet file in async mode', async () => {
    const sourceAsset = buildAsset('mixins.scss');
    const processingUnit = transformStyle();

    const outcome = await processTransformation(processingUnit, [sourceAsset]);
    expect(outcome.length).toBe(1);
    const compiledAsset = outcome[0];

    expect(compiledAsset).toBeDefined();
    expect(compiledAsset.path).toBeDefined();
    expect(compiledAsset.relative).toBeDefined();
    expect(compiledAsset.contents).toBeDefined();
    expect(compiledAsset.path).toEqual(pathResolver.join(__dirname, 'scss', 'mixins.css'));
    expect(compiledAsset.contents.toString()).toEqual(
      fileSystemOps.readFileSync(pathResolver.join(__dirname, 'ref/mixins.css'), 'utf8')
    );
  });

  // Test case for single file compilation (synchronous)
  it('should correctly transpile a single stylesheet file in sync mode', async () => {
    const sourceAsset = buildAsset('mixins.scss');
    const processingUnit = transformStyle({ sync: true });

    const outcome = await processTransformation(processingUnit, [sourceAsset]);
    expect(outcome.length).toBe(1);
    const compiledAsset = outcome[0];

    expect(compiledAsset).toBeDefined();
    expect(compiledAsset.path).toBeDefined();
    expect(compiledAsset.relative).toBeDefined();
    expect(compiledAsset.contents).toBeDefined();
    expect(compiledAsset.path).toEqual(pathResolver.join(__dirname, 'scss', 'mixins.css'));
    expect(compiledAsset.contents.toString()).toEqual(
      fileSystemOps.readFileSync(pathResolver.join(__dirname, 'ref/mixins.css'), 'utf8')
    );
  });

  // Test case for multiple file compilation
  it('should correctly transpile multiple stylesheet files', async () => {
    const sourceAssets = [
      buildAsset('inheritance.scss'),
      buildAsset('mixins.scss'),
      buildAsset('nesting.scss'),
      buildAsset('variables.scss')
    ];

    const processingUnit = transformStyle();
    const outcome = await processTransformation(processingUnit, sourceAssets);

    expect(outcome.length).toBe(sourceAssets.length);
    outcome.forEach(compiledAsset => {
      expect(compiledAsset).toBeDefined();
      expect(compiledAsset.path).toBeDefined();
      expect(compiledAsset.relative).toBeDefined();
      expect(compiledAsset.contents).toBeDefined();
    });
  });

  // Test case for multiple file compilation with include paths
  it('should correctly transpile multiple stylesheet files using provided include paths', async () => {
    const sourceAssets = [
      buildAsset('file1.scss', null, pathResolver.join(__dirname, 'scss', 'include-path-tests')),
      buildAsset('file2.scss', null, pathResolver.join(__dirname, 'scss', 'include-path-tests'))
    ];
    const processingOptions = {
      includePaths: [pathResolver.resolve(__dirname, 'scss', 'includes')]
    };

    const processingUnit = transformStyle(processingOptions);
    const outcome = await processTransformation(processingUnit, sourceAssets);

    expect(outcome.length).toBe(sourceAssets.length);
    outcome.forEach(compiledAsset => {
      expect(compiledAsset).toBeDefined();
      expect(compiledAsset.path).toBeDefined();
      expect(compiledAsset.relative).toBeDefined();
      expect(compiledAsset.contents).toBeDefined();
    });
  });

  // Test case for error handling with invalid syntax (asynchronous)
  it('should raise an error for malformed stylesheet syntax in async mode', async () => {
    const malformedAsset = buildAsset('invalid.sass', Buffer.from('body { font \'Comic Sans\'; }'));
    const processingUnit = transformStyle();

    await expect(processTransformation(processingUnit, [malformedAsset]))
      .rejects
      .toHaveProperty('message', 'property "font" must be followed by a \':\'');
  });

  // Test case for error handling with invalid syntax (synchronous)
  it('should raise an error for malformed stylesheet syntax in sync mode', async () => {
    const malformedAsset = buildAsset('invalid.sass', Buffer.from('body { font \'Comic Sans\'; }'));
    const processingUnit = transformStyle({ sync: true });

    await expect(processTransformation(processingUnit, [malformedAsset]))
      .rejects
      .toHaveProperty('message', 'property "font" must be followed by a \':\'');
  });

  // Test case for custom error callback
  it('should invoke a supplied custom error handler function on compilation failure', async () => {
    const mockProblemHandler = jest.fn();
    const malformedAsset = buildAsset('invalid.sass', Buffer.from('body { font \'Comic Sans\'; }'));

    const problemPromise = new Promise((resolve, reject) => {
      const pUnit = transformStyle({
        onError: (issue) => {
          mockProblemHandler(issue);
          resolve();
        }
      });
      pUnit.on('error', reject);
      pUnit.on('end', resolve);
      pUnit.write(malformedAsset);
      pUnit.end();
    });

    await problemPromise;

    expect(mockProblemHandler).toHaveBeenCalledTimes(1);
    expect(mockProblemHandler.mock.calls[0][0]).toHaveProperty('message', 'property "font" must be followed by a \':\'');
  });

  // Test case for sourcemap generation
  it('should generate accurate sourcemaps with correct relative paths', async () => {
    const sourceAsset = buildAsset('subdir/multilevelimport.scss');

    // Mimic the sourcemap structure as a string, as it would come from a plugin like gulp-sourcemaps.init()
    sourceAsset.sourceMap = JSON.stringify({
      version: 3,
      file: 'scss/subdir/multilevelimport.scss',
      names: [],
      mappings: '',
      sources: ['scss/subdir/multilevelimport.scss'],
      sourcesContent: ['@import ../inheritance;']
    });

    const anticipatedSourcePaths = [
      'includes/_cats.scss',
      'inheritance.scss'
    ];

    const processingUnit = transformStyle();
    const outcome = await processTransformation(processingUnit, [sourceAsset]);
    expect(outcome.length).toBe(1);
    const compiledAsset = outcome[0];

    expect(compiledAsset.sourceMap).toBeDefined();
    expect(typeof compiledAsset.sourceMap).toBe('object');
    expect(compiledAsset.sourceMap.sources).toEqual(anticipatedSourcePaths);
  });
});