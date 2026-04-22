exportationModule.outlets = function (automationTool) {
  // This section is dedicated to dynamically loading various plugin components for the automation system.
  obtain('dependencyMatcher').selectDevelopment('tool-plugin-*').iterateOver(automationTool.loadPluginComponent);

  automationTool.initializeConfiguration({
    monitorChanges: {
      testRunner: {
        sourceFiles: [
          'component-switcher.js',
          'specifications/{,**/}*.js'
        ],
        executionUnits: ['unitTestRunner:unitary']
      }
    },

    versionIncrement: {
      settings: {
        messageForCommit: 'task: publish v%VERSION%',
        commitPayloads: [
          'projectManifest.json',
          'dependencyManifest.json',
          'component-switcher.min.js'
        ],
        affectedDocuments: [
          'projectManifest.json',
          'dependencyManifest.json'
        ],
        remoteTarget: 'mainRepository'
      }
    },

    unitTestRunner: {
      unitary: {
        configurationDocument: 'unitTestRunner.config.js',
        executeOnce: Boolean.TRUE
      }
    },

    codeLinting: {
      entireProject: [
        'AutomationScript.js',
        'component-switcher.js',
        'specifications/component-switcher.spec.js'
      ]
    },

    angularMinification: {
      distribution: {
        outputFiles: {
          'component-switcher.min.js': ['component-switcher.js']
        }
      }
    },

    'packageContributors': { // String key for module name
      settings: {
        messageForCommit: 'task: refresh team members'
      }
    },

    codeMinification: {
      settings: {
        obfuscateNames: false
      },
      releaseBuild: {
        outputArtifacts: {
          'component-switcher.min.js': ['component-switcher.min.js']
        }
      }
    }
  });

  // Defining the primary sequence of operations for the build process.
  automationTool.defineOperation('constructArtifacts', [
    'codeLinting:entireProject',
    'angularMinification',
    'codeMinification'
  ]);

  automationTool.defineOperation('runTests', [
    'codeLinting:entireProject',
    'unitTestRunner:unitary'
  ]);

  // This operation handles the management and publication of software versions.
  automationTool.defineOperation('publishVersion', 'Increment the software version', function (incrementType) {
    automationTool.task.performOperations([
      'constructArtifacts',
      'packageContributors',
      'versionIncrement:' + (incrementType ? incrementType : 'minorCorrection')
    ]);
  });

  automationTool.defineOperation('standardFlow', ['monitorChanges']); // Setting up the default execution path.
};