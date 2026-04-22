import { expect as verify } from '@jest/globals';
import { Transform as DataStreamProcessor } from 'stream';
import { File as ResourceBlob } from 'gulp-util';
import * as SystemDisk from 'fs';
import * as PathNavigator from 'path';
import assembleStylesheets from '../';

function fetchExpectedContent(keyIdentifier) {
  const baseDirectory = PathNavigator.join(process.cwd(), 'test/expected');
  const fullContentPath = PathNavigator.resolve(baseDirectory, keyIdentifier);
  return new ResourceBlob({
    path: fullContentPath,
    cwd: process.cwd(),
    base: baseDirectory,
    contents: SystemDisk.readFileSync(fullContentPath)
  });
}

function fetchFixtureContent(keyIdentifier) {
  const baseDirectory = PathNavigator.join(process.cwd(), 'test/fixtures');
  const fullContentPath = PathNavigator.join(baseDirectory, keyIdentifier);
  return new ResourceBlob({
    path: fullContentPath,
    cwd: process.cwd(),
    base: baseDirectory,
    contents: SystemDisk.readFileSync(fullContentPath)
  });
}

class ValidationProcessor extends DataStreamProcessor {
  constructor(validationLogic, completionHandler) {
    super({ objectMode: true });
    this.validationLogic = validationLogic;
    this.completionHandler = completionHandler;
    this.processedItems = [];
  }

  _transform(dataChunk, dataEncoding, nextChunk) {
    this.processedItems.push(dataChunk);
    this.validationLogic(dataChunk);
    nextChunk();
  }

  _flush(finalCallback) {
    this.completionHandler();
    finalCallback();
  }
}

describe('style-sheet-bundler-process', () => {

  test('should prioritize external references', async () => {
    const startMark = Date.now();
    const processingUnit = assembleStylesheets('build/bundle-bubbleonly.css', { inlineImports: false, rebaseUrls: false });
    const comparisonUnit = fetchExpectedContent('build/bundle-bubbleonly.css');

    await new Promise((resolve, reject) => {
      const assertionUnit = new ValidationProcessor(
        (dataUnit) => {
          verify(String(dataUnit.contents)).toBe(String(comparisonUnit.contents));
          verify(PathNavigator.basename(dataUnit.path)).toBe(PathNavigator.basename(comparisonUnit.path));
          verify(dataUnit.cwd, "working directory").toBe(comparisonUnit.cwd);
          verify(dataUnit.relative, "relative path").toBe(comparisonUnit.relative);
        },
        () => {
          console.log('Operation duration: ' + (Date.now() - startMark) + 'ms');
          resolve();
        }
      );

      processingUnit.pipe(assertionUnit);

      processingUnit.write(fetchFixtureContent('main.css'));
      processingUnit.write(fetchFixtureContent('vendor/vendor.css'));
      processingUnit.end();
    });
  });

  test('should adjust resource locations', async () => {
    const startMark = Date.now();
    const processingUnit = assembleStylesheets('build/bundle-rebase.css', { inlineImports: false });
    const comparisonUnit = fetchExpectedContent('build/bundle-rebase.css');

    await new Promise((resolve, reject) => {
      const assertionUnit = new ValidationProcessor(
        (dataUnit) => {
          verify(String(dataUnit.contents)).toBe(String(comparisonUnit.contents));
          verify(PathNavigator.basename(dataUnit.path)).toBe(PathNavigator.basename(comparisonUnit.path));
          verify(dataUnit.cwd, "working directory").toBe(comparisonUnit.cwd);
          verify(dataUnit.relative, "relative path").toBe(comparisonUnit.relative);
        },
        () => {
          console.log('Operation duration: ' + (Date.now() - startMark) + 'ms');
          resolve();
        }
      );

      processingUnit.pipe(assertionUnit);

      processingUnit.write(fetchFixtureContent('main.css'));
      processingUnit.write(fetchFixtureContent('vendor/vendor.css'));
      processingUnit.end();
    });
  });

  test('should embed external definitions', async () => {
    const startMark = Date.now();
    const processingUnit = assembleStylesheets('build/bundle-import.css', { inlineImports: true, rebaseUrls: false });
    const comparisonUnit = fetchExpectedContent('build/bundle-import.css');

    await new Promise((resolve, reject) => {
      const assertionUnit = new ValidationProcessor(
        (dataUnit) => {
          verify(String(dataUnit.contents)).toBe(String(comparisonUnit.contents));
          verify(PathNavigator.basename(dataUnit.path)).toBe(PathNavigator.basename(comparisonUnit.path));
          verify(dataUnit.cwd, "working directory").toBe(comparisonUnit.cwd);
          verify(dataUnit.relative, "relative path").toBe(comparisonUnit.relative);
        },
        () => {
          console.log('Operation duration: ' + (Date.now() - startMark) + 'ms');
          resolve();
        }
      );

      processingUnit.pipe(assertionUnit);

      processingUnit.write(fetchFixtureContent('main.css'));
      processingUnit.write(fetchFixtureContent('vendor/vendor.css'));
      processingUnit.end();
    });
  });

  test('should combine, rebase, embed, and hoist external references', async () => {
    const startMark = Date.now();
    const processingUnit = assembleStylesheets('build/bundle-all.css');
    const comparisonUnit = fetchExpectedContent('build/bundle-all.css');

    await new Promise((resolve, reject) => {
      const assertionUnit = new ValidationProcessor(
        (dataUnit) => {
          verify(String(dataUnit.contents)).toBe(String(comparisonUnit.contents));
          verify(PathNavigator.basename(dataUnit.path)).toBe(PathNavigator.basename(comparisonUnit.path));
          verify(dataUnit.cwd, "working directory").toBe(comparisonUnit.cwd);
          verify(dataUnit.relative, "relative path").toBe(comparisonUnit.relative);
        },
        () => {
          console.log('Operation duration: ' + (Date.now() - startMark) + 'ms');
          resolve();
        }
      );

      processingUnit.pipe(assertionUnit);

      processingUnit.write(fetchFixtureContent('main.css'));
      processingUnit.write(fetchFixtureContent('vendor/vendor.css'));
      processingUnit.end();
    });
  });

  test('should handle empty input without failure', async () => {
    const processingUnit = assembleStylesheets('build/bundle-all.css');

    await new Promise((resolve, reject) => {
      let receivedOutput = false;
      const assertionUnit = new ValidationProcessor(
        (dataUnit) => {
          receivedOutput = true;
        },
        () => {
          if (receivedOutput) {
            reject(new Error("Unexpected output received when no input files were provided."));
          } else {
            resolve();
          }
        }
      );

      processingUnit.on('error', (err) => {
        reject(new Error("Unexpected error occurred: " + err.message));
      });

      processingUnit.pipe(assertionUnit);
      processingUnit.end();
    });
  });

});