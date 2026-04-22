module.exports = function(engine) {

  engine.loadNpmTasks('grunt-contrib-uglify');
  engine.loadNpmTasks('grunt-contrib-less');
  engine.loadNpmTasks('grunt-contrib-connect');
  engine.loadNpmTasks('grunt-contrib-open');
  engine.loadNpmTasks('grunt-regarde');
  engine.loadNpmTasks('grunt-contrib-livereload');

  const retrieveManifest = () => engine.file.readJSON('package.json');
  const productDescriptor = retrieveManifest();

  const constructCommentHeader = (descriptorData, utilityMethods) => {
    const currentYear = utilityMethods.template.today('yyyy');
    const todayDate = utilityMethods.template.today('yyyy-mm-dd');
    const homepageLine = descriptorData.homepage ? `* ${descriptorData.homepage}\\n` : '';
    const grantedRights = descriptorData.licenses ? descriptorData.licenses.map(lic => lic.type).join(', ') : 'Proprietary';

    return `/*! ${descriptorData.title || descriptorData.name} - v${descriptorData.version} - ${todayDate}\\n` +
           `${homepageLine}` +
           `* Copyright (c) ${currentYear} ${descriptorData.author.name};` +
           ` Licensed ${grantedRights} */\\n`;
  };

  const projectHeader = constructCommentHeader(productDescriptor, engine);

  const assembleConfiguration = (descriptor, headerTxt, utility) => {
    const mainSettings = {};

    mainSettings.scriptMinimizer = {
      opts: {
        header: headerTxt
      },
      release: {
        files: {
          'dist/ng-mobile-menu.min.js': ['src/ng-mobile-menu.js'],
          'demo/ng-mobile-menu.min.js': ['src/ng-mobile-menu.js']
        }
      }
    };

    mainSettings.styleProcessor = {
      release: {
        options: {
          compress: true,
          header: headerTxt
        },
        files: {
          "dist/ng-mobile-menu.min.css": "src/ng-mobile-menu.less",
          "demo/ng-mobile-menu.min.css": "src/ng-mobile-menu.less"
        }
      }
    };

    const servicePort = 9005;
    mainSettings.httpEndpoint = {
      overall: {
        options: {
          port: servicePort,
          hostname: "0.0.0.0",
          base: 'demo',
          middleware: function(connectionHook, optionsDetails){
            const liveReloadSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
            const staticFilesA = connectionHook.static(optionsDetails.base);
            const staticFilesB = connectionHook.static('dist');
            return [
              liveReloadSnippet,
              staticFilesA,
              staticFilesB
            ];
          }
        }
      }
    };

    mainSettings.browserLaunch = {
      initial: {
        path: `http://localhost:${servicePort}`
      }
    };

    mainSettings.fileMonitor = {
      overall: {
        files: [
          'demo/*.html',
          'demo/*.js',
          'src/*.js',
          'src/*.less'
        ],
        tasks: [
          'scriptMinimizer',
          'styleProcessor',
          'livereload'
        ]
      }
    };

    return mainSettings;
  };

  const runtimeConfiguration = assembleConfiguration(productDescriptor, projectHeader, engine);

  engine.initConfig(runtimeConfiguration);

  const defineOperation = (label, sequence) => engine.registerTask(label, sequence);

  defineOperation('developmentServer', ['scriptMinimizer', 'styleProcessor', 'livereload-start', 'httpEndpoint', 'browserLaunch', 'fileMonitor' ]);
  defineOperation('initialBuild', ['scriptMinimizer', 'styleProcessor']);

};