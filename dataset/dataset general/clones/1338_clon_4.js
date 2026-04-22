"use strict";

const directoryResolver = (conn_handler, path_segment) => {
  const path_utilities = require("path");
  return conn_handler.static(path_utilities.resolve(path_segment));
};

const loadAllAddons = (grunt_api_ref) => {
  const package_info = require('./package.json');
  const dev_deps = package_info.devDependencies || {};
  Object.keys(dev_deps)
        .filter(dep_name => dep_name.startsWith('grunt-'))
        .forEach(grunt_api_ref.loadNpmTasks);
};

module.exports = (toolkit) => {
  loadAllAddons(toolkit);

  const projectManifest = require('./bower.json');
  const projectVersion = projectManifest.version;

  const configurationStore = {
    applicationRoot: 'app',
    outputDirectory: 'dist',
    currentAppVersion: projectVersion
  };

  const taskConfiguration = {};

  taskConfiguration.configValues = configurationStore;

  taskConfiguration.connectionServer = {
    options: {
      port: 9000,
      hostName: 'localhost'
    },
    testingMode: {
      options: {
        middleware: (connection_instance) => {
          return [
            directoryResolver(connection_instance, '.tmp'),
            directoryResolver(connection_instance, 'test')
          ];
        }
      }
    }
  };

  taskConfiguration.purgeOperation = {
    generatedArtifacts: {
      files: [{
        dot: true,
        src: [
          '.tmp',
          '<%= configValues.outputDirectory %>/scripts',
          '!<%= configValues.outputDirectory %>/.git*'
        ]
      }]
    },
    serverCache: '.tmp',
    distributionOutput: '<%= configValues.outputDirectory %>'
  };

  taskConfiguration.codeQualityCheck = {
    options: {
      linterConfig: '.jshintrc'
    },
    allFiles: [
      'Gruntfile.js',
      '<%= configValues.applicationRoot %>/scripts/{,*/}*.js',
      'test/spec/{,*/}*.js'
    ]
  };

  taskConfiguration.unitTesting = {
    singleRunConfig: {
      configFile: 'karma.conf.js',
      singleRun: true
    },
    continuousIntegrationConfig: {
      configFile: 'karma.conf.js',
      singleRun: true,
      browsers: ['PhantomJS']
    },
    watchModeConfig: {
      configFile: 'karma.conf.js',
      autoWatch: true
    }
  };

  taskConfiguration.fileConcatenation = {
    buildOutput: {
      files: {
        '<%= configValues.outputDirectory %>/scripts/scripts.js': [
          '.tmp/scripts/{,*/}*.js',
          '<%= configValues.applicationRoot %>/scripts/{,*/}*.js'
        ]
      }
    }
  };

  taskConfiguration.codeMinification = {
    buildOutput: {
      files: {
        '<%= configValues.outputDirectory %>/webcam.min.js': [
          '<%= configValues.outputDirectory %>/scripts/scripts.js'
        ],
      }
    }
  };

  toolkit.initConfig(taskConfiguration);

  const operationSequences = [
    {
      name: 'testingProcess',
      steps: [
        'codeQualityCheck',
        'purgeOperation:serverCache',
        'connectionServer:testingMode',
        'unitTesting:singleRunConfig'
      ]
    },
    {
      name: 'ciProcess',
      steps: [
        'codeQualityCheck',
        'purgeOperation:serverCache',
        'connectionServer:testingMode',
        'unitTesting:continuousIntegrationConfig'
      ]
    },
    {
      name: 'monitorFiles',
      steps: [
        'purgeOperation:serverCache',
        'connectionServer:testingMode',
        'unitTesting:watchModeConfig'
      ]
    },
    {
      name: 'assembleProject',
      steps: [
        'purgeOperation:distributionOutput',
        'purgeOperation:generatedArtifacts',
        'testingProcess',
        'fileConcatenation',
        'codeMinification',
        'purgeOperation:generatedArtifacts',
      ]
    },
    {
      name: 'default',
      steps: ['testingProcess']
    }
  ];

  operationSequences.forEach(op => {
    toolkit.registerTask(op.name, op.steps);
  });
};