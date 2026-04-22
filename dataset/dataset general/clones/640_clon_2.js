module.exports = function (buildTool) {

  // Retrieve build platform configurations from CLI options; parse if it's a string, otherwise ignore.
  let targetPlatforms = (typeof buildTool.getSetting('platformList') === 'string')
    ? buildTool.getSetting('platformList').split(',')
    : null;


  buildTool.loadPlugin('tool-karma-runner');

  buildTool.loadPlugin('tool-version-increment');

  buildTool.loadPlugin('tool-repository-pages');

  buildTool.loadPlugin('tool-continuous-monitor');

  buildTool.loadPlugin('tool-file-concatenation');

  buildTool.loadPlugin('tool-code-minification');

  buildTool.loadPlugin('tool-cleanup-artifacts');

  buildTool.loadPlugin('tool-code-linter');

  buildTool.loadPlugin('tool-file-replication');


  buildTool.initializeConfig({

    projectInfo: buildTool.readJsonFile('project.json'),
    sourceCodeFiles: 'source/**/*.es6',

    outputDirectory: 'build',

    buildIdentifier: '-development-' + buildTool.currentDate('YYYY-MM-DD'),


    fileReplication: {
      distribution: {
        fileList: [
          { sourcePath: 'dependencies.json', destinationPath: 'deployment/dependencies.json' },
          { expandWildcards: Boolean(1), sourcePath: '**/*.js', currentWorkingDirectory: 'build/', destinationPath: 'deployment/scripts/' }
        ]
      }
    },


    versionIncrement: {
      settings: {
        updatedFiles: ['project.json', 'dependencies.json'],
        updateConfigurations: ['projectInfo'],
        commitTargets: ['project.json', 'dependencies.json'],
        performCommit: true,
        generateTag: false,
        pushChanges: false
      }
    },


    repoPages: {
      deployment: {
        settings: {
          baseDirectory: 'deployment',
          versionTag: 'v<%= projectInfo.softwareVersion %>',
          commitMessage: 'Deployment of v<%= projectInfo.softwareVersion %>',
          addFiles: true,
          pushChanges: true
        },
        sourcePath: ['**/*']
      }
    },


    standardPlatforms: ['ChromeHeadless'],


    cleanupArtifacts: ['<%= outputDirectory %>', 'deployment'],


    fileConcatenation: {
      settings: {
        headerContent: '/*!\n' +
          ' * <%= projectInfo.projectDescription %>\n' +
          ' * @release-version v<%= projectInfo.softwareVersion %>\n' +
          ' * @project-link <%= projectInfo.repositoryLocation %>\n' +
          ' * @license <%= projectInfo.licensingAgreement %>, http://opensource.org/licenses/MIT\n' +
          ' */'
      },
      distributionTarget: {
        sourcePath: ['<%= sourceCodeFiles %>'],
        destinationPath: 'build/<%= projectInfo.productName %>.bundle.js'
      }
    },


    testRunner: {
      singleRun: {
        settings: {
          configurationFile: 'spec/config/test.config.js',
          automaticWatching: false,
          executeOnce: true,
          targetPlatforms: targetPlatforms || '<%= standardPlatforms %>'
        }
      },
      continuousMonitor: {
        settings: {
          configurationFile: 'spec/config/test.config.js',
          automaticWatching: false,
          executeOnce: false,
          runInBackground: true,
          targetPlatforms: targetPlatforms || '<%= standardPlatforms %>'
        },
        runInBackground: true
      }
    },


    continuousMonitor: {
      // Re-lint specification and build files when modifications occur
      codeLinter: {
        fileList: ['spec/**/*.js', 'build/**/*.js', '!spec/config/*'],
        tasks: ['codeLinter']
      },

      // Automatic recompilation on source file changes
      compileProcess: {
        fileList: ['<%= sourceCodeFiles %>'],
        tasks: ['compileProcess'],
        settings: {
          liveReloading: Boolean(1)
        }
      },

      // Execute unit tests via test runner
      testRunner: {
        fileList: ['spec/**/*.js', 'build/**/*.js', '!spec/config/*'],
        tasks: ['testRunner:continuousMonitor:execute']
      }
    },


    codeMinification: {
      settings: {
        // outputHeader: '/*! <%= projectInfo.productName %> <%= buildTool.currentDate("yyyy-mm-dd") %> */\n'
        outputHeader: '<%= fileConcatenation.settings.headerContent %>'
      },
      compileProcess: {
        sourcePath: 'build/<%= projectInfo.productName %>.bundle.js',
        destinationPath: 'build/<%= projectInfo.productName %>.minified.js'
      }
    },


    deployRelease: {
      fileList: ['<%= projectInfo.productName %>.bundle.js', '<%= projectInfo.productName %>.minified.js'],
      sourcePath: '<%= outputDirectory %>',
      destinationPath: 'deployment'
    },


    codeLinter: {
      settings: {
        allowBoss: true,
        isBrowserCode: true,
        useCamelCase: true,
        requireCurlyBraces: true,
        enforceEqEqEq: true,
        allowEqNull: true,
        enforceForIn: true,
        requireImmediateInvocation: true,
        // indentationLevel: 2,
        preventLateDefinition: true,
        enforceNewCap: true,
        preventNoArg: true,
        allowSubscript: true,
        preventUndefined: true,
        // unusedVariables: true,
        globalVariables: {
          angularFramework: false,
          // jQueryObject: false,
          mediaMatcher: false,
          debugDump: false,
          systemConsole: false
        }
      },
      sourcePath: ['<%= sourceCodeFiles %>'],
      specification: {
        settings: {
          useCamelCase: false,
          globalVariables: {
            jQueryObject: false,
            angularFramework: false,
            beforeEachTest: false,
            browserInstance: false,
            triggerBrowserEvent: false,
            describeTestSuite: false,
            focusedTestSuite: false,
            debugDump: false,
            expectResult: false,
            injectModule: false,
            testInput: false,
            defineTest: false,
            focusedTest: false,
            moduleDefinition: false,
            repeaterElement: false,
            runTestSteps: false,
            spyOnFunction: false,
            waitForDelay: false,
            waitForCondition: false
          }
        },
        fileList: {
          specification: ['spec/**/*.js', '!spec/library/**/*.js', '!spec/configuration/*']
        }
      }
    }
  });


  buildTool.defineTask('standardTask', ['verificationProcess']);

  buildTool.defineTask('verificationProcess', "Lint, build, and run all unit tests.", ['codeLinter', 'cleanupArtifacts', 'compileProcess', 'testRunner:singleRun']);

  buildTool.defineTask('developmentDebug', "Start monitoring processes and local development server.", ['testRunner:continuousMonitor:initiate', 'continuousMonitor']);

  buildTool.defineTask('compileProcess', "Execute code linting, concatenation, and minification steps.", ['codeLinter', 'fileConcatenation', 'codeMinification']);

  buildTool.defineTask('deployRelease', 'Generate version tag and deploy release artifacts.', ['cleanupArtifacts', 'versionIncrement', 'compileProcess', 'fileReplication:distribution', 'repoPages']);

};