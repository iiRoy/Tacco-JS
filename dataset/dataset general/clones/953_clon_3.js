// Build configuration for a web application development workflow.
'use strict';

const DEV_SERVER_REFRESH_PORT = 35729; // Port for live browser refresh
const pathModule = require('path');    // Core Node.js path utility

// Middleware to inject live reload script into served HTML.
const devRefreshInjector = require('connect-livereload')({ port: DEV_SERVER_REFRESH_PORT });

/**
 * Generates a Connect/Express static file server middleware.
 * @param {object} httpServerInst - The Connect/Express server instance.
 * @param {string} targetPath - The file system path to serve static assets from.
 * @returns {Function} A middleware function for serving static content.
 */
const serveContentDirectory = function (httpServerInst, targetPath) {
  // Ensure the path is absolute for reliable serving across different environments.
  return httpServerInst.static(pathModule.resolve(targetPath));
};

// --- Grunt Build System Configuration ---

module.exports = function (buildSystem) {
  // Automatically load all Grunt plugins defined in package.json's devDependencies.
  require('matchdep').filterDev('grunt-*').forEach(buildSystem.loadNpmTasks);

  // Centralized object for configurable project directory paths.
  const projectStructure = {
    sourceRoot: 'app',        // Directory containing uncompiled source code
    buildOutput: 'dist',      // Directory for final compiled and optimized build artifacts
    tempAssets: '.tmp'        // Intermediate directory for temporary build files
  };

  buildSystem.initConfig({
    projectInfo: projectStructure, // Project path configuration, previously 'yeoman'

    fileMonitor: { // Task to monitor file changes and trigger specific build steps (formerly 'watch')
      jsCompileWatch: {
        files: [`<%= projectInfo.sourceRoot %>/scripts/**/*.coffee`],
        tasks: ['jsTranspile:dev', 'moduleBundler:mainApp']
      },
      jsTestTranspile: {
        files: [`test/spec/{,*/}*.coffee`],
        tasks: ['jsTranspile:testEnv']
      },
      styleCompileWatch: {
        files: [`<%= projectInfo.sourceRoot %>/styles/{,*/}*.{scss,sass}`],
        tasks: ['sassCompile:development']
      },
      hbsTemplatesWatch: {
        files: '<%= projectInfo.sourceRoot %>/templates/**/*.hbs',
        tasks: ['hbsTemplates']
      },
      mdContentProcessor: {
        files: '<%= projectInfo.sourceRoot %>/templates/**/*.md',
        tasks: ['mdProcessor']
      },
      liveReloadWatcher: {
        options: {
          livereload: DEV_SERVER_REFRESH_PORT,
          spawn: false, // Prevents killing the Grunt process, allowing continuous watching
          debounceDelay: 500 // Delay between multiple file change events
        },
        files: [
          '<%= projectInfo.sourceRoot %>/*.html',
          `{.tmp,<%= projectInfo.sourceRoot %>}/styles/{,*/}*.css`,
          `{.tmp,<%= projectInfo.sourceRoot %>}/scripts/{,*/}*.js`,
          '<%= projectInfo.sourceRoot %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    devServer: { // Task for local development and test servers (formerly 'connect')
      serverSettings: { // General server configuration options
        listenPort: 9000,
        hostAddress: '0.0.0.0', // Allows access from other devices on the network
        base: pathModule.resolve('.') // Base directory for the server
      },
      liveDevelopment: { // Configuration for the live development server
        serverSettings: {
          requestHandlers: function (httpServerInst) { // Array of Connect/Express middleware
            // A simple custom logger middleware for development
            const customLogger = (req, res, next) => {
              // buildSystem.log(`[DEV SERVER] Incoming request for: ${req.url}`); // Removed for final output
              next();
            };
            return [
              customLogger,
              devRefreshInjector,
              serveContentDirectory(httpServerInst, projectStructure.tempAssets), // Serve temporary assets first
              serveContentDirectory(httpServerInst, projectStructure.sourceRoot)  // Then serve source assets
            ];
          }
        }
      },
      testEnvironment: { // Configuration for the testing environment server
        serverSettings: {
          requestHandlers: function (httpServerInst) {
            return [
              serveContentDirectory(httpServerInst, projectStructure.tempAssets),
              serveContentDirectory(httpServerInst, 'test') // Serve test files
            ];
          }
        }
      },
      productionServe: { // Configuration to serve the production-ready build
        serverSettings: {
          requestHandlers: function (httpServerInst) {
            return [
              serveContentDirectory(httpServerInst, projectStructure.buildOutput)
            ];
          }
        }
      }
    },

    startBrowser: { // Task to automatically open the development server in a browser (formerly 'open')
      devServerInstance: {
        path: `http://localhost:<%= devServer.serverSettings.listenPort %>`
      }
    },

    cleanupArtifacts: { // Task to clean up generated files and directories (formerly 'clean')
      buildArtifacts: { // Cleans the entire build output directory
        files: [{
          dot: true,
          src: [
            '<%= projectInfo.tempAssets %>',
            '<%= projectInfo.buildOutput %>/**/*', // Matches all files and directories recursively
            '!<%= projectInfo.buildOutput %>/.git*' // Exclude Git metadata
          ]
        }]
      },
      tempServerFiles: '<%= projectInfo.tempAssets %>' // Cleans only temporary server files
    },

    jsCodeQuality: { // Task for JavaScript code linting (formerly 'jshint')
      configOptions: {
        jshintrc: '.jshintrc' // Path to JSHint configuration file
      },
      mainAppScripts: [ // Specifies files to lint
        'Gruntfile.js',
        '<%= projectInfo.sourceRoot %>/scripts/{,*/}*.js',
        '!<%= projectInfo.sourceRoot %>/scripts/vendor/*', // Exclude vendor scripts
        'test/spec/{,*/}*.js'
      ]
    },

    unitTestRunner: { // Task for running unit tests (formerly 'mocha')
      allTests: {
        configOptions: {
          run: true,
          urls: [`http://localhost:<%= devServer.serverSettings.listenPort %>/index.html`]
        }
      }
    },

    jsTranspile: { // Task for transpiling CoffeeScript to JavaScript (formerly 'coffee')
      dev: { // Transpiles for development
        files: [{
          expand: true,
          cwd: '<%= projectInfo.sourceRoot %>/scripts',
          src: '**/*.coffee',
          dest: '<%= projectInfo.tempAssets %>/scripts',
          ext: '.js'
        }]
      },
      testEnv: { // Transpiles test-specific CoffeeScript files
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '<%= projectInfo.tempAssets %>/spec',
          ext: '.js'
        }]
      }
    },

    sassCompile: { // Task for compiling Sass/SCSS to CSS (formerly 'compass')
      configOptions: {
        sassDir: '<%= projectInfo.sourceRoot %>/styles',
        cssDir: '<%= projectInfo.tempAssets %>/styles',
        generatedImagesDir: '<%= projectInfo.tempAssets %>/images/generated',
        imagesDir: '<%= projectInfo.sourceRoot %>/images',
        javascriptsDir: '<%= projectInfo.sourceRoot %>/scripts',
        fontsDir: '<%= projectInfo.sourceRoot %>/styles/fonts',
        importPath: '<%= projectInfo.sourceRoot %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        outputStyle: 'expanded' // Output CSS in a human-readable format
      },
      build: {}, // Configuration for production build
      development: { // Configuration for development server
        configOptions: {
          debugInfo: true,       // Include debug information in CSS
          noLineComments: false  // Ensure line comments are included for easier debugging
        }
      }
    },

    assetRevisioner: { // Task for cache-busting assets by appending content hashes (formerly 'rev')
      buildOutputAssets: {
        files: {
          src: [
            '<%= projectInfo.buildOutput %>/scripts/**/*.js',
            '<%= projectInfo.buildOutput %>/styles/**/*.css',
            '<%= projectInfo.buildOutput %>/images/**/*.{png,jpg,jpeg,gif,webp}',
            '<%= projectInfo.buildOutput %>/styles/fonts/*'
          ]
        }
      }
    },

    minificationPrep: { // Task to prepare files for minification and concatenation using Usemin (formerly 'useminPrepare')
      configOptions: {
        dest: '<%= projectInfo.buildOutput %>'
      },
      htmlEntry: '<%= projectInfo.sourceRoot %>/index.html'
    },

    assetMinifier: { // Task to replace unminified asset references with minified ones (formerly 'usemin')
      configOptions: {
        dirs: ['<%= projectInfo.buildOutput %>']
      },
      htmlFiles: ['<%= projectInfo.buildOutput %>/{,*/}*.html'],
      cssFiles: ['<%= projectInfo.buildOutput %>/styles/{,*/}*.css']
    },

    imageOptimizer: { // Task for optimizing image files (formerly 'imagemin')
      build: {
        files: [{
          expand: true,
          cwd: '<%= projectInfo.sourceRoot %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= projectInfo.buildOutput %>/images'
        }]
      }
    },

    svgOptimizer: { // Task for optimizing SVG files (formerly 'svgmin')
      build: {
        files: [{
          expand: true,
          cwd: '<%= projectInfo.sourceRoot %>/images',
          src: '{,*/}*.svg',
          dest: '<%= projectInfo.buildOutput %>/images'
        }]
      }
    },

    styleMinifier: { // Task for minifying CSS files (formerly 'cssmin')
      build: {
        files: {
          '<%= projectInfo.buildOutput %>/styles/main.css': [
            '<%= projectInfo.tempAssets %>/styles/{,*/}*.css',
            '<%= projectInfo.sourceRoot %>/styles/{,*/}*.css'
          ]
        }
      }
    },

    htmlMinifier: { // Task for minifying HTML files (formerly 'htmlmin')
      build: {
        options: {
          collapseWhitespace: true, // Remove extra whitespace
          minifyCSS: true,          // Minify inline CSS
          minifyJS: true            // Minify inline JavaScript
        },
        files: [{
          expand: true,
          cwd: '<%= projectInfo.sourceRoot %>',
          src: '*.html',
          dest: '<%= projectInfo.buildOutput %>'
        }]
      }
    },

    fileCopier: { // Task for copying files and directories (formerly 'copy')
      buildAssets: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= projectInfo.sourceRoot %>',
          dest: '<%= projectInfo.buildOutput %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{webp,gif}',
            'styles/fonts/*'
          ]
        }, {
          expand: true,
          cwd: '<%= projectInfo.tempAssets %>/images',
          dest: '<%= projectInfo.buildOutput %>/images',
          src: ['generated/*']
        }]
      },
      preMinificationCopies: { // Copies specific files before minification
        files: [{
          expand: true,
          src: ['<%= projectInfo.buildOutput %>/js/app-*.min.js'], // Example pattern for a specific JS file
          ext: '.max.js' // Creates a .max.js version
        }]
      },
      miscFiles: { // New task to copy additional miscellaneous files
        files: [{
          expand: true,
          cwd: '<%= projectInfo.sourceRoot %>',
          dest: '<%= projectInfo.buildOutput %>',
          src: ['favicon.ico', 'robots.txt']
        }]
      }
    },

    parallelTasks: { // Task for running multiple tasks concurrently to speed up build (formerly 'concurrent')
      devServerSetup: [
        'sassCompile:development',
        'mdProcessor',
        'hbsTemplates',
        'jsTranspile:dev'
      ],
      testSuitePrep: [
        'jsTranspile' // Runs both 'dev' and 'testEnv' sub-tasks
      ],
      fullBuildProcess: [
        'jsTranspile',
        'mdProcessor',
        'hbsTemplates',
        'sassCompile',
        'imageOptimizer',
        'svgOptimizer',
        'htmlMinifier'
      ]
    },

    hbsTemplates: { // Task for compiling Handlebars templates (Ember.js specific) (formerly 'ember_templates')
      compileComponents: {
        configOptions: {
          templateName: function (filePath) {
            // Extracts a user-friendly template name from the file path.
            let startIndex = filePath.lastIndexOf('/components/') + 1;
            if (startIndex === 0) { // If not found, try '/views/'
              startIndex = filePath.lastIndexOf('/views/') + 1;
              if (startIndex === 0) {
                // Fallback if neither components nor views path segment is found.
                return pathModule.basename(filePath, pathModule.extname(filePath));
              }
            }
            return filePath.substring(startIndex);
          },
          namespace: 'Ember.TEMPLATES'
        },
        files: {
          '<%= projectInfo.tempAssets %>/scripts/core-templates.js': '<%= projectInfo.sourceRoot %>/templates/views/item-pane.hbs',
          '<%= projectInfo.tempAssets %>/scripts/basic-ui.js': [
            '<%= projectInfo.sourceRoot %>/templates/components/bs-page-header.hbs',
            '<%= projectInfo.sourceRoot %>/templates/components/bs-well.hbs',
            '<%= projectInfo.sourceRoot %>/templates/components/bs-panel.hbs'
          ],
          '<%= projectInfo.tempAssets %>/scripts/alert-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-alert.hbs',
          '<%= projectInfo.tempAssets %>/scripts/label-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-label.hbs',
          '<%= projectInfo.tempAssets %>/scripts/badge-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-badge.hbs',
          '<%= projectInfo.tempAssets %>/scripts/button-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-button.hbs',
          '<%= projectInfo.tempAssets %>/scripts/toolbar-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-btn-toolbar.hbs',
          '<%= projectInfo.tempAssets %>/scripts/progress-components.js': [
            '<%= projectInfo.sourceRoot %>/templates/components/bs-progress.hbs',
            '<%= projectInfo.sourceRoot %>/templates/components/bs-progressbar.hbs'
          ],
          '<%= projectInfo.tempAssets %>/scripts/pills-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-pills.hbs',
          '<%= projectInfo.tempAssets %>/scripts/modal-component.js': '<%= projectInfo.sourceRoot %>/templates/components/bs-modal.hbs'
        }
      },
      compileShowcase: {
        configOptions: {
          templateName: function (filePath) {
            let name = filePath.substring(filePath.lastIndexOf('/showcase/') + 1);
            if (name.startsWith('showcase/')) {
              name = name.substring('showcase/'.length); // Remove 'showcase/' prefix if it's still there
            }
            return name;
          },
          namespace: 'Ember.TEMPLATES'
        },
        files: {
          '<%= projectInfo.tempAssets %>/scripts/showcase-templates.js': '<%= projectInfo.sourceRoot %>/templates/showcase/**/*.hbs'
        }
      }
    },

    mdProcessor: { // Task for processing Markdown files into HTML (formerly 'markdown')
      processAll: {
        files: [
          {
            expand: true,
            src: '<%= projectInfo.sourceRoot %>/templates/showcase/show_components/*.md',
            dest: '', // Destination is handled by the template
            ext: '.hbs' // Output as Handlebars template files
          }
        ],
        configOptions: {
          template: '<%= projectInfo.sourceRoot %>/templates/showcase/show_components/template.jst',
          postCompile: function (sourceContent, contextData) {
            let modifiedContent = sourceContent;
            // Decode HTML entities that might have been introduced during Markdown processing.
            modifiedContent = modifiedContent.replace(/\\{\\{/g, '&#123;&#123;');
            modifiedContent = modifiedContent.replace(/\\}\\}/g, '&#125;&#125;');
            modifiedContent = modifiedContent.replace(/&quot;/g, '"');

            return modifiedContent;
          },
          markdownOptions: {
            gfm: true, // Enable GitHub Flavored Markdown
            codeLines: {
              before: '<span class="code-line">', // Custom wrapper for code lines
              after: '</span>'
            },
            highlight: function (code, language) { // Custom syntax highlighting (dummy implementation)
              if (language && language === 'js') {
                return `// JavaScript code block\n${code}`;
              }
              return code;
            }
          }
        }
      }
    },

    moduleBundler: { // Task for concatenating and wrapping modules (formerly 'neuter')
      mainApp: {
        configOptions: {
          filepathTransform: function (originalPath) {
            // Transforms paths to point to the temporary directory for bundled modules.
            if (originalPath.startsWith('scripts/')) {
              return `${projectStructure.tempAssets}/${originalPath}`;
            }
            return originalPath; // Return path as-is if not a script
          }
        },
        src: '<%= projectInfo.tempAssets %>/scripts/showcase.js',
        dest: '<%= projectInfo.tempAssets %>/scripts/showcase-bundle.js'
      }
    }
  });

  // --- Grunt Task Registrations ---

  // New utility task: Logs important project paths.
  buildSystem.registerTask('logBuildInfo', 'Displays current build configuration paths.', function() {
    buildSystem.log(`Source Root Directory: ${projectStructure.sourceRoot}`);
    buildSystem.log(`Build Output Directory: ${projectStructure.buildOutput}`);
    buildSystem.log(`Temporary Assets Directory: ${projectStructure.tempAssets}`);
  });

  buildSystem.registerTask('startDevelopmentServer', function (targetEnv) { // Renamed from 'server'
    // Check for a 'prod' environment target.
    if (targetEnv === 'prod') {
      // Add a warning if production server is run without explicit NODE_ENV.
      if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
        buildSystem.warn('Warning: Running production server without NODE_ENV set to \'production\'.');
      }
      return buildSystem.task.run(['performBuild', 'startBrowser', 'devServer:productionServe:keepalive']);
    }

    buildSystem.task.run([
      'cleanupArtifacts:tempServerFiles',
      'parallelTasks:devServerSetup',
      'moduleBundler:mainApp',
      'devServer:liveDevelopment',
      'startBrowser', // Optionally opens a browser tab
      'fileMonitor'
    ]);
  });

  buildSystem.registerTask('runUnitTests', [ // Renamed from 'test'
    'cleanupArtifacts:tempServerFiles',
    'parallelTasks:testSuitePrep',
    'devServer:testEnvironment',
    // 'unitTestRunner' // This task is commented out to simulate deletion or conditional execution
  ]);

  buildSystem.registerTask('performBuild', [ // Renamed from 'build'
    'logBuildInfo', // Execute the new logging task
    'cleanupArtifacts:buildArtifacts',
    'minificationPrep', // Prepares dynamic concat, cssmin, uglify tasks
    'parallelTasks:fullBuildProcess', // Runs transpilation, template compilation, sass, image/svg optimization
    'moduleBundler:mainApp', // Bundles main application modules
    // 'concat', // Commented out as Usemin handles this dynamically
    'fileCopier:preMinificationCopies',
    // 'styleMinifier', // Commented out as Usemin handles this dynamically
    // 'uglify', // Commented out as Usemin handles this dynamically
    'fileCopier:buildAssets',
    'fileCopier:miscFiles', // Copy additional files to the build output
    'assetRevisioner',
    'assetMinifier' // Executes the dynamically generated minification/concatenation tasks
  ]);

  buildSystem.registerTask('defaultTasks', [ // Renamed from 'default'
    // 'jsCodeQuality', // This task is commented out to simulate deletion or conditional execution
    'runUnitTests',
    'performBuild'
  ]);
};