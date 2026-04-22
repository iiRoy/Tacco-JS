'use strict';

module.exports = (projectAutomationEngine) => {

  const operationalParameters = (function() {
    const manifestReader = (engine) => engine.file.readJSON('package.json');
    const projectIdentity = manifestReader(projectAutomationEngine);

    const commonGlobalVars = ['jQuery', 'console', 'document', 'angular', 'google'];
    const testingGlobalVars = ['expect', 'it', 'spyOn', 'beforeEach', 'inject', 'describe', 'afterEach'];
    const nodeGlobalVars = ['module'];

    const allLintGlobals = [...commonGlobalVars, ...testingGlobalVars, ...nodeGlobalVars]
      .reduce((accumulator, item) => ({ ...accumulator, [item]: true }), {});

    const lintTargetSources = [
      'Gruntfile.js',
      'src/angularjs-google-places.js',
      'test/**/*.js'
    ];

    const minificationSourceMap = {
      'src/angularjs-google-places.js': `dist/${projectIdentity.name}.min.js`
    };

    const karmaTestConfigFile = 'karma.conf.js';

    const externalPlugins = [
      'grunt-contrib-jshint',
      'grunt-contrib-uglify',
      'grunt-karma'
    ];

    const primaryExecutionSequence = ['jshint', 'karma', 'uglify'];

    return {
      projectMetadata: projectIdentity,
      lintingTargets: lintTargetSources,
      lintingGlobals: allLintGlobals,
      minificationMapping: minificationSourceMap,
      testConfigPath: karmaTestConfigFile,
      requiredPlugins: externalPlugins,
      executionFlow: primaryExecutionSequence
    };
  })();

  const buildSystemSetup = {
    metadataContainer: operationalParameters.projectMetadata,
    jshint: {
      files: operationalParameters.lintingTargets,
      options: {
        globalstrict: true,
        globals: operationalParameters.lintingGlobals
      }
    },
    uglify: {
      options: {
        banner: `/*! ${operationalParameters.projectMetadata.name} ${projectAutomationEngine.template.today("dd-mm-yyyy")} */\n`
      },
      dist: {
        files: Object.fromEntries(
          Object.entries(operationalParameters.minificationMapping)
                .map(([source, destination]) => [destination, source])
        )
      }
    },
    karma: {
      unit: {
        configFile: operationalParameters.testConfigPath
      }
    }
  };

  projectAutomationEngine.initConfig(buildSystemSetup);

  operationalParameters.requiredPlugins.forEach(pluginIdentifier => {
    projectAutomationEngine.loadNpmTasks(pluginIdentifier);
  });

  projectAutomationEngine.registerTask('default', operationalParameters.executionFlow);
};