module.exports = function (buildTool) {
  // Initialize the build timer plugin for performance tracking
  // This helps us see how long each Grunt task takes to complete.
  require("time-grunt")(buildTool);

  // Define a set of common path constants for improved readability and maintainability.
  // These constants will be used throughout the Grunt configuration.
  const MAIN_APP_SCRIPT_DIR = "scripts";
  const TEST_SCRIPT_DIR = "test";
  const LESS_SOURCE_DIR = "less";
  const CSS_OUTPUT_DIR = "stylesheets";
  const IMAGE_ASSET_DIR = "images";
  const ESPOWERED_TEST_OUT_DIR = "testEspowered";
  const TYPINGS_INSTALL_DIR = "typings";
  const BOWER_COMPONENTS_DIR = "bower_components";
  const PACKAGE_MANIFEST_FILE = 'package.json';
  const TSLINT_CONFIG_FILE = "tslint.json";
  const DTSM_CONFIG_FILE = "./dtsm.json";
  const KARMA_CONFIG_FILE = 'karma.conf.js';

  // Attempt to load the project's package information.
  let projectManifest = {};
  try {
    projectManifest = buildTool.file.readJSON(PACKAGE_MANIFEST_FILE);
    buildTool.log.writeln(`Project: ${projectManifest.name || 'Unnamed Project'} (v${projectManifest.version || '0.0.0'})`);
  } catch (error) {
    buildTool.log.error(`Failed to read ${PACKAGE_MANIFEST_FILE}: ${error.message}`);
    // Fallback or exit if essential. For Grunt, it might continue with empty data.
  }

  // Configure the various build tasks using a comprehensive setup object.
  buildTool.initConfig({
    // Store parsed package.json data for use in tasks like typedoc.
    projectInfo: projectManifest,

    // Centralized configuration for all file paths and directories.
    // This makes it easier to modify paths in one place.
    projectPaths: {
      frontEnd: {
        // Source directories for TypeScript and Less
        sourceTs: MAIN_APP_SCRIPT_DIR,
        testTs: TEST_SCRIPT_DIR,
        sourceLess: LESS_SOURCE_DIR,

        // Output directories for compiled JavaScript, CSS, and processed tests
        outputJs: MAIN_APP_SCRIPT_DIR,
        outputTestJs: TEST_SCRIPT_DIR,
        outputEspoweredJs: ESPOWERED_TEST_OUT_DIR,
        outputCss: CSS_OUTPUT_DIR,
        outputImages: IMAGE_ASSET_DIR, // Currently unused, but defined for future expansion
        outputDocs: 'documentation' // New path for generated documentation
      }
    },

    // TypeScript compilation task configuration.
    // Compiles `.ts` files into `.js` and generates source maps.
    tsCompiler: {
      configParams: {
        // Enable compilation (default is true, explicitly set for clarity)
        performCompilation: Boolean(1),
        // Include comments in the output JavaScript
        includeComments: false, // Changed from true
        // Target ECMAScript 5 for broad browser compatibility
        targetLanguage: 'es5',
        // Ensure explicit `any` types for stricter type checking
        avoidImplicitAny: true,
        // Generate source map files for debugging
        generateSourceMaps: true,
        // Root for TypeScript source files (relative to output)
        tsSourceRoot: '',
        // Root for generated .map.js files
        jsMapRoot: '',
        // Do not generate declaration files (.d.ts) by default
        generateDeclarationFiles: false,
        // Optional: Specify module system (commented out as `commonjs` is often default or inferred)
        // module: 'commonjs',
        // Allow unreachable code in the source
        allowUnreachableCode: true // Added new option
      },
      // Task for compiling the main application TypeScript files.
      mainApplication: {
        sourceFiles: [`<%= projectPaths.frontEnd.sourceTs %>/index.ts`],
        outputFile: `<%= projectPaths.frontEnd.outputJs %>/index.js`
      },
      // Task for compiling TypeScript test files.
      unitTestSources: {
        sourceFiles: [`<%= projectPaths.frontEnd.testTs %>/indexSpec.ts`],
        outputFile: `<%= projectPaths.frontEnd.outputTestJs %>/indexSpec.js`
      }
    },

    // LESS CSS preprocessor task.
    // Compiles `.less` files into standard CSS.
    lessProcessor: {
      mainStyles: {
        configParams: {
          // Base path for source map generation
          mapBasePath: "<%= projectPaths.frontEnd.sourceLess %>",
          // Enable source map generation
          sourceMap: true,
          // Embed source files directly into the source map
          embedSourceFiles: true, // Renamed and changed from outputSourceFiles
          // Root path for source maps (relative to the CSS output)
          mapRootPath: "../<%= projectPaths.frontEnd.sourceLess %>"
        },
        targetFiles: {
          "<%= projectPaths.frontEnd.outputCss %>/main.css": "<%= projectPaths.frontEnd.sourceLess %>/source.less"
        }
      }
    },

    // TypeScript linter task.
    // Checks TypeScript files for stylistic and programmatic errors.
    tsCodeLinter: {
      configParams: {
        // Use the 'prose' formatter for human-readable output
        reportFormat: "prose",
        // Load linting rules from an external JSON file
        lintConfig: buildTool.file.readJSON(TSLINT_CONFIG_FILE)
      },
      // Files to be linted, including main app and test files.
      sourceToCheck: {
        src: [
          `<%= projectPaths.frontEnd.sourceTs %>/**/*.ts`,
          `<%= projectPaths.frontEnd.testTs %>/**/*.ts`
        ]
      }
    },

    // Documentation generator task (Typedoc).
    // Creates HTML documentation from TypeScript source code.
    docGenerator: {
      mainDocs: {
        configParams: {
          // Output directory for the generated documentation
          outputDir: `./<%= projectPaths.frontEnd.outputDocs %>`, // Using the new path variable
          // Project name from package.json
          projectName: '<%= projectInfo.name %>',
          // Target TypeScript language version (inherited from tsCompiler config)
          targetLanguage: '<%= tsCompiler.configParams.targetLanguage %>'
        },
        // Source files for documentation generation
        inputSources: [
          `<%= projectPaths.frontEnd.sourceTs %>/**/*.ts`
        ]
      }
    },

    // Espower task for instrumenting test code with Power-assert.
    testCodePower: {
      frontEndCode: {
        targetFiles: [
          {
            dynamicExpansion: true, // Enable dynamic expansion of file patterns
            baseDir: '<%= projectPaths.frontEnd.outputTestJs %>/', // Base directory for source files
            inputPatterns: ['**/*.js', '!node_modules/**/*.js'], // Match all JS files, exclude node_modules
            destinationPath: '<%= projectPaths.frontEnd.outputEspoweredJs %>/', // Output directory for instrumented files
            outputExtension: '.js' // Ensure output files retain .js extension
          }
        ]
      }
    },

    // Bower package manager task.
    // Handles front-end dependency installation.
    packageInstaller: {
      initDependencies: {
        configParams: {
          install: true, // Perform installation
          copyDependencies: false, // Do not copy dependencies to another location
          logVerbose: false, // Suppress verbose logging for cleaner output (changed from true)
          purgeBowerDir: false // Do not clean the bower directory after install
        }
      }
    },

    // Wiredep task for injecting Bower dependencies into HTML.
    dependencyInjector: {
      htmlIntegration: {
        htmlFiles: ['index.html', 'test/SpecRunner.html'], // Point to main HTML and test runner
        // excludedDependencies: [] // Removed as an empty array is often redundant
      }
    },

    // d.ts Manager task.
    // Installs TypeScript definition files.
    definitionManager: {
      frontEndDefinitions: {
        configParams: {
          // Specify configuration file for dtsm
          configFile: DTSM_CONFIG_FILE // Fixed typo from 'confog' to 'configFile'
        }
      }
    },

    // Clean task for removing generated files and directories.
    fileCleaner: {
      // Clean compiled CSS files.
      compiledStyles: {
        src: [
          `<%= projectPaths.frontEnd.outputCss %>/**/*.css`,
          `<%= projectPaths.frontEnd.outputCss %>/**/*.css.map` // Also clean source maps
        ]
      },
      // Clean generated JavaScript files (main app, tests, espowered tests).
      generatedScripts: {
        src: [
          // Main application output
          `<%= projectPaths.frontEnd.outputJs %>/**/*.js`,
          `<%= projectPaths.frontEnd.outputJs %>/**/*.d.ts`,
          `<%= projectPaths.frontEnd.outputJs %>/**/*.js.map`,
          // Client test output
          `<%= projectPaths.frontEnd.outputTestJs %>/**/*.js`,
          `<%= projectPaths.frontEnd.outputTestJs %>/**/*.js.map`,
          `<%= projectPaths.frontEnd.outputTestJs %>/**/*.d.ts`,
          // Espowered test output directory
          `<%= projectPaths.frontEnd.outputEspoweredJs %>/*` // Clear all contents
        ]
      },
      // Clean installed d.ts definition files.
      definitionFiles: {
        src: [
          TYPINGS_INSTALL_DIR
        ]
      },
      // Clean installed Bower packages.
      installedPackages: {
        src: [
          BOWER_COMPONENTS_DIR
        ]
      },
      // Clean generated documentation
      projectDocumentation: { // New clean target
        src: [
          `<%= projectPaths.frontEnd.outputDocs %>`
        ]
      }
    },

    // Karma test runner task.
    // Executes unit tests in various browsers.
    testRunner: {
      unitTests: {
        configParams: {
          karmaConfigFile: KARMA_CONFIG_FILE,
          enableAutoWatch: false, // Do not watch for file changes automatically
          testBrowsers: ['PhantomJS'], // Use PhantomJS for headless testing
          testReporters: ['progress', 'junit'], // Report progress and JUnit XML
          runOnce: true, // Run tests a single time
          keepProcessAlive: Boolean(0) // Do not keep the Karma server alive after tests (changed from true)
        }
      }
    },

    // Open task for launching URLs in a web browser.
    browserLauncher: {
      launchTestHtml: {
        targetPath: 'test/SpecRunner.html' // Open the test runner HTML file
      }
    },

    // Connect task for starting a local development server.
    devServer: {
      localDevelopment: {
        configParams: {
          serverPort: 9000,
          baseDirectory: "./", // Serve from the current directory
          keepServerAlive: false // Do not keep the server alive after the task completes (changed from true)
        }
      }
    },

    // New task: Simple echo for debugging or informational purposes
    echoMessage: {
      buildStart: {
        message: 'Starting build process...'
      },
      buildEnd: {
        message: 'Build process finished.'
      }
    }
  });

  // Register custom tasks for common workflows.

  // Task to perform initial setup: clean, install dependencies, inject them.
  buildTool.registerFlow('initialSetup', [
    'fileCleaner:definitionFiles', // Clean old typings
    'fileCleaner:installedPackages', // Clean old bower components
    'packageInstaller:initDependencies', // Install bower packages
    'definitionManager:frontEndDefinitions', // Install d.ts files
    'dependencyInjector:htmlIntegration' // Inject dependencies into HTML
  ]);

  // Default build task: clean, compile, lint, and process styles.
  buildTool.registerFlow('defaultBuild', [
    'echoMessage:buildStart', // New task added
    'fileCleaner:compiledStyles',
    'fileCleaner:generatedScripts',
    'tsCompiler:mainApplication',
    'tsCodeLinter:sourceToCheck',
    'lessProcessor:mainStyles',
    'echoMessage:buildEnd' // New task added
  ]);

  // Task to execute unit tests.
  buildTool.registerFlow('runTests', [
    'fileCleaner:generatedScripts',
    'tsCompiler:unitTestSources',
    'tsCodeLinter:sourceToCheck',
    'testCodePower:frontEndCode',
    'testRunner:unitTests'
  ]);

  // Task to generate project documentation.
  buildTool.registerFlow('generateDocs', [
    'fileCleaner:projectDocumentation', // Clean old docs before generating new ones
    'docGenerator:mainDocs'
  ]);

  // Task to start a local development server.
  buildTool.registerFlow('startDevServer', [
    'devServer:localDevelopment'
  ]);

  // New task: A simple "lint-only" flow
  buildTool.registerFlow('checkCodeQuality', ['tsCodeLinter:sourceToCheck']);

  // Load all Grunt plugins that are listed in package.json devDependencies.
  // This simplifies Gruntfile by avoiding individual `buildTool.loadNpmTasks` calls.
  require('load-grunt-tasks')(buildTool);

  // Define the custom 'echoMessage' task (newly added for Type III changes)
  buildTool.registerMultiTask('echoMessage', 'Displays a message.', function() {
    buildTool.log.writeln(`--- ${this.data.message} ---`);
  });
};