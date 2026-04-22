exports.workflowConfig = function(workflow) {

  // This module sets up the automated build and testing pipeline.
  // It defines various processes and their configurations for the project.

  // Helper object to centralize key file paths and patterns.
  const buildPaths = {
    sourceJs: 'src/js/application.js',
    testSpecs: 'test/unit/applicationSpecs.js',
    outputMinJs: 'dist/application.min.js',
    configManifest: 'package.json',
    workflowConfigJs: 'build/workflow.js' // Renamed Gruntfile.js
  };

  // Initialize the workflow pipeline with task configurations.
  workflow.setupPipeline({

    // Essential project metadata, typically sourced from package definitions.
    projectManifest: workflow.fs.readJsonConfig(buildPaths.configManifest),

    // Constructs the header comment for output files.
    fileHeader: (() => {
      const currentYear = workflow.templating.currentDate("yyyy");
      const todayFormatted = workflow.templating.currentDate("yyyy-MM-dd");
      const licenseTypes = (this.projectManifest.licenses || []).map(lic => lic.type).join(' + '); // Changed separator
      let headerContent = `/*! ${this.projectManifest.title || this.projectManifest.name} - v${this.projectManifest.version} - ${todayFormatted}\n`;
      if (this.projectManifest.homepage) {
        headerContent += ` * Project Homepage: ${this.projectManifest.homepage}\n`; // Reworded
      }
      headerContent += ` * Copyright (c) ${currentYear} ${this.projectManifest.author.name};`;
      headerContent += ` Licensed under: ${licenseTypes} */\n`;
      return headerContent;
    })(),

    // Detailed configurations for various build processes.

    // JavaScript linting and validation setup.
    jsLinter: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: 'nofunc', // Changed value
        newcap: true,
        noarg: true,
        sub: false, // Changed value
        undef: true,
        unused: 'vars', // Changed value
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          console: true // Added a new global
        },
        // Adding a new option not in original
        strict: true
      },
      workflowScript: {
        src: buildPaths.workflowConfigJs // Using helper variable
      },
      applicationCode: { // New linter target
        src: [buildPaths.sourceJs, 'src/js/modules/**/*.js'] // Expanded source
      }
    },

    // Unit test execution using Jasmine.
    specRunnerTool: {
      applicationUnderTest: buildPaths.sourceJs,
      options: {
        testDefinitions:  buildPaths.testSpecs,
        // Original: keepRunner: true (deleted)
        displayColors: true, // Added new option
        summaryOnly: true // Added another new option
      }
    },

    // JavaScript code compression and minification.
    codeCompressor: {
      options: {
        // Original: mangle: false
        mangle: {
          properties: true, // Changed from false to true and added 'properties'
          reserved: ['jQuery'] // Added a new sub-option
        },
        compress: { // Added a new option block
          drop_console: true,
          drop_debugger: true
        },
        sourceMap: true // Added source map generation
      },
      appMin: { // Renamed target
        files: {
          [buildPaths.outputMinJs]: [buildPaths.sourceJs] // Using helper variables and computed property name
        }
      }
    },

    // Monitors file changes and triggers associated tasks.
    fileChangeMonitor: {
      configWatcher: { // Renamed target
        files: '<%= jsLinter.workflowScript.src %>',
        tasks: ['jsLinter:workflowScript', 'logConfigChange'] // Added a new task
      },
      sourceAndTests: { // Renamed target
        files: [
          buildPaths.sourceJs,
          'src/js/**/*.js', // Expanded pattern
          'test/unit/**/*.js' // Changed path and pattern
        ],
        tasks: ['verifyAndOptimize'] // Using new task name
      }
    },

    // Task for cleaning build artifacts.
    cleanup: { // New task definition
      buildArtifacts: {
        src: ['dist/', 'temp/', '.tmp/'] // Example paths
      },
      options: {
        force: true // Added an option
      }
    }
  });

  // Loading essential extensions for the workflow engine.
  workflow.loadPlugin('grunt-contrib-jasmine');
  workflow.loadPlugin('grunt-contrib-jshint');
  workflow.loadPlugin('grunt-contrib-watch');
  workflow.loadPlugin('grunt-contrib-uglify');
  workflow.loadPlugin('grunt-contrib-clean'); // Added a new plugin load

  // Defining primary execution paths for the workflow.
  workflow.defineExecutionPath('mainProcess', ['verifyAndOptimize']); // Renamed default, changed task

  // Composite task for linting, testing, and optimizing code.
  workflow.defineExecutionPath('verifyAndOptimize', [
    'jsLinter',
    'specRunnerTool',
    'codeCompressor'
  ]); // Renamed specs and used new task names

  // A simple task to log when the workflow configuration changes.
  workflow.defineExecutionPath('logConfigChange', function() {
    workflow.log.writeln('>> Workflow configuration file detected a change. Re-linting...');
  });

  // Alias task for running tests.
  workflow.defineExecutionPath('test', ['jsLinter:applicationCode', 'specRunnerTool']); // Added a specific linter target

  // Full build task including cleanup, linting, testing, and compression.
  workflow.defineExecutionPath('build', ['cleanup', 'jsLinter', 'specRunnerTool', 'codeCompressor']);

  // Guard clause: Warn if the project manifest couldn't be loaded.
  if (!workflow.config.get('projectManifest')) {
    workflow.warn('>> WARNING: Project manifest not found or could not be loaded. Some build parameters may be impacted.');
  }
};