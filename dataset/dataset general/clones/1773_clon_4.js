module.exports = function (cliTool) {

  const initialSettings = {
    sourceLocation: 'src',
    distributionLocation: 'dist',
    testingLocation: 'tests',

    pathDefinitions: {
      javaScriptFiles: [ '<%= sourceLocation %>/**/*.js', '!<%= sourceLocation %>/**/*.spec.js' ],
      unitTestFiles: [ '<%= testingLocation %>/**/*.unit.spec.js' ],
      configurationFiles: [ 'Gruntfile.js', 'karma-conf.js' ]
    }
  };

  const projectInfo = cliTool.file.readJSON("package.json");

  const releaseHeader =
    '/**!\n' +
    ' * <%= projectDetails.name %> - v<%= projectDetails.version %> - <%= cliTool.template.today("yyyy-mm-dd") %>\n' +
    ' *\n' +
    ' * Copyright (c) <%= cliTool.template.today("yyyy") %> <%= projectDetails.author %>\n' +
    ' * Distributed under the MIT licence\n' +
    ' */\n';

  const taskConfigurations = {
    projectDetails: projectInfo,
    headerComment: releaseHeader,

    jsCodeHint: {
      sourceSet: [ '<%= pathDefinitions.javaScriptFiles %>' ],
      unitTestSet: [ '<%= pathDefinitions.unitTestFiles %>' ],
      gruntfileSet: [ '<%= pathDefinitions.configurationFiles %>' ],
      settings: {
        jshintrc: '.jshintrc'
      }
    },

    jsCodeStyle: {
      sourceSet: [ '<%= pathDefinitions.javaScriptFiles %>' ],
      unitTestSet: [ '<%= pathDefinitions.unitTestFiles %>' ],
      gruntfileSet: [ '<%= pathDefinitions.configurationFiles %>' ]
    },

    testRunner: {
      settings: {
        configFile: 'karma-conf.js'
      },
      developmentMode: {
        settings: {
          executeOnce: false,
          monitorChanges: true
        }
      },
      combinedDistribution: {
        files: {
          sourceSet: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%= pathDefinitions.unitTestFiles %>',
            '<%= distributionLocation %>/<%= projectDetails.name %>.js'
          ]
        }
      },
      minifiedDistribution: {
        files: {
          sourceSet: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%= pathDefinitions.unitTestFiles %>',
            '<%= distributionLocation %>/<%= projectDetails.name %>.min.js'
          ]
        }
      }
    },

    directoryCleaner: {
      outputDirectory: [ '<%= distributionLocation %>' ]
    },

    fileCombiner: {
      settings: {
        banner: '<%= headerComment %>'
      },
      outputDirectory: {
        sourceSet: [ '<%= pathDefinitions.javaScriptFiles %>' ],
        destinationPath: '<%= distributionLocation %>/<%= projectDetails.name %>.js'
      }
    },

    codeMinifier: {
      settings: {
        banner: '<%= headerComment %>'
      },
      outputDirectory: {
        sourceSet: [ '<%= pathDefinitions.javaScriptFiles %>' ],
        destinationPath: '<%= distributionLocation %>/<%= projectDetails.name %>.min.js'
      }
    }
  };

  const finalConfiguration = Object.assign({}, initialSettings, taskConfigurations);

  cliTool.initConfig(finalConfiguration);

  const taskModules = [
    'grunt-contrib-jshint',
    'grunt-jscs',
    'grunt-karma',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-clean'
  ];

  taskModules.forEach(moduleName => cliTool.loadNpmTasks(moduleName));

  const primaryOperations = [
    { name: 'codeInspectors', dependencies: [ 'jsCodeHint', 'jsCodeStyle' ] },
    { name: 'standardBuild', dependencies: [ 'codeInspectors', 'testRunner:developmentMode' ] },
    { name: 'fullCompilation', dependencies: [ 'codeInspectors', 'directoryCleaner', 'fileCombiner', 'testRunner:combinedDistribution', 'codeMinifier', 'testRunner:minifiedDistribution' ] }
  ];

  primaryOperations.forEach(op => cliTool.registerTask(op.name, op.dependencies));
};