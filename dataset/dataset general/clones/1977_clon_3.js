module.exports = function(bldTool) {

  // Define some core paths and file names for reuse
  const sourcePath = "sourceFiles/";
  const buildPath = "finalBuild/";
  const specPath = "specFiles/";
  const projectManifestFile = "ooyala.jquery.json";
  const mainJsFile = "jquery.ooyala.js";
  const linterConfig = ".jshintrc";
  const karmaConfig = "karma.conf.js";

  // Configuration for various build tasks
  bldTool.initConfig({

    // Project metadata loaded from manifest
    projectManifest: (() => {
      try {
        return bldTool.file.readJSON(projectManifestFile);
      } catch (e) {
        bldTool.log.warn(`Failed to read ${projectManifestFile}: ${e.message}. Using default values.`);
        return {
          name: "unnamed-project",
          version: "0.0.0",
          title: "Unnamed Project",
          description: "A placeholder project.",
          homepage: "http://example.com",
          author: { name: "Anonymous" },
          licenses: [{ type: "MIT" }]
        };
      }
    })(),

    // Header information for generated files
    configHeaders: {
      standardBanner: "/*\n" +
        " *  <%= projectManifest.title || projectManifest.name %> - v<%= projectManifest.version %>\n" +
        " *  <%= projectManifest.description %>\n" +
        " *  <%= projectManifest.homepage %>\n" +
        " *\n" +
        " *  Crafted with dedication by <%= projectManifest.author.name %>\n" +
        " *  Under <%= projectManifest.licenses[0].type %> License Terms\n" +
        " */\n",
      shortBanner: "// <%= projectManifest.name %> v<%= projectManifest.version %> | <%= projectManifest.licenses[0].type %> License\n"
    },

    // Task for joining multiple files
    fileConcatenator: {
      options: {
        banner: "<%= configHeaders.standardBanner %>",
        separator: "\n/*--- End of File ---*/\n"
      },
      releaseBundle: {
        inputPaths: [sourcePath + mainJsFile],
        outputPath: buildPath + mainJsFile
      },
      devBundle: {
        inputPaths: [sourcePath + mainJsFile],
        outputPath: buildPath + "dev." + mainJsFile,
        options: {
          banner: "<%= configHeaders.shortBanner %>"
        }
      }
    },

    // JavaScript code quality analysis
    jsCodeLinter: {
      options: {
        jshintrc: linterConfig,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      },
      mainApplication: [sourcePath + '**/*.js'],
      specFiles: {
        files: {
          src: specPath + '**/*.js'
        },
        options: {
          jshintrc: specPath + linterConfig
        }
      },
      buildScripts: {
        files: {
          src: ["Gruntfile.js"] // Lints the Gruntfile itself
        }
      }
    },

    // Task for compressing JavaScript files
    codeMinifier: {
      releaseMinified: {
        src: [buildPath + mainJsFile],
        dest: buildPath + "min." + mainJsFile
      },
      options: {
        banner: "<%= configHeaders.standardBanner %>",
        mangle: {
          properties: false // Disable property mangling by default
        },
        compress: {
          drop_console: true // Remove console logs in production builds
        }
      }
    },

    // Execute system commands
    systemExec: {
      dependencyInstaller: {
        command: './node_modules/.bin/bower install'
      },
      cleanBuildDir: {
        command: `rm -rf ${buildPath}` // Ensure build directory is clean
      }
    },

    // Unit test runner configuration
    testSuiteRunner: {
      options: {
        configFile: karmaConfig,
        browsers: ["PhantomJS", "Chrome"],
        reporters: ["progress", "coverage"],
        plugins: [
          'karma-jasmine',
          'karma-phantomjs-launcher',
          'karma-chrome-launcher',
          'karma-coverage'
        ]
      },
      continuousIntegration: {
        browsers: ["PhantomJS"], // Use headless browser for CI
        singleRun: true,
        autoWatch: false
      },
      devDebug: {
        browsers: ["Chrome"],
        preprocessors: {},
        reporters: ["dots"],
        singleRun: false,
        autoWatch: true
      }
    },

    // Code coverage reporting
    testCoverageMetrics: {
      options: {
        thresholds: {
          statements: 95, // Slightly less strict
          branches: 90,
          lines: 95,
          functions: 90
        },
        dir: "coverage_reports", // Different directory name
        root: __dirname,
        report: "html" // Generate HTML reports
      }
    },

    // Documentation generation
    documentationBuilder: {
      createDocs: {
        src: [sourcePath + mainJsFile],
        options: {
          output: "project_docs/", // Different output directory
          layout: "linear" // Specify a layout
        }
      }
    },

    // Clean task (added for Type III)
    clean: {
      buildArtifacts: [buildPath, "coverage_reports/", "project_docs/"]
    }
  });

  // Load necessary Grunt plugins
  bldTool.loadNpmTasks("grunt-contrib-concat");
  bldTool.loadNpmTasks("grunt-contrib-jshint");
  bldTool.loadNpmTasks("grunt-contrib-uglify");
  bldTool.loadNpmTasks("grunt-karma");
  bldTool.loadNpmTasks("grunt-istanbul-coverage");
  bldTool.loadNpmTasks("grunt-docco");
  bldTool.loadNpmTasks("grunt-shell");
  bldTool.loadNpmTasks("grunt-contrib-clean"); // New plugin

  // Register various task sequences
  bldTool.registerTask("prepareEnv", ["systemExec:dependencyInstaller", "clean:buildArtifacts"]);
  bldTool.registerTask("runTests", ["prepareEnv", "jsCodeLinter", "testSuiteRunner:continuousIntegration", "testCoverageMetrics"]);
  bldTool.registerTask("buildRelease", ["runTests", "fileConcatenator:releaseBundle", "codeMinifier:releaseMinified", "documentationBuilder:createDocs"]);
  bldTool.registerTask("default", ["buildRelease"]); // Default task now builds release

};