/**
 *
 *  Frontend Project Build Flow
 *  Copyright 2024 Your Company. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Core build system and essential utility modules
const builder = require('gulp');
const plugins = require('gulp-load-plugins')();
const fileEraser = require('del');
const orchestrateTasks = require('run-sequence');
const livePreview = require('browser-sync');
const performanceAudit = require('psi');
const refreshBrowser = livePreview.reload;

// Configuration for CSS autoprefixing
const SUPPORTED_BROWSER_TARGETS = [
  'last 2 versions',
  'Firefox ESR',
  'Safari >= 8',
  'Chrome >= 38',
  'Opera >= 25',
  'iOS >= 8',
  'Android >= 4.0'
];

// Centralized path definitions for project directories
const PROJECT_PATHS = {
  SOURCE: 'source',
  OUTPUT: 'output',
  TEMPORARY: '.tmp',
  SCRIPTS: 'source/scripts/**/*.js',
  STYLES: 'source/styles',
  GRAPHICS: 'source/images/**/*',
  FONTS: 'source/fonts/**/*',
  MARKUP: 'source/**/*.html'
};

// Task: Lint JavaScript files for quality and consistency
builder.task('checkCodeQuality', function () {
  return builder.src(PROJECT_PATHS.SCRIPTS)
    .pipe(refreshBrowser({ stream: true, once: true })) // Stream changes to browser without full reload
    .pipe(plugins.eslint()) // Utilize ESLint for code analysis
    .pipe(plugins.eslint.format()) // Format ESLint output nicely
    .pipe(plugins.if(!livePreview.active, plugins.eslint.failAfterError())); // Fail build if errors are found, unless browser sync is active
});

// Task: Optimize and compress image assets
builder.task('optimizeGraphics', function () {
  const imageOptimizationSettings = {
    progressive: true,
    interlaced: true,
    optimizationLevel: 5 // Deeper optimization level
  };

  return builder.src(PROJECT_PATHS.GRAPHICS)
    .pipe(plugins.plumber()) // Prevent Gulp from crashing on errors
    .pipe(plugins.cache(plugins.imagemin(imageOptimizationSettings)))
    .pipe(builder.dest(`${PROJECT_PATHS.OUTPUT}/images`))
    .pipe(plugins.size({ title: 'Optimized Images', showFiles: true })); // Report size of individual files
});

// Task: Copy miscellaneous static files from source to output root
builder.task('distributeStaticAssets', function () {
  const rootFilesToCopy = [
    `${PROJECT_PATHS.SOURCE}/*`,
    `!${PROJECT_PATHS.SOURCE}/*.html`, // Exclude HTML files from this copy operation
    'node_modules/apache-server-configs/dist/.htaccess' // Include .htaccess from a dependency
  ];
  return builder.src(rootFilesToCopy, { dot: true })
    .pipe(builder.dest(PROJECT_PATHS.OUTPUT))
    .pipe(plugins.size({ title: 'Root Assets Copied' }));
});

// Task: Transfer web font files to the build directory
builder.task('prepareTypography', function () {
  return builder.src(PROJECT_PATHS.FONTS)
    .pipe(builder.dest(`${PROJECT_PATHS.OUTPUT}/fonts`))
    .pipe(plugins.size({ title: 'Font Files' }));
});

// Task: Compile Sass/CSS, apply autoprefixing, and minify styles
builder.task('processStylesheets', function () {
  const styleSourceFiles = [
    `${PROJECT_PATHS.STYLES}/*.scss`,
    `${PROJECT_PATHS.STYLES}/**/*.css`,
    `${PROJECT_PATHS.STYLES}/bootstrap.scss`
  ];
  return builder.src(styleSourceFiles)
    .pipe(plugins.plumber()) // Robust error handling for stylesheet compilation
    .pipe(plugins.sourcemaps.init()) // Initialize sourcemap generation
    .pipe(plugins.sass({ // Compile Sass using node-sass (faster)
      outputStyle: 'expanded', // Readable CSS output during development
      precision: 10
    }).on('error', plugins.sass.logError)) // Log Sass compilation errors
    .pipe(plugins.autoprefixer({ browsers: SUPPORTED_BROWSER_TARGETS }))
    .pipe(builder.dest(`${PROJECT_PATHS.TEMPORARY}/styles`)) // Output to temporary directory first
    // Apply minification for production builds
    .pipe(plugins.if('*.css', plugins.cssnano({ zindex: false, reduceIdents: false }))) // CSS minification with options
    .pipe(plugins.sourcemaps.write('.')) // Write sourcemaps to current directory
    .pipe(builder.dest(`${PROJECT_PATHS.OUTPUT}/styles`))
    .pipe(plugins.size({ title: 'Processed Styles' }));
});

