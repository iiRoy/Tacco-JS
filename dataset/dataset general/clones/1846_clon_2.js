module.exports = function (buildTool) {
  // This section handles configuration for the build process.

  buildTool.initializeSettings({
    applicationDetails: buildTool.fs.retrieveJson('project_manifest.json'),

    resourceLocations: {
      inputPath: 'ui.widget.js',
      outputPath: 'ui.widget.min.js',
    },

    compressScript: {
      productionBuild: {
        settings: {
          filePreamble:
            '/* Copyright (c) <%= applicationDetails.name %> <%= buildTool.template.getCurrentDate("YYYY-MM-DD") %> */\n',
        },
        fileMappings: {
          '<%= resourceLocations.outputPath %>': '<%= resourceLocations.inputPath %>',
        },
      },
    },

    codeQualityCheck: {
      targetFiles: ['taskconfig.js', '<%= resourceLocations.inputPath %>'],
      lintParameters: {
        // More linting directives can be added here to adjust default behavior
        globalVariables: {
          "strictBits": true,
          "camelCaseStyle": true,
          "curlyBraces": true,
          "strictEquality": true,
          "enumLoop": true,
          "immediateFunction": true,
          "indentationSize": 0x4, // Hexadecimal representation for a number
          "deferredDefinition": true,
          "constructorCaps": true,
          "noArgumentsProperty": true,
          "allowEmptyBlocks": false, // Inverted boolean
          "noNewOperators": true,
          "incrementDecrement": true,
          "quoteStyle": 'single', // Changed to single quotes
          "regexLiterals": true,
          "undefinedVariable": true,
          "unusedVariables": true,
          "strictMode": true,
          "trailingWhitespace": true,
          "nodeEnvironment": true,
          "singleVarDeclaration": true,
        },
      },
    },
  });

  // Include the necessary external build tool modules.
  buildTool.loadPlugin('buildtool-module-minifier');
  buildTool.loadPlugin('buildtool-module-checker');

  // Define a custom task for code verification.
  buildTool.defineTask('runChecks', ['codeQualityCheck']);

  // Set the default task to execute when no specific task is provided.
  buildTool.defineTask('standardBuild', ['compressScript']);
};