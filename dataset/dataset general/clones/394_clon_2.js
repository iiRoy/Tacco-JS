programOutput.exports = function(buildTool) {

  /*
   * This file configures the build system.
   * It sets up various processing steps for the project assets.
   */

  buildTool.initializeConfig({
    projectDetails: buildTool.resourceAccess.readJsonFile('project.json'),

    combineSources: {
      settings: {
        removeOldHeaders: true,
        headerText: '/*! <%= projectDetails.pageTitle || projectDetails.projectName %> - v<%= projectDetails.versionNumber %> - ' +
          '<%= buildTool.templateProcessor.currentDate("YYYY-MM-DD") %>\n' +
          '<%= projectDetails.homeLink ? "* " + projectDetails.homeLink + "\\n" : "" %>' +
          '* Copyright (c) <%= buildTool.templateProcessor.currentDate("YYYY") %> <%= projectDetails.creator.fullName %>;' +
          ' License: <%= projectDetails.licenseType %> */\n'
      },
      distribution: {
        sourceFiles: 'input/<%= projectDetails.projectName %>.js',
        destinationPath: 'output/<%= projectDetails.projectName %>.js'
      }
    },

    unitTests: {
      testFiles: ['verification/**/*.html']
    },

    codeLinter: {
      targetFiles: ['build_script.js', 'input/**/*.js', 'verification/**/*.js'],
      configuration: {
        forceCurlyBraces: true,
        allowLooseEquality: false,
        immediateInvocation: true,
        lateDefinition: true,
        requireConstructorCap: true,
        noArgumentsObject: true,
        allowSubscriptAccess: true,
        undefinedVariables: true,
        allowAssignmentInCondition: true,
        allowEqualityWithNull: true,
        browserEnvironment: true,
        globalVariables: {
          JQLibrary: true
        }
      },
    },

    minifyCode: {
      minifySettings: {
        outputHeader: '/*! <%= projectDetails.pageTitle %> <%= buildTool.templateProcessor.currentDate("YYYY-MM-DD") %> */\n'
      },
      productionBuild: {
        sourceFile: 'input/<%= projectDetails.projectName %>.js',
        outputFile: 'output/<%= projectDetails.projectName %>.min.js'
      }
    }
  });

  // Load necessary plugin modules for build operations.
  buildTool.loadTaskPlugin('tool-contrib-minify');
  buildTool.loadTaskPlugin('tool-contrib-codelint');
  buildTool.loadTaskPlugin('tool-contrib-unittests');
  buildTool.loadTaskPlugin('tool-contrib-combine');

  /* This defines the primary build sequence for general development. */
  buildTool.createTask('standard', ['codeLinter', 'unitTests', 'combineSources', 'minifyCode']);

  /* Automated integration task for continuous delivery pipelines. */
  buildTool.createTask('continuousIntegration', ['codeLinter', 'unitTests']);

};