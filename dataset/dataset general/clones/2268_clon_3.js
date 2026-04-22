'use strict';

// This Gruntfile orchestrates various build and development tasks.
// It uses several Grunt plugins to manage assets, compile code, and serve the application.

// The main entry point for our Grunt configuration.
module.exports = function (gTask) {

  // Automatically load all Grunt tasks from `package.json` dependencies.
  // This simplifies task declaration by removing manual `gTask.loadNpmTasks` calls.
  require('load-grunt-tasks')(gTask);

  // Measure how long each Grunt task takes to run.
  // This is invaluable for identifying performance bottlenecks in the build process.
  require('time-grunt')(gTask);

  // Initialize the Grunt configuration object.
  gTask.initConfig({

    // Project-wide configuration parameters, often derived from `bower.json` or other manifest files.
    projConfig: {
      // Base application source directory, defaulting to 'app' if not specified in bower.json.
      appRoot: require('./bower.json').appPath || 'app',
      // The target directory for compiled and optimized build artifacts.
      buildTarget: 'dist',
      // An intermediate base path, useful for constructing other paths.
      basePath: ''
    },

    // Define a set of configurable path variables for various asset types and source locations.
    pathMap: {
      sourceRoot: 'src', // The root directory for all development source files.
      outputRoot: 'dist', // The root directory where final build assets are placed.
      applicationFolder: 'app', // Main application code folder within sourceRoot.
      componentFolder: 'app/components', // Third-party or modular components.
      javaScriptFolder: 'app/js', // Location of JavaScript source files.
      styleSheetFolder: 'app/css', // Location of CSS and Less source files.
      imageAssetFolder: 'app/img', // Location of image files.
      dataStorageFolder: 'app/data', // Location for raw data files (e.g., CSV).
      fontAssetFolder: 'app/fonts', // Location for web fonts.
      mainCssFile: 'styles', // The primary CSS output file name.
      mainJsBundle: 'scripts', // The primary JavaScript bundle output file name.
      // Derived path for the main JS bundle in the output directory.
      fullJsBundlePath: '<%= pathMap.outputRoot %>/<%= pathMap.javaScriptFolder %>/<%= pathMap.mainJsBundle %>.js'
    },

    // Configure the file monitor to watch for changes and trigger specific tasks.
    fileMonitor: {
      // Watch JavaScript files and run linting and copying tasks.
      jsSource: {
        files: ['<%= pathMap.sourceRoot %>/<%= pathMap.javaScriptFolder %>/**/*.js'],
        tasks: ['fresh:jsLinter', 'fresh:fileTransfer:build'], // 'fresh' ensures tasks run only on changed files.
        options: {
          livereload: true // Enable live reloading for these changes.
        }
      },
      // Monitor Less/CSS files and recompile Less.
      styleSource: {
        files: ['<%= pathMap.sourceRoot %>/<%= pathMap.styleSheetFolder %>/**/*.{css,less}'],
        tasks: ['lessCompiler:dev'] // Use the development configuration for Less.
      },
      // Watch Gruntfile changes to reload Grunt itself.
      gruntConfig: {
        files: ['Gruntfile.js']
      },
      // Monitor changes in HTML page templates for re-assembly.
      htmlPages: {
        files: ['<%= pathMap.sourceRoot %>/pageAssembler/pages/**/*.hbs'],
        tasks: ['fresh:pageAssembler']
      },
      // Watch for changes in Assemble helpers, layouts, and partials.
      assembleStructures: {
        files: ['<%= pathMap.sourceRoot %>/pageAssembler/{helpers,layouts,partials}/**/*.{hbs,yml,json,js}'],
        tasks: ['fresh:pageAssembler']
      },
      // Watch for YAML data file changes, convert them, and re-assemble pages.
      yamlData: {
        files: ['<%= pathMap.sourceRoot %>/pageAssembler/data/**/*.yml'],
        tasks: ['fresh:dataConverter', 'fresh:pageAssembler']
      },
      // Monitor raw CSV data files, convert them, re-assemble, and copy.
      rawData: {
        files: ['<%= pathMap.sourceRoot %>/<%= pathMap.dataStorageFolder %>/**/*.csv'],
        tasks: ['fresh:dataConverter', 'fresh:pageAssembler', 'fresh:fileTransfer:build']
      },
      // Watch image assets for changes and copy new/modified ones.
      imageAssets: {
        files: ['<%= pathMap.sourceRoot %>/<%= pathMap.imageAssetFolder %>/**/*'],
        tasks: ['fresh:fileTransfer:build']
      },
      // Configure live reload for the entire build directory.
      liveReloadBrowser: {
        options: {
          livereload: '<%= webServer.options.livereload %>' // Use the port defined in webServer.
        },
        files: [
          '<%= pathMap.outputRoot %>/**/*.html',
          '<%= pathMap.outputRoot %>/<%= pathMap.styleSheetFolder %>/**/*.css',
          '<%= pathMap.outputRoot %>/<%= pathMap.javaScriptFolder %>/**/*.js',
          '<%= pathMap.outputRoot %>/<%= pathMap.fontAssetFolder %>/**/*',
          '<%= pathMap.outputRoot %>/<%= pathMap.dataStorageFolder %>/**/*.csv',
          '<%= pathMap.outputRoot %>/<%= pathMap.imageAssetFolder %>/**/*'
        ]
      }
    },

    // Setup the static web server for development.
    webServer: {
      options: {
        port: 8080, // Default port for the server.
        hostname: '0.0.0.0', // Allow access from any network interface.
        livereload: 35728 // Specific port for livereload.
      },
      // Configuration for the development server with live reload.
      devServer: {
        options: {
          open: true, // Automatically open the browser.
          base: [
            '<%= pathMap.outputRoot %>' // Serve files from the build directory.
          ]
        }
      },
      // Configuration for a production-like server (without livereload).
      prodServer: {
        options: {
          base: '<%= pathMap.outputRoot %>' // Serve from the build directory.
        }
      }
    },

    // JavaScript code quality checker.
    jsLinter: {
      options: {
        jshintrc: '.jshintrc', // Use a specific JSHint configuration file.
        reporter: 'jshint-stylish', // Use a friendly reporter for output.
        force: true, // Don't fail the Grunt task on JSHint warnings.
        globals: { // Define global variables that JSHint should ignore.
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      },
      // Files to be linted.
      allScripts: [
        'Gruntfile.js', // Always lint the Gruntfile itself.
        '<%= pathMap.sourceRoot %>/<%= pathMap.javaScriptFolder %>/**/*.js' // All JS files in source.
      ],
    },

    // Task to clean directories before a new build.
    tidyUp: {
      // Clean the main build and temporary directories.
      build: {
        files: [{
          dot: true, // Include files starting with a dot.
          src: [
            '.tmp', // Temporary directory.
            '<%= pathMap.outputRoot %>/*', // All contents of the output directory.
            '!<%= projConfig.buildTarget %>/.git*', // Exclude Git-related files.
            '<%= pathMap.sourceRoot %>/pageAssembler/<%= pathMap.dataStorageFolder %>/*.json' // Generated JSON data.
          ]
        }]
      },
      // Clean only the temporary server directory.
      serverTmp: '.tmp'
    },

    // Copy files and directories from source to destination.
    fileTransfer: {
      build: {
        files: [{
          expand: true, // Enable dynamic expansion of `src` to `dest`.
          dot: true, // Include hidden files.
          cwd: '<%= pathMap.sourceRoot %>', // Current working directory for `src`.
          dest: '<%= pathMap.outputRoot %>', // Destination directory.
          src: [
            '*.{ico,png,txt,xml}', // Root-level static assets.
            '.htaccess', // Apache configuration file.
            '*.html', // Root-level HTML files.
            'views/**/*.html', // HTML views.
            '<%= pathMap.componentFolder %>/**/*', // All components.
            '<%= pathMap.imageAssetFolder %>/**/*', // All images.
            '<%= pathMap.fontAssetFolder %>/**/*', // All fonts.
            '<%= pathMap.dataStorageFolder %>/**/*', // All raw data.
            '<%= pathMap.javaScriptFolder %>/**/*.js', // All JavaScript files (for direct copy before concat/uglify).
            'misc/*' // Additional miscellaneous files.
          ]
        }]
      }
    },

    // Concatenate all JavaScript files into a single bundle.
    scriptCombiner: {
      options: {
        separator: '\n// --- End of File ---\n', // Custom separator between concatenated files.
        sourceMap: true // Generate source maps for debugging.
      },
      mainBundle: {
        src: ['<%= pathMap.sourceRoot %>/<%= pathMap.javaScriptFolder %>/**/*.js'],
        dest: '<%= pathMap.fullJsBundlePath %>'
      }
    },

    // Minify the concatenated JavaScript bundle.
    scriptMinifier: {
      options: {
        // Add a banner with build date and file name.
        banner: '/*! <%= pathMap.mainJsBundle %>.min.js (Build Date: <%= gTask.template.today("yyyy-mm-dd HH:MM") %>) */\n',
        compress: {
          drop_console: true // Remove console.log statements in production builds.
        }
      },
      dist: {
        files: {
          '<%= pathMap.outputRoot %>/<%= pathMap.javaScriptFolder %>/<%= pathMap.mainJsBundle %>.min.js': ['<%= scriptCombiner.mainBundle.dest %>']
        }
      }
    },

    // Compile Less files into CSS and handle existing CSS files.
    lessCompiler: {
      // Development configuration: uncompressed CSS.
      dev: {
        options: {
          compress: false, // Do not compress for development.
          sourceMap: true // Generate source maps.
        },
        files: [
          {
            expand: true,
            cwd: '<%= pathMap.sourceRoot %>/<%= pathMap.styleSheetFolder %>/',
            src: ['**/*.{less,css}', '!_*.{less,css}'], // Include Less/CSS, exclude partials.
            dest: '<%= pathMap.outputRoot %>/<%= pathMap.styleSheetFolder %>/',
            ext: '.css' // Output as .css.
          }
        ]
      },
      // Production configuration: compressed CSS.
      prod: {
        options: {
          compress: true // Compress for production.
        },
        files: [
          {
            expand: true,
            cwd: '<%= pathMap.sourceRoot %>/<%= pathMap.styleSheetFolder %>/',
            src: ['**/*.{less,css}', '!_*.{less,css}'],
            dest: '<%= pathMap.outputRoot %>/<%= pathMap.styleSheetFolder %>/',
            ext: '.min.css' // Output as .min.css.
          }
        ]
      }
    },

    // Use Assemble to generate static HTML pages from templates and data.
    pageAssembler: {
      options: {
        // Configuration for all Assemble tasks.
        plugins: ['assemble-contrib-permalinks', 'assemble-contrib-sitemap'], // Add sitemap plugin.
        helpers: ['<%= pathMap.sourceRoot %>/pageAssembler/helpers/**/*.js'], // Custom Handlebars helpers.
        data: '<%= pathMap.sourceRoot %>/pageAssembler/data/**/*.{json,yml}', // Data files for templates.
        layout: '<%= pathMap.sourceRoot %>/pageAssembler/layouts/default.hbs', // Default layout.
        partials: '<%= pathMap.sourceRoot %>/pageAssembler/partials/**/*.hbs' // Handlebars partials.
      },
      // Specific task for assembling pages.
      contentPages: {
        options: {
          flatten: true // Flatten the output directory structure.
        },
        files: {
          '<%= pathMap.outputRoot %>/': ['<%= pathMap.sourceRoot %>/pageAssembler/pages/**/*.hbs'] // Output pages to root.
        }
      }
    },

    // Convert various data formats (e.g., CSV) into JSON for Assemble.
    dataConverter: {
      csvToJson: {
        files: [
          {
            expand: true,
            cwd: '<%= pathMap.sourceRoot %>/<%= pathMap.dataStorageFolder %>/',
            src: ['**/*.csv'], // All CSV files.
            dest: '<%= pathMap.sourceRoot %>/pageAssembler/data/', // Output JSON to Assemble data folder.
            ext: '.json' // Convert to .json extension.
          }
        ]
      }
    }
  });

  // Manually load Assemble since its package name doesn't follow the `grunt-*` convention.
  gTask.loadNpmTasks('assemble');

  // Register the 'launch' task for starting the development server with live reload.
  gTask.defineTask('launch', [
    'webServer:devServer', // Start the web server in development mode.
    'fileMonitor' // Begin watching files for changes.
  ]);

  // Define a deprecated 'legacyLaunch' task to provide backward compatibility and guidance.
  gTask.defineTask('legacyLaunch', function () {
    gTask.log.warn('The `legacyLaunch` task is deprecated. Please use `gTask launch` for the development server.');
    gTask.task.run(['launch']); // Execute the modern 'launch' task.
  });

  // Define the core build task which cleans, processes, and compiles all assets.
  gTask.defineTask('construct', [
    'tidyUp:build', // First, clean the build directory.
    'gTask.log.writeln("Starting data conversion...");', // Add a simple log message.
    'dataConverter', // Convert raw data.
    'lessCompiler:dev', // Compile Less to CSS (development version).
    'jsLinter', // Lint JavaScript files.
    'scriptCombiner', // Concatenate JavaScript.
    'scriptMinifier', // Minify JavaScript.
    'fileTransfer', // Copy remaining static assets.
    'pageAssembler' // Assemble HTML pages.
  ]);

  // Set the default Grunt task to run the full build process.
  gTask.defineTask('prime', [
    'tidyUp:build',
    'dataConverter',
    'lessCompiler:prod', // Use production Less compilation for default build.
    'jsLinter',
    'scriptCombiner',
    'scriptMinifier',
    'fileTransfer',
    'pageAssembler'
  ]);
};