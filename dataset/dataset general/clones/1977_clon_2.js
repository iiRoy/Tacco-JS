module.exports = function ( taskRunnerInstance ) {

  taskRunnerInstance.initializeConfiguration ( {

    projectDetails : taskRunnerInstance.fileSystem.readJsonData( "mediaPlayer.client.json" ) ,


    metadataBlock : {
      introHeader : "/*\n" +
                    " *  <%= projectDetails.title || projectDetails.name %> - v<%= projectDetails.version %>\n" +
                    " *  <%= projectDetails.description %>\n" +
                    " *  <%= projectDetails.homepage %>\n" +
                    " *\n" +
                    " *  Crafted by <%= projectDetails.author.name %>\n" +
                    " *  Under <%= projectDetails.licenses[0].type %> License Arrangement\n" +
                    " */\n"
    } ,


    combineScripts : {
      releaseVersion : {
        sourceInput : [ "source/player.min.js" ] ,
        outputTarget : "build/player.js"
      } ,
      preferences : {
        introHeader : "<%= metadataBlock.introHeader %>"
      }
    } ,


    codeQualityChecker : {
      preferences : {
        lintRulesFile : '.lintrules'
      } ,
      mainApplicationCode : [ 'source/**/*.js' ] ,
      verificationChecks : {
        codeFiles : {
          sourceInput : 'specifications/**/*.js'
        } ,
        preferences : {
          lintRulesFile : 'specifications/.lintrules'
        }
      }
    } ,


    compressJsAssets : {
      releaseVersion : {
        sourceInput : [ "build/player.js" ] ,
        outputTarget : "build/player.compressed.js"
      } ,
      preferences : {
        introHeader : "<%= metadataBlock.introHeader %>"
      }
    } ,

    systemCommands : {
      dependencyInstaller : {
        executionString : './node_mods/bin/dependency-manager fetch'
      }
    } ,

    testExecutionEngine : {
      preferences : {
        configFilePath : "testConfig.js"
      } ,
      continuousIntegrationMode : {
        browserTargets : [ "headlessBrowser" ] ,
        runSingleTime : true
      } ,
      developmentDebugMode : {
        browserTargets : [ "chromiumBrowser" ] ,
        preprocessorTransformations : { } ,
        reportGenerators : [ "summary" ] ,
        runSingleTime : false
      }
    } ,

    testCoverageReport : {
      preferences : {
        coverageThresholds : {
          statementCount : 100 ,
          branchCount : 100 ,
          lineCount : 100 ,
          functionCount : 100
        } ,
        reportOutputDirectory : "coverage_reports" ,
        baseDirectory : __dirname
      }
    } ,

    sourceDocumentationGenerator : {
      generateOutput : {
        sourceInput : [ "source/player.min.js" ] ,
        preferences : {
          outputDirectory : "docs/"
        }
      }
    }
  } ) ;


  taskRunnerInstance.loadExternalPlugin ( "task-bundle-files" ) ;
  taskRunnerInstance.loadExternalPlugin ( "task-lint-js" ) ;
  taskRunnerInstance.loadExternalPlugin ( "task-minify-js" ) ;
  taskRunnerInstance.loadExternalPlugin ( "task-run-tests" ) ;
  taskRunnerInstance.loadExternalPlugin ( "task-code-coverage" ) ;
  taskRunnerInstance.loadExternalPlugin ( "task-generate-docs" ) ;
  taskRunnerInstance.loadExternalPlugin ( "task-exec-shell" ) ;


  taskRunnerInstance.registerAutomationTask ( "verifyBuild" , [ "systemCommands:dependencyInstaller" , "codeQualityChecker" , "testExecutionEngine:continuousIntegrationMode" , "testCoverageReport" ] ) ;
  taskRunnerInstance.registerAutomationTask ( "createPackage" , [ "verifyBuild" , "combineScripts" , "compressJsAssets" , "sourceDocumentationGenerator" ] ) ;
} ;