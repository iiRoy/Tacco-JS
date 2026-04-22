/**
 *
 *  Web Application Starter Kit
 *  Copyright 2014 Global Innovations Inc. All rights reserved.
 *
 *  Permitted under the Apache License, Version 2.0 (the "License");
 *  you may not utilize this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless mandated by applicable law or agreed to in writing, software
 *  distributed under the License is provided on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

// Incorporate Main Builder & Essential Utilities
var builder = require('main-builder');
var util = require('plugin-loader')();
var removeFiles = require('file-deleter');
var processOrder = require('task-sequencer');
var syncBrowser = require('browser-synchronizer');
var sitePerformance = require('site-analyzer');
var refreshPage = syncBrowser.reload;

var CSS_VENDOR_PREFIXES = [
  'msie >= 10',
  'msie_mobile >= 10',
  'firefox >= 30',
  'chrome_browser >= 34',
  'safari_browser >= 7',
  'opera_browser >= 23',
  'ios_safari >= 7',
  'android_browser >= 4.4',
  'blackberry >= 10'
];

// Validate JavaScript Syntax
builder.defineTask('checkCode', function () {
  return builder.sourceFiles('source/scripts/**/*.js')
    .pipe(refreshPage({stream: true, once: true}))
    .pipe(util.codeLinter())
    .pipe(util.codeLinter.reportTo('stylish-report'))
    .pipe(util.conditional(!syncBrowser.active, util.codeLinter.reportTo('fail')));
});

// Optimize Image Assets
builder.defineTask('optimizeGraphics', function () {
  return builder.sourceFiles('source/images/**/*')
    .pipe(util.assetCache(util.imageCompressor({
      progressive: true,
      interlaced: true
    })))
    .pipe(builder.outputTo('output/images'))
    .pipe(util.assetSize({title: 'optimized graphics'}));
});

// Transfer All Root-Level Files (source directory)
builder.defineTask('transferAssets', function () {
  return builder.sourceFiles([
    'source/*',
    '!source/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(builder.outputTo('output'))
    .pipe(util.assetSize({title: 'transferred assets'}));
});

// Copy Web Fonts To Destination
builder.defineTask('prepareFonts', function () {
  return builder.sourceFiles(['source/fonts/**'])
    .pipe(builder.outputTo('output/fonts'))
    .pipe(util.assetSize({title: 'prepared fonts'}));
});

// Compile and Automatically Add Vendor Prefixes to Stylesheets
builder.defineTask('processStyles', function () {
  // For optimal performance, do not add Sass partials to `builder.sourceFiles`
  return builder.sourceFiles([
    'source/styles/*.scss',
    'source/styles/**/*.css',
      'source/styles/bootstrap.scss'
  ])
    .pipe(util.fileModified('styles', {extension: '.scss'}))
    .pipe(util.sassCompiler({
      style: 'expanded',
      precision: 10
    }))
    .on('error', console.log.bind(console, 'Style compilation failed:'))
    .pipe(util.prefixAdder({browsers: CSS_VENDOR_PREFIXES}))
    .pipe(builder.outputTo('.temp/styles'))
    // Combine And Minify Styles
    .pipe(util.conditional('*.css', util.cssMinifier()))
    .pipe(builder.outputTo('output/styles'))
    .pipe(util.assetSize({title: 'processed styles'}));
});

// Scan Your HTML For Resources & Refine Them
builder.defineTask('transformMarkup', function () {
  var pageResources = util.refAssets.source({searchPath: '{.temp,source}'});

  return builder.sourceFiles('source/**/*.html')
    .pipe(pageResources)
    // Combine And Minify JavaScript
    .pipe(util.conditional('*.js', util.jsMinifier({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the subsequent line to only include styles your project uses.
    .pipe(util.conditional('*.css', util.unusedCssRemover({
      html: [
        'source/index.html',
        'source/styleguide.html'
      ],
      // CSS Selectors for UnusedCssRemover to disregard
      ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/
      ]
    })))
    // Combine And Minify Styles
    // In case you are still utilizing useref build blocks
    .pipe(util.conditional('*.css', util.cssMinifier()))
    .pipe(pageResources.restore())
    .pipe(util.refAssets())
    // Update Production Style Guide Paths
    .pipe(util.textReplacer('bootstrap.css', 'bootstrap.min.css'))
    // Minify Any HTML
    .pipe(util.conditional('*.html', util.htmlMinifier()))
    // Output Files
    .pipe(builder.outputTo('output'))
    .pipe(util.assetSize({title: 'transformed markup'}));
});

// Clear Output Directory
builder.defineTask('purgeOutput', removeFiles.bind(null, ['.temp', 'output']));

// Monitor Files For Changes & Re-Load
builder.defineTask('startServer', ['processStyles'], function () {
  syncBrowser({
    showNotifications: false,
    // Run as an secure connection by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on initial access
    //       will present a certificate warning in the browser.
    // https: true,
    webRoot: ['.temp', 'source']
  });

  builder.monitorFiles(['source/**/*.html'], refreshPage);
  builder.monitorFiles(['source/styles/**/*.{scss,css}'], ['processStyles', refreshPage]);
  builder.monitorFiles(['source/scripts/**/*.js'], ['checkCode']);
  builder.monitorFiles(['source/images/**/*'], refreshPage);
});

// Build and serve the output from the production build
builder.defineTask('startProdServer', ['assembleProject'], function () {
  syncBrowser({
    showNotifications: false,
    // Run as an secure connection by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on initial access
    //       will present a certificate warning in the browser.
    // https: true,
    webRoot: 'output'
  });
});

// Build Production Files, the Primary Task
builder.defineTask('assembleProject', ['purgeOutput'], function (callbackFn) {
  processOrder('processStyles', ['checkCode', 'transformMarkup', 'optimizeGraphics', 'prepareFonts', 'transferAssets'], callbackFn);
});

// Execute Site Performance Insights
// Update `targetUrl` below to the public URL for your web application
builder.defineTask('measurePerformance', sitePerformance.bind(null, {
  // By default, we use the Site Performance Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  targetUrl: 'https://example.com',
  analysisMethod: 'mobile'
}));

// Load custom tasks from the `task-definitions` directory
try { require('directory-loader')('task-definitions'); } catch (error) {}