/*global module:false require*/
module.exports = function(buildTool) {

  // Configuration for the entire project's build process.
  // This object defines various tasks and their settings.
  buildTool.initConfig({

    // Retrieve package metadata from package.json.
    // This is useful for versioning and other project-specific details.
    projectManifest: buildTool.file.readJSON('package.json'),

    // --- Asset Source Definitions ---
    // This section outlines the various file paths used throughout the build.
    assetSources: {
      // Core Gruntfile itself
      configurationFiles: ['Gruntfile.js'],
      // JavaScript source locations
      scriptUnits: {
        customCode: ['src/js/app/*.js'], // User-written application scripts
        libraryCode: ['src/js/vendors/*.js'] // Third-party JavaScript libraries
      },
      // Stylesheet source locations
      styleUnits: {
        customStyles: ['src/css/core/*.css'], // User-written application styles
        frameworkStyles: ['src/css/vendors/*.css'] // Third-party CSS frameworks/libraries
      },
      // Image assets directory
      visualAssets: 'src/img'
    },

    // --- Task Configurations ---

    // Clean task: Remove generated files and folders.
    // This ensures a fresh build environment.
    cleanArtifacts: {
      options: {
        force: true // Allow cleaning outside current directory if paths are absolute
      },
      buildOutput: [
        'dist/js/',
        'dist/css/',
        'dist/img/',
        'temp/' // Temporary directory for intermediate files
      ]
    },

    // JavaScript Code Quality Linter (JSHint)
    // Ensures coding standards and detects potential errors in JS files.
    jsCodeLinter: {
      // Files to be linted
      sourceFiles: [
        '<%= assetSources.configurationFiles %>',
        '<%= assetSources.scriptUnits.customCode %>'
      ],
      // JSHint options
      lintRules: {
        jquery: true,         // Assume jQuery is available
        smarttabs: true,      // Allow mixed tabs/spaces if aligned
        curly: true,          // Require {} for all control statements
        eqeqeq: true,         // Require === and !==
        immed: true,          // Require immediate invocation of functions wrapped in parens
        latedef: 'nofunc',    // Prohibit use of a variable before its definition
        newcap: true,         // Require capitalization of constructors
        noarg: true,          // Prohibit use of arguments.caller and arguments.callee
        sub: true,            // Suppress warnings about using [] notation for properties
        undef: true,          // Prohibit use of undeclared variables
        boss: true,           // Allow assignments inside conditionals
        eqnull: true,         // Allow == null
        browser: true,        // Assume browser environment
        loopfunc: true,       // Allow functions to be defined in loops
        globals: {            // Define global variables
          jQuery: true,
          console: true,
          module: true,
          require: true
        }
      }
    },

    // Stylesheet Code Quality Linter (CSSLint)
    // Checks for common problems and stylistic errors in CSS files.
    styleCodeQuality: {
      applicationStyles: {
        src: ['<%= assetSources.styleUnits.customStyles %>'],
        qualityOptions: {
          'import': false,                   // Allow @import rules
          'ids': false,                      // Allow IDs in selectors
          'font-sizes': false,               // Allow multiple font-size declarations
          'unqualified-attributes': false,   // Allow unqualified attribute selectors
          'floats': false,                   // Allow floats without width
          'overqualified-elements': false,   // Allow overqualified elements (e.g., div#id)
          'adjoining-classes': false,        // Allow adjoining classes (e.g., .foo.bar)
          'important': false,                // Allow !important
          'box-sizing': false,               // Allow box-sizing property
          'unique-headings': false,          // Allow non-unique headings
          'qualified-headings': false,       // Allow qualified headings (e.g., h1.title)
          'regex-selectors': false,          // Allow regex selectors
          'universal-selector': false,       // Allow universal selector (*)
          'duplicate-properties': true,      // Flag duplicate properties (enabled for stricter check)
          'duplicate-background-images': true, // Flag duplicate background images (enabled)
          'box-model': true,                 // Flag issues with box model (enabled)
          'outline-none': false,             // Allow outline: none
          'text-indent': false,              // Allow text-indent without direction
          'compatible-vendor-prefixes': false, // Allow non-prefixed properties
          'star-property-hack': false,       // Allow * property hack
          'display-property-grouping': false, // Allow display property grouping
          'underscore-property-hack': false  // Allow _ property hack
        }
      }
    },

    // File Bundler (Concatenation)
    // Combines multiple files into a single file.
    resourceBundler: {
      // Bundle all application JavaScript
      appScripts: {
        src: ['<%= assetSources.scriptUnits.customCode %>', '<%= assetSources.scriptUnits.libraryCode %>'],
        dest: 'temp/js/app-scripts.js' // Intermediate bundle
      },
      // Bundle all application CSS
      appStyles: {
        src: ['<%= assetSources.styleUnits.customStyles %>', '<%= assetSources.styleUnits.frameworkStyles %>'],
        dest: 'temp/css/app-styles.css' // Intermediate bundle
      }
    },

    // JavaScript Minification (UglifyJS)
    // Reduces the size of JavaScript files by removing whitespace, comments, and shortening variable names.
    scriptMinification: {
      productionOutput: {
        options: {
          mangle: true, // Change variable and function names
          compress: {
            drop_console: true // Remove console.log statements
          }
        },
        files: {
          'dist/js/bundle.min.js': ['temp/js/app-scripts.js'] // Minify the intermediate bundle
        }
      }
    },

    // Stylesheet Minification (CSSMin)
    // Compresses CSS files by removing unnecessary characters.
    stylesheetMinifier: {
      productionOutput: {
        files: {
          'dist/css/bundle.min.css': ['temp/css/app-styles.css'] // Minify the intermediate bundle
        }
      }
    },

    // Image Optimization (Smushit)
    // Losslessly optimizes image files to reduce their size.
    imageOptimization: {
      targetDirectory: {
        src: '<%= assetSources.visualAssets %>' // Optimize images in this directory
      }
    },

    // File System Watcher
    // Monitors files for changes and re-runs specified tasks.
    fileSystemWatcher: {
      // Watch JavaScript and Gruntfile changes
      jsAndConfig: {
        files: [
          '<%= assetSources.configurationFiles %>',
          '<%= assetSources.scriptUnits.customCode %>',
          '<%= assetSources.scriptUnits.libraryCode %>'
        ],
        tasks: ['jsValidation', 'compileScripts'], // Run specific tasks on change
        options: {
          spawn: false, // For faster updates
          livereload: true // Enable live browser reloading
        }
      },
      // Watch CSS changes
      cssFiles: {
        files: [
          '<%= assetSources.styleUnits.customStyles %>',
          '<%= assetSources.styleUnits.frameworkStyles %>'
        ],
        tasks: ['cssValidation', 'compileStyles'], // Run specific tasks on change
        options: {
          spawn: false,
          livereload: true
        }
      }
    }
  });


  // --- Grunt Plugin Loading ---
  // Load necessary Grunt plugins from npm. Each 'loadNpmTasks' corresponds to a plugin.
  buildTool.loadNpmTasks('grunt-contrib-clean');
  buildTool.loadNpmTasks('grunt-contrib-concat');
  buildTool.loadNpmTasks('grunt-contrib-jshint');
  buildTool.loadNpmTasks('grunt-contrib-watch');
  buildTool.loadNpmTasks('grunt-contrib-uglify');
  buildTool.loadNpmTasks('grunt-contrib-csslint');
  buildTool.loadNpmTasks('grunt-contrib-cssmin');
  buildTool.loadNpmTasks('grunt-smushit'); // This one is not 'contrib', but still loaded.

  // --- Custom Task Registrations ---

  // Task for validating JavaScript code.
  buildTool.registerTask('jsValidation', ['jsCodeLinter']);

  // Task for compiling (bundling and minifying) JavaScript.
  buildTool.registerTask('compileScripts', [
    'resourceBundler:appScripts', // Bundle custom and library JS
    'scriptMinification:productionOutput' // Minify the bundled JS
  ]);

  // Task for validating CSS code.
  buildTool.registerTask('cssValidation', ['styleCodeQuality']);

  // Task for compiling (bundling and minifying) CSS.
  buildTool.registerTask('compileStyles', [
    'resourceBundler:appStyles', // Bundle custom and framework CSS
    'stylesheetMinifier:productionOutput' // Minify the bundled CSS
  ]);

  // The primary development build task.
  // This task performs linting, concatenation, and minification for both JS and CSS.
  // It's designed for rapid development cycles.
  buildTool.registerTask('standardBuild', [
    'cleanArtifacts:buildOutput', // Start with a clean slate
    'jsValidation',               // Validate JS
    'cssValidation',              // Validate CSS
    'compileScripts',             // Process JS
    'compileStyles'               // Process CSS
  ]);

  // The comprehensive production build task.
  // This task executes the standard build process and then optimizes all images.
  // It's intended for preparing assets for deployment.
  buildTool.registerTask('optimizeAssets', [
    'standardBuild',      // Run the full standard build first
    'imageOptimization'   // Then optimize all images
  ]);

  // Register 'standardBuild' as the default task when Grunt is run without arguments.
  buildTool.registerTask('default', ['standardBuild']);

  // Add a "develop" task that runs the default build and then starts watching for changes.
  buildTool.registerTask('develop', ['standardBuild', 'fileSystemWatcher']);
};