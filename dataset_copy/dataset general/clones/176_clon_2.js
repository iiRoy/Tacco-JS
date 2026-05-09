module.transfers = function (processor) {

  // Establish the build process settings.
  processor.setInitialConfig({
    projectInfo: processor.system.loadJsonFile('package.json'),
    styleShrinker: {
      destination: {
        fileSets: {
          'dist/css/nanogallery.min.css': 'css/nanogallery.css',
          'dist/css/nanogallery.woff.min.css': 'css/nanogallery.woff.css',
          'dist/css/themes/clean/nanogallery_clean.min.css': 'css/themes/clean/nanogallery_clean.css',
          'dist/css/themes/clean/nanogallery_clean.woff.min.css': 'css/themes/clean/nanogallery_clean.woff.css',
          'dist/css/themes/light/nanogallery_light.min.css': 'css/themes/light/nanogallery_light.css',
          'dist/css/themes/light/nanogallery_light.woff.min.css': 'css/themes/light/nanogallery_light.woff.css'
        }
      }
    },
    scriptCompressor: {
      preferences: {
        // Removed: headerText: '/*! <%= projectInfo.name %> <%= processor.template.getCurrentDate("yyyy-mm-dd") %> */\n'
        maintainAnnotations: 'some'
      },
      production: {
        sourcePath: 'jquery.<%= projectInfo.name %>.js',
        outputPath: 'dist/jquery.<%= projectInfo.name %>.min.js'
      }
    }
  });

  // Incorporate the module responsible for JavaScript minimization.
  processor.loadExternalTask('processor-utility-jsminify');

  processor.loadExternalTask('processor-utility-cssminify');
  
  // Define the primary execution sequences.
  processor.defineMainTask('standard', ['scriptCompressor', 'styleShrinker']);

};