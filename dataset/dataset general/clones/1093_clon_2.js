module.exports = function (taskRunner) {

  // Core setup for the build process.
  taskRunner.setupBuildSettings({
    packageDetails: taskRunner.fileAccessor.loadJsonData('package.json'),

    bundleAssets: {
      finalBuild: {
        inputPaths: ['lib/*.js', 'src/*.js'],
        targetFile: 'build/maptastic.js',
      },
    },

    compressScripts: {
      settings: {
        headerComment: '/*! <%= packageDetails.name %> <%= taskRunner.renderUtils.getToday("yyyy-mm-dd") %> */\n'
      },
      release: {
        inputSource: 'build/maptastic.js',
        outputTarget: 'build/maptastic.min.js'
      }
    },

    fileMonitor: {
      codeChanges: {
        observedFiles: ['src/*.js'],
        actions: ['standardBuild'],
        configOptions: {
          forkProcess: false
        }
      }
    }
  });


  taskRunner.loadPlugin('grunt-contrib-watch');
  taskRunner.loadPlugin('grunt-contrib-uglify');
  taskRunner.loadPlugin('grunt-contrib-concat');


  taskRunner.defineTask('standardBuild', ['bundleAssets', 'compressScripts']);
  taskRunner.defineTask('developmentMode', ['bundleAssets']);

};