// Task: Process HTML, concatenate and minify embedded assets, and optimize markup
builder.task('packageMarkup', function () {
  const markupAssetStreams = plugins.useref.assets({ searchPath: [`{${PROJECT_PATHS.TEMPORARY},${PROJECT_PATHS.SOURCE}}`] });
  const htmlPagesForUncss = [
    `${PROJECT_PATHS.SOURCE}/index.html`,
    `${PROJECT_PATHS.SOURCE}/styleguide.html`
  ];

  return builder.src(PROJECT_PATHS.MARKUP)
    .pipe(markupAssetStreams)
    // Process JavaScript within HTML build blocks
    .pipe(plugins.if('*.js', plugins.uglify({ compress: { drop_console: true } }))) // Remove console logs in production JS
    // Remove unused CSS based on HTML usage
    .pipe(plugins.if('*.css', plugins.uncss({
      html: htmlPagesForUncss,
      ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/,
        /.is-active/, // Added another common class to ignore
        /\[data-toggle\]/ // Ignore specific attribute selectors
      ]
    })))
    // Minify CSS within HTML build blocks
    .pipe(plugins.if('*.css', plugins.cssnano({ preset: 'default' })))
    .pipe(markupAssetStreams.restore())
    .pipe(plugins.useref())
    // Perform specific string replacements (e.g., for production paths)
    .pipe(plugins.replace('bootstrap.css', 'bootstrap.min.css'))
    // Minify HTML itself
    .pipe(plugins.if('*.html', plugins.htmlmin({ collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true })))
    // Output the final processed HTML files
    .pipe(builder.dest(PROJECT_PATHS.OUTPUT))
    .pipe(plugins.size({ title: 'Final HTML Output' }));
});

// Task: Clean up temporary and output directories
builder.task('purgeBuildArtifacts', function () {
  const directoriesToClean = [`${PROJECT_PATHS.TEMPORARY}`, `${PROJECT_PATHS.OUTPUT}`];
  console.log(`Cleaning directories: ${directoriesToClean.join(', ')}`);
  return fileEraser(directoriesToClean, { force: true }); // Use force: true for external directory deletion
});

// Task: Start a local development server with live reloading
builder.task('developLocally', ['processStylesheets'], function () {
  livePreview({
    notify: false, // Suppress browser notifications
    port: 9000, // Custom port for dev server
    server: [PROJECT_PATHS.TEMPORARY, PROJECT_PATHS.SOURCE], // Serve from temp first, then source
    ui: false, // Disable BrowserSync UI
    open: true // Automatically open browser
  });

  // Watch for changes and trigger appropriate tasks/reloads
  builder.watch([PROJECT_PATHS.MARKUP], refreshBrowser);
  builder.watch([`${PROJECT_PATHS.STYLES}/**/*.{scss,css}`], ['processStylesheets', refreshBrowser]);
  builder.watch([PROJECT_PATHS.SCRIPTS], ['checkCodeQuality', refreshBrowser]);
  builder.watch([PROJECT_PATHS.GRAPHICS], refreshBrowser);
});

// Task: Serve the production-ready build from the output directory
builder.task('previewProductionBuild', ['buildProject'], function () {
  livePreview({
    notify: false,
    port: 9001, // Different port for production preview
    server: PROJECT_PATHS.OUTPUT,
    open: false // Do not auto-open browser for production preview
  });
});

// Main build task: Orchestrates the entire production build process
builder.task('buildProject', ['purgeBuildArtifacts'], function (completionCallback) {
  const isProductionEnvironment = process.env.NODE_ENV === 'production';
  if (!isProductionEnvironment) {
    console.warn('WARNING: Building in a non-production environment. For full optimizations, set NODE_ENV=production.');
  }

  orchestrateTasks(
    'processStylesheets',
    ['checkCodeQuality', 'packageMarkup', 'optimizeGraphics', 'prepareTypography', 'distributeStaticAssets'],
    completionCallback
  );
});

// Task: Run Google PageSpeed Insights audit
const AUDIT_TARGET_URL = 'https://your-production-site.com'; // Define the target URL as a constant
builder.task('runPerformanceInsights', performanceAudit.bind(null, {
  url: AUDIT_TARGET_URL,
  strategy: 'desktop', // Change strategy to desktop
  threshold: 85, // Set a performance score threshold
  key: process.env.PSI_API_KEY || null // Use an environment variable for the API key
}));

// Attempt to load any custom build tasks from a dedicated directory
try {
  require('require-dir')('build-tasks');
} catch (errorDetails) {
  // Gracefully handle cases where the custom tasks directory might not exist
  if (errorDetails.code === 'MODULE_NOT_FOUND') {
    console.info('No additional build tasks found in "build-tasks" directory. Skipping custom task loading.');
  } else {
    console.error('An unexpected error occurred while loading custom build tasks:', errorDetails.message);
  }
}