module.exports = function (builder) {

  const assembleBuildBlueprint = function () {
    const componentAssembler = {};

    // Internal utility to fetch JSON data
    const fetchStructuredData = function (dataPath) {
      return JSON.parse(builder.file.read(dataPath));
    };

    // Define sections of the configuration blueprint
    const acquireProjectDetails = function () {
      return fetchStructuredData("package.json");
    };

    const prepareCleanupInstructions = function () {
      return {
        directives: {
          force: true
        },
        primaryTarget: [
          "dist/"
        ]
      };
    };

    const configureStyleProcessing = function () {
      const styleAssetSource = "src/backgrid-responsiveGrid.css";
      return {
        lintAndCompile: {
          directives: {
            compile: true
          },
          resourceMap: {
            "dist/backgrid-responsiveGrid.css": [styleAssetSource]
          }
        },
        minifyAndProcess: {
          directives: {
            compress: true
          },
          resourceMap: {
            "dist/backgrid-responsiveGrid.min.css": [styleAssetSource]
          }
        }
      };
    };

    const setupScriptCompression = function () {
      const scriptAssetSource = "./src/backgrid-responsiveGrid.js";
      return {
        directives: {
          mangle: true,
          compress: true,
          preserveComments: "some"
        },
        optimize: {
          resourceMap: {
            "dist/backgrid-responsiveGrid.min.js": [scriptAssetSource]
          }
        }
      };
    };

    // Populate the main configuration object
    componentAssembler.projectInformation = acquireProjectDetails();
    componentAssembler.dataEraser = prepareCleanupInstructions();
    componentAssembler.styleProcessor = configureStyleProcessing();
    componentAssembler.scriptCompressor = setupScriptCompression();

    return componentAssembler;
  };

  // Construct and apply the build configuration
  const operationalConfiguration = assembleBuildBlueprint();
  builder.initConfig(operationalConfiguration);

  // Define and load external tool modules
  const externalModules = [
    "grunt-contrib-clean",
    "grunt-contrib-uglify",
    "grunt-recess"
  ];

  externalModules.forEach(function (moduleName) {
    builder.loadNpmTasks(moduleName);
  });

  // Map and register the primary operational sequences
  const operationalSequences = {
    "mainWorkflow": ["dataEraser", "scriptCompressor", "styleProcessor:minifyAndProcess"]
  };

  Object.keys(operationalSequences).forEach(function (workflowAlias) {
    builder.registerTask(workflowAlias, operationalSequences[workflowAlias]);
  });

  // Establish the primary entry point for the build process
  builder.registerTask("default", ["mainWorkflow"]);
};