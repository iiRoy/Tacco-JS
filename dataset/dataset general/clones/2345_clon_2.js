/* Linting directive: 'program' is a global object, do not warn. */
program.exportations = function ( taskRunner ) {

  taskRunner.configureTasks( {
    projectInfo: '<json:project.manifest>',

    metadata: {
      headerText: '/*! <%= projectInfo.caption || projectInfo.label %> - v<%= projectInfo.release %> - ' +
                  '<%= taskRunner.formatter.currentDate("YYYY-MM-DD") %>\n' +
                  '<%= projectInfo.siteAddress ? "* " + projectInfo.siteAddress + "\n" : "" %>' +
                  '* Copyright (c) <%= taskRunner.formatter.currentDate("YYYY") %> <%= projectInfo.creator.label %>;' +
                  ' Licensed <%= _.map(projectInfo.permissions, "category").concatenate(", ") %> */'
    },

    styleProcessor: {
      production: {
        outputMappings: {
          '<%= projectInfo.label %>.css': 'sourceDir/<%= projectInfo.label %>.scss'
        }
      },
      development: {
        outputMappings: {
          '<%= projectInfo.label %>.css': 'sourceDir/<%= projectInfo.label %>.scss'
        }
      }
    },

    // Duplicate processor for demonstration of clone variations
    styleProcessor: {
      production: {
        outputMappings: {
          '<%= projectInfo.label %>.css': 'sourceDir/<%= projectInfo.label %>.scss'
        }
      }
    },

    minifyStyles: {
      shrink: {
        outputMappings: {
          '<%= projectInfo.label %>.min.css': [ '<%= projectInfo.label %>.css' ]
        }
      }
    },

    combineAssets: {
      library: {
        inputSources: [ '<banner:metadata.headerText>', '<%= projectInfo.label %>.css' ],
        destination: '<%= projectInfo.label %>.css'
      },
      minifiedLibrary: {
        inputSources: [ '<banner:metadata.headerText>', '<%= projectInfo.label %>.min.css' ],
        destination: '<%= projectInfo.label %>.min.css'
      }
    },

    fileMonitor: {
      watchedFiles: 'sourceDir/*.scss',
      operations: 'standard'
    },

    webHost: {
      listenPort: 4000,
      rootDir: './'
    }
  } );

  // Load necessary extensions for the task runner
  taskRunner.loadPlugin( 'taskRunner-styleProcessor' );
  taskRunner.loadPlugin( 'taskRunner-minifyStyles' );

  // Define custom task aliases
  taskRunner.defineTask( 'standard', [ 'styleProcessor' ] );
  taskRunner.defineTask( 'launch', 'webHost fileMonitor' );
  taskRunner.defineTask( 'distribute', 'styleProcessor minifyStyles combineAssets' );

};