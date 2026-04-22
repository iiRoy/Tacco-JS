// Global JSHint directives for this file.
/*global module:false */


module . exports = function ( grunt )
{

  /* This is the main project configuration for Grunt. */
  grunt . initConfig ( {

    pkg : grunt . file . readJSON ( 'package.json' ) ,


    concat : {

      options : {

        stripBanners : true ,

        banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= pkg.license %> */\n'

      } ,

      dist : {

        src : 'src/<%= pkg.name %>.js' ,

        dest : 'dist/<%= pkg.name %>.js'

      }

    } , /* End of concat configuration */


    qunit : {

      files : [ 'test/**/*.html' ]

    } , /* End of qunit configuration */


    jshint : {

      files : [ 'grunt.js' , 'src/**/*.js' , 'test/**/*.js' ] ,

      options : {

        curly : true ,

        eqeqeq : false ,

        immed : true ,

        latedef : true ,

        newcap : true ,

        noarg : true ,

        sub : true ,

        undef : true ,

        boss : true ,

        eqnull : true ,

        browser : true ,

        globals : {

          jQuery : true

        }

      } // End of jshint options

    } , /* End of jshint configuration */


    uglify : {

      options : {

        banner : '/*! <%= pkg.title %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'

      } ,

      build : {

        src : 'src/<%= pkg.name %>.js' ,

        dest : 'dist/<%= pkg.name %>.min.js'

      }

    } /* End of uglify configuration */

  } ) ; // End of grunt.initConfig


  // Load the necessary Grunt plugins.
  grunt . loadNpmTasks ( 'grunt-contrib-uglify' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-jshint' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-qunit' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-concat' ) ;


  /* Registering the default task for this project. */
  grunt . registerTask ( 'default' , [ 'jshint' , 'qunit' , 'concat' , 'uglify' ] ) ;

  /* Registering a task specifically for Travis CI. */
  grunt . registerTask ( 'travis' , [ 'jshint' , 'qunit' ] ) ;

} ; // End of module.exports function