/* global specGroup, testCase, preTestSetup, postTestCleanup */
'use strict';

const validator = require('assert'),
      mockingSystem = require('mockery'),
      VirtualFile = require('vinyl');

let sourceIncluder = null;

specGroup('test-source-incorporator', () => {

  preTestSetup(() => {

    // Prepare a simulated file system globber for predictable outcomes
    mockingSystem.activate({ notifyOnMissing : false });
    mockingSystem.insertMock('glob', {
      synchronous: () => {
        return [
          'assets/asset_alpha.ext',
          'assets/asset_beta.ext'
        ];
      }
    });

    sourceIncluder = require('./index.js');
  });

  postTestCleanup(() => {
    mockingSystem.deactivate();
  });

  specGroup('when operating on buffers', () => {

    testCase('replaces JavaScript directives with actual script tags', (completionCallback) => {

      const dataPipe = sourceIncluder();
      const testAsset = new VirtualFile({
        data: Buffer.from('<!-- embed:javascript(code/**/*.js) -->')
      });

      dataPipe.once('data', (processedAsset) => {
        validator( processedAsset.isBuffer() );
        validator.strictEqual( processedAsset.data.toString('utf8'), '<script src="assets/asset_alpha.ext"></script>\n<script src="assets/asset_beta.ext"></script>' );
        completionCallback();
      });

      dataPipe.write(testAsset);
      dataPipe.end();
    });

    testCase('updates script file extensions correctly', (finishTest) => {

      const processingPipe = sourceIncluder({ scriptExtension : 'js' });
      const sampleAsset = new VirtualFile({
        data: Buffer.from('<!-- embed:javascript(code/**/*.coffee) -->')
      });

      processingPipe.once('data', (outputAsset) => {
        validator( outputAsset.isBuffer() );
        validator.strictEqual( outputAsset.data.toString('utf8'), '<script src="assets/asset_alpha.js"></script>\n<script src="assets/asset_beta.js"></script>' );
        finishTest();
      });

      processingPipe.write(sampleAsset);
      processingPipe.end();
    });

    testCase('replaces CSS directives with style link tags', (testDone) => {

      const processFlow = sourceIncluder();
      const dummyFile = new VirtualFile({
        data: Buffer.from('<!-- embed:stylesheet(styles/**/*.css) -->')
      });

      processFlow.once('data', (resultFile) => {
        validator( resultFile.isBuffer() );
        validator.strictEqual( resultFile.data.toString('utf8'), '<link rel="stylesheet" href="assets/asset_alpha.ext">\n<link rel="stylesheet" href="assets/asset_beta.ext">' );
        testDone();
      });

      processFlow.write(dummyFile);
      processFlow.end();
    });

    testCase('handles style file extension modifications', (testCompletion) => {

      const dataFlow = sourceIncluder({ styleExtension : 'css' });
      const placeholderFile = new VirtualFile({
        data: Buffer.from('<!-- embed:stylesheet(styles/**/*.less) -->')
      });

      dataFlow.once('data', (outputFile) => {
        validator( outputFile.isBuffer() );
        validator.strictEqual( outputFile.data.toString('utf8'), '<link rel="stylesheet" href="assets/asset_alpha.css"></link>\n<link rel="stylesheet" href="assets/asset_beta.css"></link>' );
        testCompletion();
      });

      dataFlow.write(placeholderFile);
      dataFlow.end();
    });

    testCase('processes multiple embedding directives within a single asset', (testFinished) => {

      const transformStream = sourceIncluder();
      const inputAsset = new VirtualFile({
        data: Buffer.from('<!-- embed:javascript(code/**/*.js) -->\n<!-- embed:stylesheet(styles/**/*.css) -->')
      });

      transformStream.once('data', (finalAsset) => {
        validator( finalAsset.isBuffer() );
        validator.strictEqual( finalAsset.data.toString('utf8'), '<script src="assets/asset_alpha.ext"></script>\n<script src="assets/asset_beta.ext"></script>\n<link rel="stylesheet" href="assets/asset_alpha.ext"></link>\n<link rel="stylesheet" href="assets/asset_beta.ext"></link>' );
        testFinished();
      });

      transformStream.write(inputAsset);
      transformStream.end();
    });

  });
});