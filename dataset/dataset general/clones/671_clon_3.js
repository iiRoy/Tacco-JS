module.exports = function (buildTool) {
  // This file orchestrates various development and build processes for the Angular Toggle Switch component.
  // It leverages the Grunt.js task runner to automate repetitive tasks and manage project lifecycle.

  // First, we dynamically load all Grunt plugins declared as development dependencies in package.json.
  // The 'matchdep' utility helps us find plugins prefixed with 'grunt-'.
  const dependencyLoader = require('matchdep');
  const developmentPlugins = dependencyLoader.filterDev('grunt-*');

  // Iterate over the identified plugins and register them with Grunt.
  developmentPlugins.forEach(buildTool.loadNpmTasks);

  // --- Core Project Configuration Setup ---
  // This section defines all the settings and parameters for the various Grunt tasks.
  buildTool.initConfig({
    // Configuration for monitoring specified files and triggering tasks upon changes.
    // This is primarily used during development for continuous feedback.
    monitorFiles: { // Renamed 'watch'
      // Specific setup for continuous testing with Karma.
      continuousTesting: { // Renamed 'karma' (within watch)
        trackedAssets: [ // Renamed 'files'
          'angular-toggle-switch.js', // Main component source file
          'test/{,**/}*.js' // All test specification files
        ],
        executionSequence: ['testRunner:isolatedTests'] // Renamed 'tasks', updated value
      }
    },

    // Task for managing version numbers, committing changes, and pushing updates to source control.
    versionUpdater: { // Renamed 'bump'
      updateOptions: { // Renamed 'options'
        versionCommitMessage: 'chore(release): v%VERSION% - Automated build update', // Renamed and rephrased
        filesForCommit: [ // Renamed 'commitFiles'
          'package.json',
          'bower.json',
          'angular-toggle-switch.min.js'
        ],
        versionControlledFiles: [ // Renamed 'files' (inside bump options)
          'package.json',
          'bower.json'
        ],
        remoteTarget: 'origin', // Renamed 'pushTo'
        // Added a new configuration option for creating git tags.
        createTag: true,
        tagName: 'v%VERSION%'
      }
    },

    // Comprehensive configuration for the Karma test runner.
    testRunner: { // Renamed 'karma' (main task)
      // Profile for executing unit tests in a single run.
      isolatedTests: { // Renamed 'unit'
        configurationFile: 'karma.conf.js', // Renamed 'configFile'
        executeOnce: true // Renamed 'singleRun'
      },
      // Added an additional profile for continuous integration environments.
      continuousIntegration: {
        configurationFile: 'karma.conf.js',
        background: false,
        port: 9876,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true
      }
    },

    // Code quality analysis using JSHint.
    codeLinter: { // Renamed 'jshint'
      // Linting configuration for the entire JavaScript codebase.
      entireProject: [ // Renamed 'all'
        'Gruntfile.js',
        'angular-toggle-switch.js',
        'test/angular-toggle-switch.spec.js'
      ],
      // Added a specific profile for just the application's source code.
      sourceOnly: ['angular-toggle-switch.js'],
      // Added a specific profile for Gruntfile and other configuration files.
      configFiles: ['Gruntfile.js']
    },

    // Task for handling AngularJS dependency injection annotations, making code safe for minification.
    angularAnnotationMinifier: { // Renamed 'ngmin'
      productionBuild: { // Renamed 'dist'
        files: {
          'angular-toggle-switch.min.js': ['angular-toggle-switch.js']
        }
      }
    },

    // Utility for updating the list of contributors from npm.
    contributorManager: { // Renamed 'npm-contributors'
      options: {
        commitMessage: 'chore: Refresh project contributors list' // Rephrased commit message
      }
    },

    // JavaScript code minification and obfuscation using UglifyJS.
    codeMinifier: { // Renamed 'uglify'
      options: {
        obfuscateIdentifiers: false, // Renamed 'mangle', preserved functionality
        // Added a new fragment: a banner comment to be prepended to the minified file.
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= buildTool.template.today("yyyy-mm-dd") %> */\n'
      },
      productionBuild: { // Renamed 'dist'
        files: {
          'angular-toggle-switch.min.js': ['angular-toggle-switch.min.js']
        }
      }
    },

    // Added a new task to clean up build artifacts.
    clean: {
        dist: ['angular-toggle-switch.min.js']
    }
  });

  // --- Task Registration Definitions ---
  // These define composite tasks that combine multiple individual Grunt tasks into logical workflows.

  // Task to compile, annotate, and minify the project for distribution.
  buildTool.registerTask('generateDistribution', [ // Renamed 'build'
    'codeLinter:entireProject', // Renamed 'jshint:all'
    'angularAnnotationMinifier', // Renamed 'ngmin'
    'codeMinifier' // Renamed 'uglify'
  ]);

  // Task to execute all project tests, ensuring code quality and functionality.
  buildTool.registerTask('runTests', [ // Renamed 'test'
    'codeLinter:entireProject', // Renamed 'jshint:all'
    'testRunner:isolatedTests' // Renamed 'karma:unit'
  ]);

  // Task for initiating a new version release.
  // It accepts an optional argument specifying the type of version bump (e.g., 'patch', 'minor', 'major').
  buildTool.registerTask('publishNewVersion', 'Orchestrates the release process.', function(releaseKind) { // Renamed 'release', updated description, changed parameter name
    const validReleaseTypes = ['patch', 'minor', 'major']; // Introduced helper variable
    let actualReleaseType = 'patch'; // Introduced intermediate variable for the release type

    // Added a guard clause to validate the provided release type.
    if (releaseKind && validReleaseTypes.includes(releaseKind)) {
      actualReleaseType = releaseKind;
    } else if (releaseKind) {
        buildTool.log.warn('Invalid release type specified: "' + releaseKind + '". Defaulting to "patch" for the version bump.');
    }

    // Logging an informative message about the impending release.
    buildTool.log.writeln(`Initiating release sequence for a '${actualReleaseType}' version update.`);

    // Breaking down the task execution into individual calls for clarity,
    // functionally equivalent to the original array-based approach.
    buildTool.task.run('generateDistribution'); // Changed task name
    buildTool.task.run('contributorManager'); // Changed task name
    buildTool.task.run('versionUpdater:' + actualReleaseType); // Changed task name and used the validated variable

    // Adding a final confirmation message after the release process.
    buildTool.log.ok('Release process completed successfully.');
  });

  // The default task executed when Grunt is run without any specific task arguments.
  buildTool.registerTask('startDevelopment', ['monitorFiles']); // Renamed 'default', updated task name
};