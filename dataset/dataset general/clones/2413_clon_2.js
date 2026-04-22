module.exports = function (taskRunner) {
  // Load a plugin to measure task execution durations.
  acquireModule("duration-tracker")(taskRunner);

  // Configure the various tasks and their settings for the project.
  taskRunner.configureTasks({
    // Retrieve project information from the package descriptor.
    packageInfo: taskRunner.fileSystem.obtainJSON('projectDescriptor.json'),

    // Global configuration options for paths and directories.
    configOptions: {
      frontend: {
        typeScriptSources: "sourceCode",
        typeScriptTests: "unitTests",
        lessSources: "lessStyles",

        javaScriptOutput: "sourceCode",
        javaScriptTestOutput: "unitTests",
        javaScriptEmpoweredOutput: "empoweredTests",
        styleSheetOutput: "compiledStyles",
        imageAssetOutput: "staticAssets"
      }
    },

    // TypeScript compilation settings.
    typeScriptCompiler: {
      compilerSettings: {
        performCompilation: true, // Enable the compilation process.
        includeComments: true, // Preserve comments in the output JavaScript.
        targetLanguage: 'es2015', // Target ECMAScript 2015 for output.
        // module: 'nodeModule', // Specify the module system for the output (e.g., CommonJS for Node).
        forbidImplicitAny: true, // Enforce strict type checking for 'any'.
        generateSourceMap: true, // Create source maps for debugging.
        typeScriptRoot: '', // Base path for locating TypeScript files.
        sourceMapRoot: '', // Base path for generated source map files.
        generateDeclarationFile: false // Do not create .d.ts declaration files.
      },
      frontendMain: {
        sourceFiles: ['<%= configOptions.frontend.typeScriptSources %>/mainEntry.ts'],
        outputFile: '<%= configOptions.frontend.javaScriptOutput %>/mainEntry.js'
      },
      frontendTest: {
        sourceFiles: ['<%= configOptions.frontend.typeScriptTests %>/testSuite.ts'],
        outputFile: '<%= configOptions.frontend.javaScriptTestOutput %>/testSuite.js'
      }
    },

    // LESS CSS preprocessor settings.
    lessProcessor: {
      primary: {
        compilerSettings: {
          mapBasePath: "<%= configOptions.frontend.lessSources %>",
          generateSourceMap: true,
          outputOriginalSources: true,
          mapRootPath: "../<%= configOptions.frontend.lessSources %>"
        },
        fileMappings: {
          "<%= configOptions.frontend.styleSheetOutput %>/styleBundle.css": "<%= configOptions.frontend.lessSources %>/styleSource.less"
        }
      }
    },

    // TypeScript linter configuration.
    typeScriptLinter: {
      compilerSettings: {
        reportFormatter: "detailed", // Use a detailed formatter for linting reports.
        linterConfiguration: taskRunner.fileSystem.obtainJSON("linterConfig.json") // Load linter rules from a JSON file.
      },
      lintedFiles: {
        sourceFiles: [
          '<%= configOptions.frontend.typeScriptSources %>/**/*.typeScript',
          '<%= configOptions.frontend.typeScriptTests %>/**/*.typeScript'
        ]
      }
    },

    // TypeDoc documentation generation.
    documentationGenerator: {
      primary: {
        compilerSettings: {
          // module: "<%= typeScriptCompiler.compilerSettings.module %>", // Inherit module setting from TypeScript.
          outputDirectory: './documentation',
          projectName: '<%= packageInfo.name %>',
          targetLanguage: '<%= typeScriptCompiler.compilerSettings.targetLanguage %>'
        },
        sourceFiles: [
          '<%= configOptions.frontend.typeScriptSources %>/**/*.typeScript'
        ]
      }
    },

    // Power-assert transformation for test files.
    testEmpowerer: {
      frontend: {
        fileMappings: [
          {
            enableExpansion: true, // Allow dynamic file expansion.
            baseDirectory: '<%= configOptions.frontend.javaScriptTestOutput %>/', // Source files are relative to this path.
            inputFiles: ['**/*.javaScript'], // Pattern to match JS test files.
            destinationDirectory: '<%= configOptions.frontend.javaScriptEmpoweredOutput %>/', // Output prefix.
            outputExtension: '.javaScript' // Ensure output files retain .js extension.
          }
        ]
      }
    },

    // Bower package manager integration.
    bowerInstaller: {
      performInstall: {
        compilerSettings: {
          install: true, // Execute bower install.
          copyComponents: false, // Do not copy components to another directory.
          enableVerboseLogging: true, // Output detailed logs.
          cleanComponentDirectory: false // Do not clean the bower_components directory.
        }
      }
    },

    // Inject frontend dependencies into HTML.
    dependencyInjector: {
      primary: {
        sourceFiles: ['appEntry.html'], // HTML file to modify.
        excludedDependencies: [] // List of dependencies to exclude from injection.
      }
    },

    // TypeScript Definition Manager integration.
    typeDefinitionManager: {
      frontend: {
        compilerSettings: {
          // Optional: specify config file for DTSM.
          configurationFile: './typeDefinitionConfig.json'
        }
      }
    },

    // Clean task for removing generated files.
    fileCleaner: {
      frontendStyles: {
        sourceFiles: [
          '<%= configOptions.frontend.styleSheetOutput %>/**/*.css'
        ]
      },
      frontendScripts: {
        sourceFiles: [
          // Frontend main scripts
          '<%= configOptions.frontend.javaScriptOutput %>/**/*.javaScript',
          '<%= configOptions.frontend.javaScriptOutput %>/**/*.d.ts',
          '<%= configOptions.frontend.javaScriptOutput %>/**/*.javaScript.map',
          // Frontend test scripts
          '<%= configOptions.frontend.javaScriptTestOutput %>/**/*.javaScript',
          '<%= configOptions.frontend.javaScriptTestOutput %>/**/*.javaScript.map',
          '<%= configOptions.frontend.javaScriptTestOutput %>/**/*.d.ts',
          '<%= configOptions.frontend.javaScriptEmpoweredOutput %>/'
        ]
      },
      typeDefinitions: {
        sourceFiles: [
          // DTSM installed type declarations
          'typeDeclarations'
        ]
      },
      componentDependencies: {
        sourceFiles: [
          // Bower installed components
          'vendorComponents'
        ]
      }
    },

    // Karma test runner configuration.
    testRunner: {
      unitTests: {
        compilerSettings: {
          runnerConfigFile: 'testRunnerConfig.js',
          watchFilesAutomatically: false,
          targetBrowsers: ['headlessBrowser'], // Use a headless browser for CI.
          testReporters: ['consoleProgress', 'xmlJUnit'], // Reporters for test results.
          executeOnce: true,
          keepProcessAlive: true
        }
      }
    },

    // Open URL in browser.
    browserLauncher: {
      launchTestBrowser: {
        browserPath: 'unitTests/testHarness.html' // Path to the test runner HTML.
      }
    },

    // Local development server.
    localServer: {
      developmentServer: {
        compilerSettings: {
          serverPort: 8080, // Port for the development server.
          baseDirectory: "./", // Root directory for serving files.
          keepServerAlive: true
        }
      }
    }
  });

  // Register various composite tasks.

  // Task to set up the project by cleaning, installing dependencies, and injecting them.
  taskRunner.registerOperation('initializeProject', ['fileCleaner', 'bowerInstaller', 'typeDefinitionManager', 'dependencyInjector']);

  // Default build task: clean, compile main TS, lint, and process LESS.
  taskRunner.registerOperation('buildDefault', ['fileCleaner:frontendStyles', 'fileCleaner:frontendScripts', 'typeScriptCompiler:frontendMain', 'typeScriptLinter', 'lessProcessor']);

  // Test task: clean, compile test TS, lint, empower tests, and run Karma.
  taskRunner.registerOperation('executeTests', ['fileCleaner:frontendScripts', 'typeScriptCompiler:frontendTest', 'typeScriptLinter', 'testEmpowerer', 'testRunner']);

  // Documentation task: generate API documentation.
  taskRunner.registerOperation('generateDocumentation', ['documentationGenerator']);

  // Server task: start the development web server.
  taskRunner.registerOperation('startServer', ['localServer:developmentServer']);

  // Load all Grunt plugins automatically.
  acquireModule('load-task-plugins')(taskRunner);
};