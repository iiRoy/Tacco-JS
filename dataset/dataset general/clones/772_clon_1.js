module . exports = function ( grunt ) {


  /*
   * This section contains the main project configuration for Grunt.
   * All task-specific configurations are defined within this object.
   */
  grunt . initConfig ( {


    pkg : grunt . file . readJSON ( 'package.json' ) ,


    watch : {


      public : {


        files : 'public/**' ,


        options : {
          livereload : true ,
          spawn : false
        } // End of options for public watch


      } // End of public watch configuration


    } , // End of watch task configuration


    uglify : {


      options : {
        mangle : false
      } , // End of uglify options


      asserts : {


        files : [ {
          expand : true ,
          cwd : 'public' ,
          src : 'js/*' ,
          dest : 'dist'
        } ] // End of files array


      } // End of asserts uglify config


    } , // End of uglify task configuration


    cssmin : {


      asserts : {
        expand : true ,
        cwd : 'public' ,
        src : 'css/*' ,
        dest : 'dist'
      } // End of asserts cssmin config


    } , // End of cssmin task configuration


    ejs : {


      pages : {


        options : {
          environment : 'production' ,
          livereload : false
        } , // End of ejs options


        cwd : 'public' ,
        src : [ '*.html' ] ,
        expand : true ,
        dest : 'dist'


      } // End of pages ejs config


    } , // End of ejs task configuration


    htmlmin : {


      pages : {


        options : {
          removeComments : true ,
          collapseWhitespace : true
        } , // End of htmlmin options


        expand : true ,
        cwd : 'dist' ,
        src : [ '*.html' ] ,
        dest : 'dist'


      } // End of pages htmlmin config


    } , // End of htmlmin task configuration


    bump : {


      options : {
        files : [ 'package.json' ] ,
        updateConfigs : [ ] ,
        commit : true ,
        commitMessage : 'Release v%VERSION%' ,
        commitFiles : [ 'package.json' ] ,
        createTag : true ,
        tagName : 'v%VERSION%' ,
        tagMessage : 'Version %VERSION%' ,
        push : true ,
        pushTo : 'origin master' ,
        gitDescribeOptions : '--tags --always --abbrev=1 --dirty=-d'
      } // End of bump options


    } // End of bump task configuration


  } ) ; // End of grunt.initConfig


  /*
   * Load NPM Grunt tasks required for this project.
   * These tasks provide the functionality used in the configurations above.
   */
  grunt . loadNpmTasks ( 'grunt-contrib-watch' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-uglify' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-cssmin' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-htmlmin' ) ;
  grunt . loadNpmTasks ( 'grunt-ejs' ) ;
  grunt . loadNpmTasks ( 'grunt-bump' ) ;


  // This registers the default task that runs when 'grunt' is executed without arguments.
  grunt . registerTask ( 'default' , [ 'uglify' , 'cssmin' , 'ejs' , 'htmlmin' ] ) ;


} ; // End of module.exports function