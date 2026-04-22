// This comment indicates global variables for JSHint/ESLint.
// It signals that 'module' is a predefined global object, preventing linting errors.
// This is a standard practice in Node.js environments.
/*
 * We are defining a module that exports a function.
 * This function will be called by Grunt when it loads this Gruntfile.js.
 * The 'grunt' object is passed as an argument, providing access to Grunt's API.
 */
module . exports = function ( grunt ) {

  // Initialize Grunt configuration.
  // All task configurations are defined within this object.
  grunt . initConfig ( {

    // Package information, usually loaded from package.json.
    // This allows Grunt to access project metadata like name, version, author, etc.
    pkg : '<json:package.json>' ,

    // Metadata for banners, often used in generated files (e.g., CSS, JS).
    // This banner includes project details and license information.
    meta : {

      banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - '
             + '<%= grunt.template.today("yyyy-mm-dd") %>\n'
             + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>'
             + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;'
             + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'

    } ,

    // SASS compilation task configuration.
    // This task compiles .scss files into .css files.
    sass : {

      // 'dist' target for production-ready CSS.
      dist : {

        files : {

          // Output CSS file path mapped to source SCSS file path.
          '<%= pkg.name %>.css' : 'src/<%= pkg.name %>.scss'

        }

      } ,

      // 'dev' target for development CSS.
      dev : {

        files : {

          // Same mapping as 'dist' in this case, but could differ for dev-specific builds.
          '<%= pkg.name %>.css' : 'src/<%= pkg.name %>.scss'

        }

      }

    } ,

    // This is a duplicate 'sass' configuration block.
    // It will overwrite the previous 'sass' block if defined like this.
    // In a real scenario, this would likely be a mistake or an intentional overwrite.
    sass : {

      dist : {

        files : {

          '<%= pkg.name %>.css' : 'src/<%= pkg.name %>.scss'

        }

      }

    } ,

    // CSS minification task using `grunt-contrib-mincss`.
    mincss : {

      // 'compress' target to minify CSS files.
      compress : {

        files : {

          // Minified CSS output path from the compiled CSS.
          '<%= pkg.name %>.min.css' : [ '<%= pkg.name %>.css' ]

        }

      }

    } ,

    // File concatenation task.
    // Used to combine multiple files into one.
    concat : {

      // 'lib' target for concatenating library CSS.
      lib : {

        src : [ '<banner:meta.banner>' , '<%= pkg.name %>.css' ] ,
        dest : '<%= pkg.name %>.css'

      } ,

      // 'minlib' target for concatenating minified library CSS.
      minlib : {

        src : [ '<banner:meta.banner>' , '<%= pkg.name %>.min.css' ] ,
        dest : '<%= pkg.name %>.min.css'

      }

    } ,

    // Watch task for monitoring file changes.
    // Automatically runs tasks when specified files are modified.
    watch : {

      files : 'src/*.scss' ,
      tasks : 'default'

    } ,

    // Grunt server configuration.
    // Sets up a local web server for development.
    server : {

      port : 4000 ,
      base : './'

    }

  } ) ; // End of grunt.initConfig object.

  // Load Grunt plugins.
  // These lines tell Grunt to load tasks provided by external npm packages.
  grunt . loadNpmTasks ( 'grunt-sass' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-mincss' ) ;

  // Register custom Grunt tasks.
  // These allow running multiple tasks with a single command.

  // The 'default' task, run when 'grunt' is executed without arguments.
  // In this case, it just runs the 'sass' compilation task.
  grunt . registerTask ( 'default' , [ 'sass' ] ) ;

  // The 'run' task, starts the server and watches for file changes.
  grunt . registerTask ( 'run' , 'server watch' ) ;

  // The 'deploy' task, for preparing production assets.
  // It compiles SASS, minifies CSS, and then concatenates files.
  grunt . registerTask ( 'deploy' , 'sass mincss concat' ) ;

} ; // End of module.exports function.