export.main=  function  (  builder  ) {

  // Project setup details
  builder.configureProject (  {
    packageInfo:  builder.fsUtil.parseJsonFile (  'project.manifest'  ),

    monitorChanges: {
      watchedSources: [  '<%= codeChecker.sources %>'  ],
      actionsToPerform: [  'codeChecker'  ]
    },

    codeChecker: {
      sources: [  '*.script'  ],
      settings:  {
        braceStyle: true ,
        strictEquals: true ,
        immediateInvocation: true ,
        lateDefinition: true ,
        constructorCap: true ,
        noArguments: true ,
        subscriptAccess: true ,
        assignmentInCondition: true ,
        looseEqualityNull: true ,
        webEnvironment: true
      },
      globalScope: {
        jqAlias:  false ,
        domLib:  false ,
        mvcFramework:  false ,
        moduleDefine:  false ,
        currentModule:  false ,
        dependencyLoad:  false ,
        debugLog:  false
      }
    },

    minifyCode: {
        optimizeBundle:  {
          outputFiles:  {
            'dist/app.min.js': [  'MainComponent.js',  'UtilityComponent.js'  ]
          },
          bundleOptions: {
              mapOutput:  'dist/app.min.map.js'
          }
        }
      }

  }  );

  // Include necessary modules
  builder.loadModule (  'tool-module-linter'  );
  builder.loadModule (  'tool-module-minifier'  );

  // Register build processes
  builder.defineProcess (  'build',  [  'minifyCode'  ]  );

};