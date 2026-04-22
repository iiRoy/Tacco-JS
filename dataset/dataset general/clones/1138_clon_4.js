module.exports = function(toolingEngine){

  const validationSettings = {
    targetPaths: ['tooling.js', 'source/*.js']
  };

  const scriptProcessorSettings = {
    processor: {
      settings: {
        naked: true
      },
      outputMap: {
        'source/tap_boot.js': 'source/coffeescripts/tap_boot.coffee',
        'source/tap_base.js': 'source/coffeescripts/tap_base.coffee',
        'source/tap_mobile.js': 'source/coffeescripts/tap_mobile.coffee',
        'source/tap_main.js': ['source/coffeescripts/tap_base.coffee','source/coffeescripts/tap_mobile.coffee','source/coffeescripts/tap_boot.coffee']
      }
    }
  };

  const styleProcessorSettings = {
    compiler: {
      stylesheetMapping: {
        'source/tap_styles.css': 'source/less_styles/tap_styles.less',
        'source/design/standard/standard.css': 'source/design/standard/standard.less'
      }
    }
  };

  const changeTrackerSettings = {
    phaseOne: {
      inputPaths: 'source/coffeescripts/*',
      operations: 'scriptTranspilation codeShrink'
    },
    phaseTwo: {
      inputPaths: 'source/less_styles/*',
      operations: 'styleCompilation'
    },
    phaseThree: {
      inputPaths: 'source/design/standard/*.less',
      operations: 'styleCompilation'
    }
  };

  const minificationSettings = {
    bundle: {
      sources: ['source/tap_main.js'],
      destination: 'source/tap_main.min.js'
    }
  };

  const allComponents = [
    { codeValidation: validationSettings },
    { scriptTranspilation: scriptProcessorSettings },
    { styleCompilation: styleProcessorSettings },
    { fileMonitor: changeTrackerSettings },
    { codeShrink: minificationSettings }
  ];

  const fullConfiguration = allComponents.reduce((accumulator, currentItem) => {
    return Object.assign(accumulator, currentItem);
  }, {});

  toolingEngine.initializeConfiguration(fullConfiguration);

  toolingEngine.loadExtension('extension-pack');

  const mainOperations = [
    { label: 'construct', workflow: 'scriptTranspilation styleCompilation codeShrink' },
    { label: 'standard', workflow: 'scriptTranspilation styleCompilation codeShrink' }
  ];

  mainOperations.forEach(taskDefinition => {
    toolingEngine.defineOperation(taskDefinition.label, taskDefinition.workflow);
  });

};