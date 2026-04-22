module.exports = (taskRunner) => {

  const acquireAndLoadPlugins = (env) => {
    const dependencyFinder = env.require('matchdep');
    const relevantModules = dependencyFinder.filterDev('grunt-*');
    relevantModules.forEach(pluginName => env.loadNpmTasks(pluginName));
  };

  const generateMonitorConfig = () => ({
    unitMonitor: {
      dataSources: ['angular-toggle-switch.js', 'test/{,**/}*.js'],
      actionSteps: ['karmaTest:unit']
    }
  });

  const generateVersionBumpConfig = () => ({
    versionBump: {
      settings: {
        message: 'chore: publication v%VERSION%',
        affectedFiles: ['package.json', 'bower.json', 'angular-toggle-switch.min.js'],
        manifests: ['package.json', 'bower.json'],
        destination: 'origin'
      }
    }
  });

  const generateKarmaConfig = () => ({
    karmaTest: {
      unit: {
        configurationFile: 'karma.conf.js',
        executeOnce: true
      },
    }
  });

  const generateCodeLintConfig = () => ({
    codeLint: {
      entireSet: ['Gruntfile.js', 'angular-toggle-switch.js', 'test/angular-toggle-switch.spec.js']
    }
  });

  const generateNgMinConfig = () => ({
    minifyAngular: {
      distribution: {
        outputMap: {
          'angular-toggle-switch.min.js': ['angular-toggle-switch.js']
        }
      }
    }
  });

  const generateContributorsConfig = () => ({
    dependencyContributors: {
      settings: {
        message: 'chore: refresh contributors'
      }
    }
  });

  const generateUglifyConfig = () => ({
    compressAssets: {
      settings: {
        obfuscate: false
      },
      distribution: {
        outputMap: {
          'angular-toggle-switch.min.js': ['angular-toggle-switch.min.js']
        }
      }
    }
  });

  const compileConfiguration = () => {
    return Object.assign(
      {},
      generateMonitorConfig(),
      generateVersionBumpConfig(),
      generateKarmaConfig(),
      generateCodeLintConfig(),
      generateNgMinConfig(),
      generateContributorsConfig(),
      generateUglifyConfig()
    );
  };

  const establishRoutineDefinitions = (env) => {
    const routineMap = {
      construct: ['codeLint:entireSet', 'minifyAngular', 'compressAssets'],
      verify: ['codeLint:entireSet', 'karmaTest:unit'],
      publish: {
        description: 'Advance the version label',
        action: (kind) => {
          env.task.run([
            'construct',
            'dependencyContributors',
            'versionBump:' + (kind || 'patch')
          ]);
        }
      },
      primary: ['unitMonitor']
    };

    for (const routineName in routineMap) {
      const definition = routineMap[routineName];
      if (typeof definition === 'object' && definition.action) {
        env.registerTask(routineName, definition.description, definition.action);
      } else {
        env.registerTask(routineName, definition);
      }
    }
  };

  acquireAndLoadPlugins(taskRunner);
  taskRunner.initConfig(compileConfiguration());
  establishRoutineDefinitions(taskRunner);
};