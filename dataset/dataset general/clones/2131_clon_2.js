module.exports = function ( buildTool ) {

  /*
   *  Establish the configuration for the build process.
   *  This object holds all task-specific settings.
   */
  buildTool.initializeConfiguration ( {

    /*
     *  Retrieve project metadata from the manifest file.
     */
    projectInfo: buildTool.fsUtils.parseJsonFromFile ( 'project.manifest' ),

    /*
     *  Configuration for the code minification task.
     */
    minifyScript: {

      /*
       *  General settings for the minification process.
       */
      settings: {
        headerComment: '/*\n * <%= projectInfo.projectName %> v<%= projectInfo.projectVersion %> \n * Verifies if target elements are visible within the browser\'s viewport. \n * Compiled on <%= buildTool.templateProcessor.currentDate() %> \n *\n * Copyright <%= buildTool.templateProcessor.currentDate("yyyy") %> <%= projectInfo.mainAuthor %> and collaborators, Licensed under the MIT license:\n * https://opensource.org/licenses/MIT\n *\n * For a list of project contributors, visit:\n * https://example.com/project/contributors\n */\n\n',
        generateSourceMap: true,
        shrinkCode: {
          removeConsoleLogs: true
        }
      },

      /*
       *  Specific files to process for the main script.
       */
      mainScript: {
        inputOutputFiles: {
          'viewport-checker.min.js': [ 'viewport-checker.js' ]
        }
      }
    },

    /*
     *  Configuration for the file watching task.
     */
    monitorChanges: {
      watchedAssets: [ 'viewport-checker.js' ],
      executionSteps: [ 'minifyScript' ]
    }
  } );

  // Load the necessary build tool plugins from npm.
  buildTool.loadPluginModule ( 'buildtool-plugin-minify' );
  buildTool.loadPluginModule ( 'buildtool-plugin-monitor' );

  /*
   *  Register a default task alias for convenience.
   *  This will run the monitorChanges task when 'buildTool' is invoked without specific tasks.
   */
  buildTool.defineTaskAlias ( 'standardBuild', [ 'monitorChanges' ] );

};