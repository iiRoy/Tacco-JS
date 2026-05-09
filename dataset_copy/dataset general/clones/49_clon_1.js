module.exports = function( grunt ) {

  // Load all required Grunt tasks from the 'node_modules' directory.
  // These tasks are specified in the 'package.json' file under 'devDependencies'.
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-concat' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-karma' );
  grunt.loadNpmTasks( 'grunt-ngmin' );
  grunt.loadNpmTasks( 'grunt-recess' );


  // This is the core Grunt configuration object.
  // It holds all the settings and instructions for the various tasks.
  grunt.initConfig( {

    // Specifies the output directory for all generated build artifacts.
    build_dir: 'build',


    // Fetches project metadata from the 'package.json' file.
    // This allows access to properties like name, version, etc.
    pkg: grunt.file.readJSON( "package.json" ),


    // Defines a banner string that will be prepended to compiled output files.
    // It's a template that includes dynamic project information.
    meta: {
      banner: '/**\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },


    // A set of file patterns for the application's source code.
    // This helps in organizing and referencing different types of source files.
    app_files: {
      js: [ 'src/*.js', '!src/*.spec.js' ], // All JavaScript files except unit tests.
      html: [ 'src/*.html' ],               // Main HTML files.
      less: 'src/main.less',                 // The primary LESS stylesheet.
      unit: [ 'src/*.spec.js' ]              // Unit test files.
    },


    // Configuration for third-party vendor files.
    // These are external libraries or frameworks used by the application.
    vendor_files: {
      js: [
        'vendor/jquery/jquery.min.js',
        'vendor/angular-unstable/angular.min.js',
        'vendor/hamsterjs/hamster.js',
        'vendor/angular-mousewheel/mousewheel.js',
        'vendor/google-code-prettify/src/prettify.js'
      ]
    },


    // Files and directories to be removed by the 'clean' task.
    clean: [ '<%= build_dir %>' ],


    // Settings for the 'copy' task, used to move files.
    copy: {
      fonts: {
        files: [
          {
            expand: true,
            src: [ 'vendor/font-awesome/build/assets/font-awesome/font/*' ],
            dest: '<%= build_dir %>/font',
            flatten: true
          }
        ]
      }
    },


    // Configuration for the 'concat' task, which merges files.
    concat: {
      // Concatenates application-specific JavaScript files.
      // Includes a header banner and wraps the code with module delimiters.
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [ 'module.prefix', '<%= app_files.js %>', 'module.suffix' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.js'
      },

      // Concatenates all vendor JavaScript files into a single library file.
      libs: {
        src: [ '<%= vendor_files.js %>' ],
        dest: '<%= build_dir %>/libs.js'
      }
    },


    // Configuration for the 'ngmin' task, used for AngularJS dependency injection annotation.
    ngmin: {
      dist: {
        src: [ '<%= build_dir %>/<%= pkg.name %>.js' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.annotated.js'
      }
    },


    // Configuration for the 'uglify' task, which minifies JavaScript code.
    uglify: {
      options: {
        banner: '<%= meta.banner %>' // Inserts the project banner at the top.
      },
      dist: {
        files: {
          '<%= build_dir %>/<%= pkg.name %>.min.js': [ '<%= build_dir %>/<%= pkg.name %>.annotated.js' ]
        }
      }
    },


    // Configuration for the 'recess' task, used for LESS compilation and linting.
    recess: {
      options: {
        compile: true,        // Compile LESS files into CSS.
        compress: false,      // Do not compress the output CSS.
        noUnderscores: false, // Allow underscores in class names.
        noIDs: false,         // Allow IDs in selectors.
        zeroUnits: false      // Do not remove units from zero values.
      },
      build: {
        src: [ '<%= app_files.less %>' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.css'
      },
      demo: {
        src: [ '<%= app_files.less %>', 'src/demo.less' ],
        dest: '<%= build_dir %>/<%= pkg.name %>-demo.css'
      }
    },


    // Configuration for the 'jshint' task, which checks JavaScript code quality.
    jshint: {
      src: [
        'Gruntfile.js',
        '<%= app_files.js %>',
        '<%= app_files.unit %>'
      ],
      test: [
        '<%= app_files.unit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,    // Enforce curly braces for all control statements.
        immed: true,    // Require immediate invocation of function expressions.
        newcap: true,   // Require constructors to be capitalized.
        noarg: true,    // Prohibit use of arguments.caller and arguments.callee.
        sub: true,      // Allow subscript notation for accessing properties.
        boss: true,     // Allow assignments in conditions.
        eqnull: true    // Allow `== null` for checking null or undefined.
      },
      globals: {}       // Define global variables here.
    },


    // Configuration for the 'karma' task, used for running unit tests.
    karma: {
      options: {
        configFile: 'karma/karma-unit.js' // Path to the Karma test configuration.
      },
      unit: {
        background: true // Run tests in the background and watch files.
      },
      continuous: {
        singleRun: true // Run tests once and then exit.
      }
    },


    // The 'delta' task (formerly 'watch') monitors files for changes and triggers other tasks.
    delta: {
      options: {
        livereload: true // Enable LiveReload for automatic browser refresh.
      },

      // When Gruntfile.js changes, only lint it and prevent livereload.
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      // When application JS files change, lint, concatenate, ng-min, and uglify them.
      src: {
        files: [
          '<%= app_files.js %>'
        ],
        tasks: [ 'jshint:src', /*'karma:unit:run',*/ 'concat:dist', 'ngmin:dist', 'uglify:dist' ]
      },

      // When HTML files change, re-process the main index.
      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index' ]
      },

      // When LESS files change, recompile them.
      less: {
        files: [ 'src/**/*.less' ],
        tasks: [ 'recess' ]
      },

      // When unit test files change, lint them and re-run tests.
      unittest: {
        files: [
          '<%= app_files.unit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    }
  } );

  // Rename the default 'watch' task to 'delta' to allow for custom watch logic.
  grunt.renameTask( 'watch', 'delta' );

  // Register a new 'watch' task that first performs a full build, then starts monitoring.
  grunt.registerTask( 'watch', [ 'default', /*'karma:unit',*/ 'delta' ] );


  // Define 'default' task as an alias for the 'build' task.
  grunt.registerTask( 'default', [ 'build' ] );

  // Define the 'build' task, encompassing all steps for a complete project build.
  grunt.registerTask( 'build', [ 'clean', 'jshint', /*'karma:continuous',*/ 'copy', 'concat', 'ngmin:dist', 'uglify', 'recess', 'index' ] );


  // A 'quick-build' task for faster iterations during development, skipping some heavy steps.
  grunt.registerTask( 'quick-build', [ 'clean', 'jshint', 'test', 'concat', 'recess', 'index' ] );


  // Custom 'index' task to process and copy HTML templates to the build directory.
  grunt.registerTask( 'index', 'Process index.html template', function() {
    grunt.file.copy( 'src/index.html', grunt.config.get( 'build_dir' ) + '/index.html', { process: grunt.template.process } );
    grunt.file.copy( 'src/sample1.html', grunt.config.get( 'build_dir' ) + '/sample1.html', { process: grunt.template.process } );
  } );

};