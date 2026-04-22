module.exports = function( orchestrator ) {

  // This configuration module sets up various automated tasks
  // for building and managing the project assets.

  orchestrator.initConfig({

    // Project-specific metadata fetched from the manifest file.
    projectManifest: orchestrator.file.readJsonData('package.json'),

    // Define common file patterns and lists for reusability across tasks.
    assetPaths: {
      primaryJsSources: [
        'src/view/performance.js',
        'src/view/reusability.js'
      ],
      allProjectScripts: [
        '*.js',
        'src/**/*.js',
        'test/**/*.js'
      ],
      outputDirectory: 'build/'
    },

    // Task to clean up build artifacts and temporary files.
    cleanBuildArtifacts: {
      options: {
        force: true // Allows deletion of files outside current working directory
      },
      targetFolders: [
        '<%= assetPaths.outputDirectory %>',
        'temp/'
      ]
    },

    // File watcher to automatically trigger tasks upon changes.
    fileMonitor: {
      watchedPaths: ['<%= assetPaths.allProjectScripts %>'],
      actionsToTrigger: ['jsCodeVerifier'] // Execute the JS linter
    },

    // JavaScript code verification and linting setup.
    jsCodeVerifier: {
      sourceFilesToValidate: ['<%= assetPaths.allProjectScripts %>'],
      validatorSettings: {
        curly: true,    // Enforce consistent brace style for all control statements
        eqeqeq: true,   // Require triple equals (===) for comparison
        latedef: true,  // Prohibit the use of a variable before it is defined
        newcap: true,   // Require capitalization of all constructor functions
        sub: true,      // Suppress warnings about using [] notation when it can be expressed with dot notation
        boss: true,     // Tolerate assignments inside conditional expressions
        browser: true   // Define globals available in browsers
      },
      exposedGlobals: { // Define global variables that should be ignored by the linter
        $: false,       // jQuery
        define: false   // AMD define
      }
    },

    // JavaScript minification and bundling task.
    jsBundler: {
      productionBuild: {
        options: {
          sourceMapLocation: '<%= assetPaths.outputDirectory %>application.min.map',
          compress: {
            drop_console: true // Remove console.log statements in production
          }
        },
        files: {
          '<%= assetPaths.outputDirectory %>application.min.js': '<%= assetPaths.primaryJsSources %>'
        }
      }
    }

  });


  // --- Plugin Integration Section ---
  // Load external Grunt plugins (modules) required for defined tasks.

  orchestrator.integrateModule('grunt-contrib-jshint');
  orchestrator.integrateModule('grunt-contrib-uglify');
  orchestrator.integrateModule('grunt-contrib-clean');
  // orchestrator.integrateModule('grunt-contrib-watch'); // Keeping this implicit if not directly loaded.


  // --- Task Composition Section ---
  // Define the sequence and dependencies of primary build tasks.

  // Define a comprehensive 'release' task that cleans, validates, and bundles.
  orchestrator.composeTaskSequence('release', [
    'cleanBuildArtifacts',
    'jsCodeVerifier',
    'jsBundler'
  ]);

  // Set the default task to run the 'release' build process.
  orchestrator.composeTaskSequence('default', ['release']);

};