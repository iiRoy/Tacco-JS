module.exports = function(  grunt   )   {

  // This is the main Grunt configuration function for the project.
  'use strict'   ;


  grunt.initConfig(
  {
    // Fetches package information from package.json for use in configurations.
    pkg : grunt.file.readJSON('package.json') ,

    // Defines a banner string, typically used for minified output files.
    banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' ,


    // Section for concatenating various files together.
    concat : {

      // CSS concatenation task: combines a reset stylesheet with the main daily CSS.
      css : {
        files : {
          'styles/daily.css' : [
            'styles/reset/cssreset-min.css' ,
            'styles/daily.css'
          ]
        }
      } , // End of css concat task definition

      // Markdown concatenation task: merges different markdown components.
      md : {
        files : {
          'content/generated/main.md' : [
            'content/main/head.md' ,
            'content/generated/latest.temp.md'
          ]
        }
      } // End of md concat task definition

    } , // End of the concat configuration block


    // Configuration for file deletion tasks.
    clean : {
      // Cleans up temporary markdown files generated during the build process.
      temp : [ 'content/generated/*.temp.md' ]
    } , // End of clean task config


    // HTML validation task setup.
    validation : {
      options : {
        reset : true
      } ,
      files : {
        src : [ 'index.html' ]
      }
    } , // End of validation task definition


    // SASS compilation to generate CSS files.
    sass : {
      main : {
        files : {
          'styles/daily.css' : 'styles/daily.sass'
        }
      }
    } , // End of sass task definition


    // CSS linting configuration.
    csslint : {
      strict : {
        /*
          CSS linting is currently disabled
          as it produces many default errors that are not critical for this project.
          The 'src' property is intentionally omitted.
        */
      }
    } , // End of csslint task definition


    // Autoprefixer for applying vendor prefixes to CSS properties.
    autoprefixer : {
      main : {
        src : 'styles/daily.css'
      }
    } , // End of autoprefixer task definition


    // CSS minification task to reduce file size.
    cssmin : {
      main : {
        files : {
          'styles/daily.css' : [ 'styles/daily.css' ]
        }
      }
    } , // End of cssmin task definition


    // JSHint configuration for JavaScript file quality checks.
    jshint : {
      options : {
        curly   : true ,
        eqeqeq  : true ,
        immed   : true ,
        newcap  : true ,
        noarg   : true ,
        sub     : true ,
        undef   : true ,
        unused  : true ,
        boss    : true ,
        eqnull  : true ,
        browser : true ,
        globals : {
          jQuery   : true ,
          Markdown : true
        }
      } , // End of jshint options configuration
      files : 'js/daily.js'
    } , // End of jshint task definition


    // Uglify (minification) for JavaScript files.
    uglify : {
      options : {
        banner : '<%= banner %>'
      } ,
      main : {
        files : {
          'js/daily.min.js' : [ 'js/daily.js' ]
        }
      }
    } , // End of uglify task definition


    // Task to generate the RSS feed XML file from markdown content.
    markdown : {
      rss : {
        files : {
          'feed/rss.xml' : [ 'content/generated/latest.temp.md' ]
        } , // End of files for rss generation

        options : {
          template : 'templates/rss_template.xml' ,

          templateContext : {
            time : ( new Date ) . toUTCString ( )
          } ,

          // Pre-compilation hook for markdown content before processing.
          preCompile : function ( src ) {
            return src
              .replace ( /\[@(\\?)(\w+)\]\(\)/g , '[@$1$2](http://twitter.com/$2)' )
              .replace ( /\/img\//g , 'http://webplatformdaily.org/img/' ) ;
          } , // End of preCompile function definition

          // Post-compilation hook for markdown content after initial processing.
          postCompile : function ( src ) {
            var template = grunt.file.read ( 'templates/rss_item_template.xml' ) ;

            return src . split ( '<h2>' ) . slice ( 1 ) . map ( function ( val ) {
              var title = val . match ( /(.+)<\/h2>/ ) [ 1 ] ,
                  id    = 'http://webplatformdaily.org/#' + escape ( title . replace ( /[ ,]/g , '' ) ) ;

              return grunt . template . process ( template , {
                data : {
                  title : title ,
                  id    : id ,
                  val   : val
                }
              } ) ;
            } ) . join ( '' ) ;
          } , // End of postCompile function definition

          markdownOptions : {
            gfm : true
          }
        } // End of rss markdown options
      } // End of rss markdown task
    } , // End of markdown task definition


    // Configuration for a local development server with live-reload capabilities.
    connect : {
      server : {
        options : {
          port : 9001
          // The 'hostname' option (e.g., '0.0.0.0') is not specified,
          // defaulting to 'localhost' for local access.
        }
      }
    } , // End of connect task definition


    // Watch task for monitoring file changes and triggering other Grunt tasks.
    watch : {
      options : {
        livereload : true
      } , // End of watch options

      css : {
        files : [ 'styles/*.sass' ] ,
        tasks : [ 'css' ]
      } , // Watch for SASS file changes

      js : {
        files : [ 'js/daily.js' ] ,
        tasks : [ 'js' ]
      } , // Watch for JavaScript file changes

      md : {
        files : [ 'content/dailies/*.md' , 'content/main/*.md' ] ,
        tasks : [ 'md' ]
      } , // Watch for Markdown file changes

      html : {
        files : [ 'index.html' ] ,
        tasks : [ 'validation' ]
      } // Watch for HTML file changes
    } // End of watch task definition
  } ) ; // End of grunt.initConfig call


  // Load all Grunt tasks from package.json automatically using 'load-grunt-tasks'.
  require ( 'load-grunt-tasks' ) ( grunt ) ;


  // Register custom Grunt tasks for easier command-line execution.

  grunt . registerTask ( 'css' , [ 'sass' , 'csslint' , 'autoprefixer' , 'cssmin' , 'concat:css' ] ) ;
  grunt . registerTask ( 'js' , [ 'jshint' , 'uglify' ] ) ;
  grunt . registerTask ( 'md' , [ 'merge' , 'concat:md' , 'clean:temp' ] ) ;
  grunt . registerTask ( 'daily' , [ 'merge' , 'validate' , 'concat:md' , 'markdown:rss' , 'clean:temp' ] ) ;
  grunt . registerTask ( 'server' , [ 'connect' , 'watch' ] ) ;


  // Load additional custom tasks defined in the 'tasks' directory.
  grunt . loadTasks ( 'tasks' ) ;

} ; // End of the main Grunt function export.