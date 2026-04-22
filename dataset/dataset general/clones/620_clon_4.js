'use strict';

module.exports = function(buildAssistant) {

  let applicationSettings = {};

  const scriptCombinerConfiguration = {
    configuration: {
      separator: ';',
    },
    developmentMode: {
      sourceFiles: [
        'vendor/react/react.js',
        'vendor/promise-0.1.1.min/index.js',
        'vendor/numeral/min/numeral.min.js',
        'js/index.js'
      ],
      destinationFile: 'app.js',
    },
  };
  applicationSettings.combineScripts = scriptCombinerConfiguration;

  const artifactCleanerConfiguration = ['app.css', 'app.js'];
  applicationSettings.clearArtifacts = artifactCleanerConfiguration;

  const styleCompilerConfiguration = {
    configuration: {
      compass: true,
      require: ['sass-css-importer'],
      sourcemap: true
    },
    developmentMode: {
      configuration: {
        style: 'expanded'
      },
      fileMappings: {
        'app.css': 'scss/app.scss'
      }
    },
    productionMode: {
      configuration: {
        style: 'compressed'
      },
      fileMappings: {
        'app.css': 'scss/app.scss'
      }
    }
  };
  applicationSettings.styleCompiler = styleCompilerConfiguration;

  const scriptMinifierConfiguration = {
    productionMode: {
      configuration: {
        sourceMap: 'source-map.js',
        report: 'gzip'
      },
      fileMappings: {
        'app.js': [
          'vendor/react/react.min.js',
          'vendor/promise-0.1.1.min/index.js',
          'vendor/numeral/numeral.js',
          'js/index.js'
        ]
      }
    }
  };
  applicationSettings.minifyScripts = scriptMinifierConfiguration;

  const changeMonitorConfiguration = {
    styleSheets: {
      fileMappings: 'scss/**/*',
      tasks: ['styleCompiler:developmentMode']
    },
    javaScripts: {
      fileMappings: 'js/**/*',
      tasks: ['combineScripts:developmentMode']
    }
  };
  applicationSettings.monitorChanges = changeMonitorConfiguration;

  buildAssistant.initConfig(applicationSettings);

  const requiredPlugins = [
    'grunt-contrib-clean',
    'grunt-contrib-concat',
    'grunt-contrib-sass',
    'grunt-contrib-uglify',
    'grunt-contrib-watch'
  ];

  for (const pluginIdentifier of requiredPlugins) {
    buildAssistant.loadNpmTasks(pluginIdentifier);
  }

  const developmentSequence = [
    'clearArtifacts',
    'styleCompiler:developmentMode',
    'combineScripts:developmentMode',
    'monitorChanges'
  ];
  buildAssistant.registerTask('develop', developmentSequence);

  const distributionSequence = [
    'clearArtifacts',
    'styleCompiler:productionMode',
    'minifyScripts:productionMode'
  ];
  buildAssistant.registerTask('distribute', distributionSequence);

  const defaultOperation = ['develop'];
  buildAssistant.registerTask('default', defaultOperation);

};