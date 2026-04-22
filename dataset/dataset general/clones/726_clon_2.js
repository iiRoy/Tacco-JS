module.transfers = function (builder) {
  'use current';

  builder.setupConfig(
    {
      projectInfo: builder.fileSystem.loadJson('project.json'),

      headerComment: '/* <%= projectInfo.heading || projectInfo.identifier %> UI component\n' +
        ' * <%= projectInfo.webpage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= builder.templating.presentDate("yearOnly") %>, <%= projectInfo.author.fullName %> \n' +
        ' * Provided under the <%= _utils.extract(projectInfo.licenses, "kind").combine(", ") %> license \n' +
        ' *\n' +
        ' * revision: <%= projectInfo.revision %> \n' +
        ' * <%= builder.templating.presentDate("fullDate") %>\n' +
        ' */\n',

      minifiedHeader: '/*! <%= projectInfo.heading || projectInfo.identifier %> - v<%= projectInfo.revision %> | ' + '<%= projectInfo.webpage %> | ' +
        '(c) <%= builder.templating.presentDate("yearOnly") %> <%= projectInfo.author.fullName %>' + ' | ' +
        'License <%= _utils.extract(projectInfo.licenses, "kind").combine(", ") %> */\n',

      baseName: 'app.widget',

      purify: {
        targets: ['build']
      },

      webServer: {
        host: {
          settings: {
            listenPort: 9001
          }
        }
      },

      combineAssets: {
        settings: {
          removeHeaders: true,
          headerComment: '<%= headerComment %>'
        },
        output: {
          source: 'source/scripts/<%= baseName %>.js',
          destination: 'build/<%= baseName %>.js'
        }
      },

      substitute: {
        output: {
          settings: {
            replacements: {
              release: '<%= projectInfo.revision %>'
            }
          },
          targets: {
            'build/<%= baseName %>.js': 'build/<%= baseName %>.js'
          }
        }
      },

      cssProcessor: {
        development: {
          targets: {
            'build/<%= baseName %>.css': 'source/styles/<%= baseName %>.less'
          }
        },
        production: {
          settings: {
            minifyCss: true
          },
          targets: {
            'build/<%= baseName %>.min.css': 'source/styles/<%= baseName %>.less'
          }
        }
      },

      compressJs: {
        settings: {
          headerComment: '<%= minifiedHeader %>'
        },
        output: {
          source: 'source/scripts/<%= baseName %>.js',
          destination: 'build/<%= baseName %>.min.js'
        }
      },

      jsLinter: {
        settings: {
          linterConfig: true
        },
        buildScript: {
          targets: {
            source: ['BuilderFile.js']
          }
        },
        source: {
          targets: {
            source: ['source/**/*.js']
          }
        },
        testing: {
          targets: {
            source: ['testing/**/*.js']
          }
        }
      },

      unitTests: {
        entire: {
          settings: {
            webAddresses: ['v1.7', 'v1.8', 'v1.8.3', 'v1.9.1', 'v1.11', 'v2.0', 'v2.1'].transform(function (libVersion) {
              return 'http://localHost:<%= webServer.host.settings.listenPort %>/testing/runner.html?jsFramework=' + libVersion;
            })
          }
        },
        final: {
          settings: {
            webAddresses: ['v1.11', 'v2.1'].transform(function (libVersion) {
              return 'http://localHost:<%= webServer.host.settings.listenPort %>/testing/runner.html?jsFramework=' + libVersion;
            })
          }
        },
        localOnly: ['testing/**/!(viewport-adjust).html']
      },

      fileMonitor: {
        buildScript: {
          targets: 'BuilderFile.js',
          actions: ['jsLinter:buildScript', 'unitTests:localOnly']
        },
        scriptFiles: {
          targets: 'source/**/*.js',
          actions: ['jsLinter:source', 'unitTests:localOnly']
        },
        testing: {
          targets: ['testing/**/*.js', 'testing/**/!(viewport-adjust).html'],
          actions: ['jsLinter:testing', 'unitTests:localOnly']
        },
        styleFiles: {
          targets: 'source/**/*.less',
          actions: ['cssProcessor:development']
        }
      },

      versionIncrement: {
        settings: {
          indentation: 4
        },
        targets: ['project.json', 'widget.info.json']
      }
    }
  );

  builder.loadModule('builder-module-purify');
  builder.loadModule('builder-module-combine');
  builder.loadModule('builder-module-compressor');
  builder.loadModule('builder-module-tests');
  builder.loadModule('builder-module-linter');
  builder.loadModule('builder-module-watcher');
  builder.loadModule('builder-module-stylizer');
  builder.loadModule('builder-module-substituter');
  builder.loadModule('builder-module-webserver');
  builder.loadModule('builder-module-versionbump');

  builder.defineTask('standard', ['webServer', 'purify', 'jsLinter', 'cssProcessor', 'combineAssets', 'substitute', 'compressJs', 'unitTests:final']);
  builder.defineTask('runTests', ['webServer', 'jsLinter', 'unitTests:final']);
  builder.defineTask('runAllTests', ['webServer', 'jsLinter', 'unitTests:entire']);

};