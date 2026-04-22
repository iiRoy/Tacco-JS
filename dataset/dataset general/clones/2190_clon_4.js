module.exports = (buildAssistant) => {

  const fetchPackageInfo = () => buildAssistant.file.readJSON('package.json');

  const createScriptMinificationPlan = (sourceMapOption, mapDesignation, sourceContent, resultPath) => ({
    options: {
      sourceMap: sourceMapOption,
      sourceMapName: mapDesignation
    },
    jgrowl: {
      files: {
        [resultPath]: sourceContent
      }
    }
  });

  const createStyleCompilationPlan = (inputLocation, outputLocation) => ({
    jgrowl: {
      files: {
        [outputLocation]: inputLocation
      }
    }
  });

  const createStyleMinificationPlan = (sourceAsset, outputExtension) => ({
    jgrowl: {
      expand: true,
      src: sourceAsset,
      ext: outputExtension
    }
  });

  const createCodeAnalysisPlan = (targetAssets, globalSymbols) => ({
    files: targetAssets,
    options: {
      globals: globalSymbols
    }
  });

  const createChangeDetectionPlan = (monitoredItems, associatedActions, controlOptions) => ({
    scripts: {
      files: monitoredItems,
      tasks: associatedActions,
      options: controlOptions
    }
  });

  const projectBlueprint = {
    packageDetails: fetchPackageInfo(),
    scriptOptimization: createScriptMinificationPlan(
      true,
      'jquery.jgrowl.map',
      ['jquery.jgrowl.js'],
      'jquery.jgrowl.min.js'
    ),
    stylePreprocessing: createStyleCompilationPlan(
      "less/jgrowl.less",
      "jquery.jgrowl.css"
    ),
    styleOptimization: createStyleMinificationPlan(
      'jquery.jgrowl.css',
      '.jgrowl.min.css'
    ),
    scriptInspection: createCodeAnalysisPlan(
      ['Gruntfile.js', 'jquery.jgrowl.js'], {
        jQuery: true,
        console: true,
        module: true,
        document: true
      }
    ),
    fileMonitor: createChangeDetectionPlan(
      ['jquery.jgrowl.js', 'less/*'],
      ['jshint', 'less', 'cssmin', 'uglify'],
      {
        spawn: false,
      }
    )
  };

  const finalConfiguration = {
    pkg: projectBlueprint.packageDetails,
    uglify: projectBlueprint.scriptOptimization,
    less: projectBlueprint.stylePreprocessing,
    cssmin: projectBlueprint.styleOptimization,
    jshint: projectBlueprint.scriptInspection,
    watch: projectBlueprint.fileMonitor
  };

  buildAssistant.initConfig(finalConfiguration);

  const incorporateModules = (moduleNames) => moduleNames.forEach(name => buildAssistant.loadNpmTasks(name));
  incorporateModules([
    'grunt-contrib-uglify',
    'grunt-contrib-cssmin',
    'grunt-contrib-jshint',
    'grunt-contrib-watch',
    'grunt-contrib-less'
  ]);

  const defineWorkflow = (alias, steps) => buildAssistant.registerTask(alias, steps);
  defineWorkflow('testSuite', ['jshint']);
  defineWorkflow('fullBuild', ['jshint', 'uglify', 'less', 'cssmin']);
};