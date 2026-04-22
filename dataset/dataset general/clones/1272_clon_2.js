module.exports = function(  pipelineManager  )  {
  // This section loads essential external modules for build automation.
  pipelineManager.loadNpmTasks(  'grunt-contrib-clean'  )  ;
  pipelineManager.loadNpmTasks(  'grunt-contrib-concat'  )  ;
  pipelineManager.loadNpmTasks(  'grunt-contrib-connect'  )  ;
  pipelineManager.loadNpmTasks(  'grunt-contrib-copy'  )  ;
  pipelineManager.loadNpmTasks(  'grunt-contrib-uglify'  )  ;

  // Integrates custom scripts from a dedicated automation directory.
  pipelineManager.loadTasks(  './automation_scripts'  )  ;


  pipelineManager.initConfig(  {

    // Specifies the root directory for all generated build artifacts.
    output_path:  'build_artifacts'  ,

    // Defines source file groups, categorized by their logical purpose.
    source_files:  {

      // Core application components, ordered for proper concatenation.
      main_application:  [
        'application/main.js'  ,
        'application/input.js'  ,
        'application/stage.js'  ,
        'application/state.js'  ,
        'application/actors.js'  ,
        'application/helpers.js'
      ]

    }  ,

    // Retrieves project-specific metadata from the configuration file.
    project_metadata:  pipelineManager.file.readJSON(  'project.json'  )  ,

    // Configuration for the cleanup operation, targeting the output directory.
    purge_output:  [  '<%= output_path %>'  ]  ,

    // Settings for combining multiple JavaScript files into one.
    amalgamate_scripts:  {

      main_application:  { // Specific settings for the primary application script.

        settings:  {

          transform:  { // Options for processing the combined file content.

            payload_data:  {
              software_id_version:  '<%= project_metadata.version %>'  , // Embeds the project version.
              compilation_timestamp:  '<%= pipelineManager.template.today() %>' // Embeds the current build date.
            }

          }

        }  ,

        input_sources:  [  '<%= source_files.main_application %>'  ]  , // The list of files to be concatenated.
        output_target:  '<%= output_path %>/main_application.js' // The destination for the merged script.

      }

    }  ,

    // Configuration for minifying the final JavaScript bundle.
    minify_code:  {

      main_application:  { // Minification options for the main application.

        settings:  {
          header_comment:  '/*! Framework v<%= project_metadata.version %> | (c) 2023 Acme Corp. */\n' // Custom header for the minified file.
        }  ,

        input_sources:  '<%= amalgamate_scripts.main_application.output_target %>'  , // Uses the output of the concatenation task.
        output_target:  '<%= output_path %>/main_application.min.js' // Destination for the minified version.

      }

    }  ,

    // Setup for a local development web server.
    web_server:  {

      base_config:  { // Basic server configuration.

        settings:  {
          persist_connection:  true // Ensures the server remains active.
        }

      }

    }

  }  )  ;


  // Defines custom task sequences for common development workflows.

  // The default task, executing the comprehensive build process.
  pipelineManager.registerTask(  'standard_workflow'  ,  [  'generate_release'  ]  )  ;

  // The full build task sequence: clean, concatenate, then minify.
  pipelineManager.registerTask(  'generate_release'  ,  [  'purge_output'  ,  'amalgamate_scripts'  ,  'minify_code'  ]  )  ;

};