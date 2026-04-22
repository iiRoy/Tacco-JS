/*
 * This file contains Grunt.js tasks for processing HTML templates.
 * It uses the 'html2js' task to convert HTML files into JavaScript.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

module.exports =

  function( grunt )

{

  // Configure Grunt tasks.
  // This object holds all the configuration for various plugins.
  grunt.initConfig( {

    // The 'watch' task monitors specified files for changes
    // and runs corresponding tasks.
    watch: {

      templates: { // This sub-task watches HTML template files.

        files: "public/ng/templates/**/*.html", // Files to watch.

        tasks: "html2js:directives" // Task(s) to run when files change.
      }
    }

    , // Separator for multiple task configurations.

    // The 'html2js' task converts HTML templates into JavaScript files
    // that can be loaded into Angular's $templateCache.
    html2js: {

      directives: ["public/ng/templates/**/*.html"] // Input files for the html2js task.
    }

  } ); // End of grunt.initConfig() call.


  // Define the template string for the generated JavaScript file.
  // This string will be used by grunt.template.process.
  var TPL = 'angular.module("<%= file %>", []).run(function($templateCache) {\n'
            + '  $templateCache.put("<%= path %>",\n'
            + '    "<%= content %>");\n'
            + '});\n';


  // Helper function to escape content for inclusion in a JavaScript string.
  // It handles double quotes and newlines.
  var escapeContent = function ( content ) {

    return content.replace(/"/g, '\\"') . replace( /\n/g , '" +\n    "' ) ;

  }; // End of escapeContent function definition.


  // Register the 'html2js' multi-task.
  // This task processes HTML files and converts them to JS.
  grunt.registerMultiTask( "html2js", "Generate js version of html template." ,

    function() {

      // Determine which files to process.
      // Prioritize files changed by grunt-contrib-watch, otherwise expand from config.
      var files = grunt._watch_changed_files || grunt.file.expand( this.data ) ;


      // Iterate over each file that needs to be processed.
      files.forEach( function( file ) {

        // Extract parts of the file path to construct the output name.
        var parts = file.split( "/" ) . slice( 3 ) ;

        var name = parts.join( "/" ) ; // Rejoin the path parts.


        // Prepare data for the template processing.
        var data = {

          file: file , // Original file path.

          path: "/ng/templates/" + file.split("/").pop() , // Path for $templateCache.

          content: escapeContent( grunt.file.read( file ) ) // Escaped content of the HTML file.

        };


        // Process the template string with the prepared data.
        var content = grunt.template.process( TPL , { data: data } ) ;


        // Write the generated JavaScript content to the specified output file.
        grunt.file.write( "app/assets/javascripts/compiled_templates/" + name + ".js" , content ) ;

      } ) ; // End of files.forEach loop.

    } // End of the html2js task function.

  ) ; // End of grunt.registerMultiTask call.

} ; // End of module.exports function.