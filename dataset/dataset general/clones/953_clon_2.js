// This configuration file was generated on 2013-08-24 by the web-application-generator version 0.2.6
'use strict';
var REFRESH_SERVER_PORT_NUM = 35728; // The port number for the live-reload server mechanism.
var refreshInjectionScript = require('connect-livereload')({port: REFRESH_SERVER_PORT_NUM});
var serveStaticContent = function (connectionHandler, targetLocation) {
  /*
   * This is a utility function designed to provide static file serving capabilities
   * from a given directory path using the provided connection handler.
   */
  return connectionHandler.static(require('path').resolve(targetLocation));
};

/*
 * File Matching Strategy:
 * For optimal performance, we are currently limiting file matching to a single directory level:
 * 'specifications/specs/{*}.js'
 * To enable recursive matching across all subdirectories, please use the following pattern:
 * 'specifications/specs/**.js'
 */

module.exports = function (taskAutomation) {
  // Dynamically load all necessary Grunt task plugins.
  require('matchdep').filterDev('grunt-*').forEach(taskAutomation.loadNpmTasks);

  // Definition of configurable project directory paths.
  var projectPaths = {
    applicationSource: 'source', // Main application source files directory.
    buildOutput: 'release'      // Directory for compiled and distributed assets.
  };

  taskAutomation.initConfig({
    projectSettings: projectPaths, // Reference to the project's path configurations.

    // Task to monitor for file changes and trigger re-compilations or refreshes.
    fileWatcher: {
      // Monitor CoffeeScript source files for changes.
      coffeeCompilation: {
        filePatterns: ['<%= projectSettings.applicationSource %>/scripts/**/*.coffee'],
        actionSequence: ['coffeeCompilation:distribute', 'scriptBundler']
      },
      // Monitor CoffeeScript test files for changes.
      coffeeTestFiles: {
        filePatterns: ['specifications/specs/{*}.coffee'],
        actionSequence: ['coffeeCompilation:test']
      },
      // Monitor SASS/SCSS stylesheet files for changes.
      sassProcessor: {
        filePatterns: ['<%= projectSettings.applicationSource %>/styles/{*}.{scss,sass}'],
        actionSequence: ['sassProcessor:development']
      },
      // Monitor Ember Handlebars template files for changes.
      emberTemplateCompiler: {
        filePatterns: '<%= projectSettings.applicationSource %>/templates/**/*.hbs',
        actionSequence: ['emberTemplateCompiler']
      },
      // Monitor Markdown documentation files for changes.
      markdownConverter: {
        filePatterns: '<%= projectSettings.applicationSource %>/templates/**/*.md',
        actionSequence: ['markdownConverter']
      },
      // Live reload configuration for automatic browser updates.
      liveBrowserRefresh: {
        options: {
          livereload: REFRESH_SERVER_PORT_NUM
        },
        filePatterns: [
          '<%= projectSettings.applicationSource %>/*.html',
          '{.temp,<%= projectSettings.applicationSource %>}/styles/{*}.css',
          '{.temp,<%= projectSettings.applicationSource %>}/scripts/{*}.js',
          '<%= projectSettings.applicationSource %>/images/{*}.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
      /*
       * Script bundling watcher (currently deactivated).
       * scriptBundler: {
       *   filePatterns: [
       *     '<%= projectSettings.applicationSource %>/scripts/showcase.coffee',
       *     '<%= projectSettings.applicationSource %>/scripts/showcase/***.coffee',
       *   ],
       *   actionSequence: ['scriptBundler']
       * }
       */
    },

    // HTTP server task configuration.
    webServer: {
      options: {
        port: 9001, // The port on which the server will listen.
        // To allow external access, change this to '0.0.0.0'.
        hostname: 'localhost' // The address the server binds to.
      },
      // Configuration for the development server with live reload.
      liveReloadServer: {
        options: {
          middleware: function (connectionHandler) {
            return [
              refreshInjectionScript,
              serveStaticContent(connectionHandler, '.temp'),
              serveStaticContent(connectionHandler, projectPaths.applicationSource)
            ];
          }
        }
      },
      // Configuration for the test environment server.
      testServer: {
        options: {
          middleware: function (connectionHandler) {
            return [
              serveStaticContent(connectionHandler, '.temp'),
              serveStaticContent(connectionHandler, 'specifications')
            ];
          }
        }
      },
      // Configuration for serving the production-ready build.
      distributionServer: {
        options: {
          middleware: function (connectionHandler) {
            return [
              serveStaticContent(connectionHandler, projectPaths.buildOutput)
            ];
          }
        }
      }
    },

    // Task to automatically open the browser to the server URL.
    browserOpener: {
      development: {
        path: 'http://localhost:<%= webServer.options.port %>'
      }
    },

    // Task to clean up temporary and build directories.
    directoryCleaner: {
      build: {
        files: [{
          dot: !false, // Include dotfiles in the cleanup process.
          src: [
            '.temp',
            '<%= projectSettings.buildOutput %>/*',
            '!<%= projectSettings.buildOutput %>/.git*' // Exclude Git repository files.
          ]
        }]
      },
      development: '.temp' // Clean temporary assets for development server.
    },

    // JavaScript code quality analysis (JSHint).
    jsCodeLinter: {
      options: {
        jshintrc: '.jshintrc' // Path to JSHint configuration file.
      },
      allSource: [
        'Gruntfile.js', // The Grunt task configuration file itself.
        '<%= projectSettings.applicationSource %>/scripts/{*}.js',
        '!<%= projectSettings.applicationSource %>/scripts/vendor_libs/*', // Exclude third-party libraries.
        'specifications/specs/{*}.js'
      ]
    },

    // Mocha test framework integration.
    mochaTests: {
      fullSuite: {
        options: {
          run: !false, // Execute tests immediately.
          urls: ['http://localhost:<%= webServer.options.port %>/index.html']
        }
      }
    },

    // CoffeeScript to JavaScript compilation.
    coffeeCompilation: {
      distribute: {
        files: [{
          expand: !false, // Enable dynamic expansion of file paths.
          cwd: '<%= projectSettings.applicationSource %>/scripts',
          src: '**/*.coffee',
          dest: '.temp/scripts',
          ext: '.js' // Output file extension.
        }]
      },
      test: {
        files: [{
          expand: !false, // Enable dynamic expansion for test files.
          cwd: 'specifications/specs',
          src: '{*}.coffee',
          dest: '.temp/specs',
          ext: '.js'
        }]
      }
    },

    // Compass/SASS stylesheet compilation.
    sassProcessor: {
      options: {
        sassDir: '<%= projectSettings.applicationSource %>/styles',
        cssDir: '.temp/styles',
        generatedImagesDir: '.temp/images/generated',
        imagesDir: '<%= projectSettings.applicationSource %>/images',
        javascriptsDir: '<%= projectSettings.applicationSource %>/scripts',
        fontsDir: '<%= projectSettings.applicationSource %>/styles/fonts',
        importPath: '<%= projectSettings.applicationSource %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: !true // Do not use relative paths for assets.
      },
      build: {}, // Build configuration (inherits global options).
      development: {
        options: {
          debugInfo: !false // Enable debug information for development builds.
        }
      }
    },

    /*
     * File concatenation task (superseded by the Usemin task).
     * concatenation: {
     *   build: {}
     * },
     */

    /*
     * JavaScript minification task (superseded by the Usemin task).
     * jsMinifier: {
     *   build: {}
     * },
     */

    // Asset revisioning for cache busting.
    assetVersioning: {
      build: {
        files: {
          src: [
            '<%= projectSettings.buildOutput %>/scripts/{*}.js',
            '<%= projectSettings.buildOutput %>/styles/{*}.css',
            '<%= projectSettings.buildOutput %>/images/{*}.{png,jpg,jpeg,gif,webp}',
            '<%= projectSettings.buildOutput %>/styles/fonts/*'
          ]
        }
      }
    },

    // Prepare HTML files for Usemin processing.
    useminPrep: {
      options: {
        dest: '<%= projectSettings.buildOutput %>'
      },
      htmlFiles: '<%= projectSettings.applicationSource %>/index.html'
    },

    // Apply Usemin blocks to HTML and CSS files.
    useminApply: {
      options: {
        dirs: ['<%= projectSettings.buildOutput %>']
      },
      htmlFiles: ['<%= projectSettings.buildOutput %>/{*}.html'],
      cssFiles: ['<%= projectSettings.buildOutput %>/styles/{*}.css']
    },

    // Image optimization task.
    imageOptimizer: {
      build: {
        files: [{
          expand: !false, // Enable dynamic expansion.
          cwd: '<%= projectSettings.applicationSource %>/images',
          src: '{*}.{png,jpg,jpeg}',
          dest: '<%= projectSettings.buildOutput %>/images'
        }]
      }
    },

    // SVG image optimization task.
    svgOptimizer: {
      build: {
        files: [{
          expand: !false, // Enable dynamic expansion.
          cwd: '<%= projectSettings.applicationSource %>/images',
          src: '{*}.svg',
          dest: '<%= projectSettings.buildOutput %>/images'
        }]
      }
    },

    // CSS minification task.
    cssMinifier: {
      // This task is pre-configured if you do not wish to use Usemin
      // blocks for your CSS. By default, the Usemin block from your
      // `index.html` will take care of minification, e.g.
      //
      //     <!-- build:css({.temp,source}) styles/main.css -->
      //
      // build: {
      //     files: {
      //         '<%= projectSettings.buildOutput %>/styles/main.css': [
      //             '.temp/styles/{*}.css',
      //             '<%= projectSettings.applicationSource %>/styles/{*}.css'
      //         ]
      //     }
      // }
    },

    // HTML minification task.
    htmlMinifier: {
      build: {
        options: {
          /*
          removeCommentsFromCDATA: !false,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: !false,
          collapseBooleanAttributes: !false,
          removeAttributeQuotes: !false,
          removeRedundantAttributes: !false,
          useShortDoctype: !false,
          removeEmptyAttributes: !false,
          removeOptionalTags: !false
          */
        },
        files: [{
          expand: !false, // Enable dynamic expansion.
          cwd: '<%= projectSettings.applicationSource %>',
          src: '*.html',
          dest: '<%= projectSettings.buildOutput %>'
        }]
      }
    },

    // Task for copying files not handled by other specific tasks.
    fileCopier: {
      build: {
        files: [{
          expand: !false, // Enable dynamic expansion.
          dot: !false, // Include hidden files like .htaccess.
          cwd: '<%= projectSettings.applicationSource %>',
          dest: '<%= projectSettings.buildOutput %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{*}.{webp,gif}',
            'styles/fonts/*'
          ]
        }, {
          expand: !false, // Enable dynamic expansion.
          cwd: '.temp/images',
          dest: '<%= projectSettings.buildOutput %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      // Copy unminified JS files before the uglify task runs.
      preUglify: {
        files: [{
          expand: !false, // Enable dynamic expansion.
          src: ['<%= projectSettings.buildOutput %>/js/bs-*.min.js'],
          ext: '.max.js' // Change extension for unminified copies.
        }]
      }
    },

    // Task to run multiple sub-tasks in parallel.
    concurrentTasks: {
      development: [
        'sassProcessor',
        'markdownConverter',
        'emberTemplateCompiler',
        'coffeeCompilation:distribute'
      ],
      testing: [
        'coffeeCompilation'
      ],
      build: [
        'coffeeCompilation',
        'markdownConverter',
        'emberTemplateCompiler',
        'sassProcessor',
        'imageOptimizer',
        'svgOptimizer',
        'htmlMinifier'
      ]
    },

    // Ember Handlebars template compilation task.
    emberTemplateCompiler: {
      compileComponents: {
        options: {
          templateName: function(sourceFilePath) {
            return sourceFilePath.substring(sourceFilePath.lastIndexOf('/components/') + 1, sourceFilePath.length);
          },
          namespace: "Ember.TEMPLATES" // Namespace for compiled templates.
        },
        files: {
          '.temp/scripts/bs-core.js': '<%= projectSettings.applicationSource %>/templates/views/item-pane.hbs',
          '.temp/scripts/bs-basic.js': [
            '<%= projectSettings.applicationSource %>/templates/components/bs-page-header.hbs',
            '<%= projectSettings.applicationSource %>/templates/components/bs-well.hbs',
            '<%= projectSettings.applicationSource %>/templates/components/bs-panel.hbs',
          ],
          '.temp/scripts/bs-alert.js': '<%= projectSettings.applicationSource %>/templates/components/bs-alert.hbs',
          '.temp/scripts/bs-label.js': '<%= projectSettings.applicationSource %>/templates/components/bs-label.hbs',
          '.temp/scripts/bs-badge.js': '<%= projectSettings.applicationSource %>/templates/components/bs-badge.hbs',
          '.temp/scripts/bs-button.js': '<%= projectSettings.applicationSource %>/templates/components/bs-button.hbs',
          '.temp/scripts/bs-btn-toolbar.js': '<%= projectSettings.applicationSource %>/templates/components/bs-btn-toolbar.hbs',
          '.temp/scripts/bs-progressbar.js': [
            '<%= projectSettings.applicationSource %>/templates/components/bs-progress.hbs',
            '<%= projectSettings.applicationSource %>/templates/components/bs-progressbar.hbs'
          ],
          '.temp/scripts/bs-pills.js': '<%= projectSettings.applicationSource %>/templates/components/bs-pills.hbs',
          '.temp/scripts/bs-modal.js': '<%= projectSettings.applicationSource %>/templates/components/bs-modal.hbs'
        }
      },
      compileShowcase: {
        options: {
          templateName: function(sourceFilePath) {
            return sourceFilePath.substring(sourceFilePath.lastIndexOf('/showcase/') + 1, sourceFilePath.length).replace('showcase/', '');
          },
          namespace: "Ember.TEMPLATES"
        },
        files: {
          '.temp/scripts/showcase-templates.js': '<%= projectSettings.applicationSource %>/templates/showcase/**/*.hbs'
        }
      }
    },

    // Markdown to HTML (or HBS) conversion task.
    markdownConverter: {
      processAll: {
        files: [
          {
            expand: !false, // Enable dynamic expansion.
            src: '<%= projectSettings.applicationSource %>/templates/showcase/show_components/*.md',
            dest: '', // Destination directory (can be overridden by template).
            ext: '.hbs' // Output file extension.
          }
        ],
        options: {
          template: '<%= projectSettings.applicationSource %>/templates/showcase/show_components/template.jst',
          postCompile: function(compiledContent, compilationContext) {
            compiledContent = compiledContent.replace(/\\{\\{/g, "&#123;&#123;");
            compiledContent = compiledContent.replace(/\\}\\}/g, "&#125;&#125;");
            compiledContent = compiledContent.replace(/\&quot\;/g, '"');

            console.log(compiledContent); // Log the final processed content.

            return compiledContent;
          },
          markdownOptions: {
            gfm: !false, // Enable GitHub Flavored Markdown.
            codeLines: {
              before: '<span>', // HTML tag to prepend to code lines.
              after: '</span>'  // HTML tag to append to code lines.
            }
          }
        }
      }
    },

    // JavaScript file bundling with Neuter.
    scriptBundler: {
      demonstrationModule: {
        options: {
          // Function to transform file paths for bundling.
          filepathTransform: function (originalFilePath) {
            return '.temp/' + originalFilePath;
          }
        },
        // Source file(s) for the bundling process.
        src: '.temp/scripts/showcase.js',
        // Destination path for the bundled output.
        dest: '.temp/scripts/showcase-scripts.js'
      }
    }
  });

  // Define the 'dev-host' task for starting the development server.
  taskAutomation.registerTask('dev-host', function (buildOption) {
    if (buildOption === 'release') {
      return taskAutomation.task.run(['build-project', 'browserOpener', 'webServer:distributionServer:keepalive']);
    }

    taskAutomation.task.run([
      'directoryCleaner:development',
      'concurrentTasks:development',
      'scriptBundler:demonstrationModule',
      'webServer:liveReloadServer',
      //'browserOpener', // Automatic browser opening can be enabled here.
      'fileWatcher'
    ]);
  });

  // Define the 'run-tests' task for executing project tests.
  taskAutomation.registerTask('run-tests', [
    'directoryCleaner:development',
    'concurrentTasks:testing',
    'webServer:testServer',
    //'mochaTests' // Uncomment to enable Mocha test execution.
  ]);

  // Define the 'build-project' task for creating a production build.
  taskAutomation.registerTask('build-project', [
    'directoryCleaner:build',
    'useminPrep',
    'concurrentTasks:build',
    'scriptBundler',
    'concat', // Grunt's built-in concat task.
    'fileCopier:preUglify',
    'cssMinifier',
    'uglify', // Grunt's built-in uglify task.
    'fileCopier:build',
    'assetVersioning',
    'useminApply'
  ]);

  // Define the 'default' task, which runs tests and then builds the project.
  taskAutomation.registerTask('default', [
    //'jsCodeLinter', // Uncomment to run JSHint before tests.
    'run-tests',
    'build-project'
  ]);
};