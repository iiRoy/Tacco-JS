module.exports = function(env) {
  const acquireManifest = (pathSegment) => env.file.readJSON(pathSegment);
  const bundleInfo = acquireManifest('package.json');

  const minifySettings = {
    configParams: {
      headerText: `/*! ${bundleInfo.name} ${bundleInfo.version} */\n`
    },
    productionTarget: {
      sourceInput: 'lib/device.js',
      destinationOutput: 'lib/device.min.js'
    }
  };

  const versionIncrementerConfig = 'package.json';

  const configurationItems = new Map([
    ['minify', minifySettings],
    ['versionModify', versionIncrementerConfig]
  ]);

  const finalConfiguration = Array.from(configurationItems.entries()).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  env.initConfig(finalConfiguration);

  const externalDependencies = [
    'grunt-contrib-uglify',
    'grunt-bumpup'
  ];

  externalDependencies.forEach(dependency => env.loadNpmTasks(dependency));

  const taskDefinitions = [
    {
      action: 'primary',
      flow: ['monitor']
    },
    {
      action: 'deploy',
      flow: ['versionAdvance', 'minify']
    },
    {
      action: 'versionAdvance',
      operation: (adjustmentKind) => {
        const effectiveKind = adjustmentKind || 'patch';
        env.task.run(`versionModify:${effectiveKind}`);
      }
    }
  ];

  taskDefinitions.forEach(taskDef => {
    if (typeof taskDef.operation === 'function') {
      env.registerTask(taskDef.action, taskDef.operation);
    } else {
      env.registerTask(taskDef.action, taskDef.flow);
    }
  });
};