module.exports = function( grunt )
{
  // This is the main Grunt configuration function.
  // It takes the 'grunt' object as an argument.
  grunt.initConfig (
  {
    // Project-specific configuration variables
    pkg     : grunt.file.readJSON( 'package.json' ) ,
    dist    : 'dist' ,

    // Define source file groups for various tasks
    sources :
    {
      terrific_js :
      [
        'src/core/Tc.Start.js' ,
        'src/core/oo.js' ,
        'src/core/Tc.Config.js' ,
        'src/core/Tc.Application.js' ,
        'src/core/Tc.Sandbox.js' ,
        'src/core/Tc.Module.js' ,
        'src/core/Tc.Connector.js' ,
        'src/core/Tc.Utils.js' ,
        'src/core/Tc.Utils.String.js' ,
        'src/core/Tc.End.js'
      ]
    } , // End of sources configuration

    // Task: Concatenate JavaScript files
    concat :
    {
      options :
      {
        process : true
      } ,
      terrific_js :
      {
        src  : '<%= sources.terrific_js %>' ,
        dest : '<%= dist %>/<%= pkg.name %>.js'
      }
    } , // End of concat configuration

    // Task: Lint JavaScript files using JSHint
    jshint :
    {
      options :
      {
        jshintrc : true
      } ,
      terrific_js : [ '<%= dist %>/<%= pkg.name %>.js' ]
    } , // End of jshint configuration

    // Task: Uglify (minify) JavaScript files
    uglify :
    {
      options :
      {
        preserveComments : 'some' // Keep some comments (e.g., license headers)
      } ,
      terrific_js :
      {
        src  : '<%= dist %>/<%= pkg.name %>.js' ,
        dest : '<%= dist %>/<%= pkg.name %>.min.js'
      }
    } , // End of uglify configuration

    // Task: Run QUnit tests
    qunit :
    {
      terrific_js : [ 'test/core/jquery.html' , 'test/core/zepto.html' ]
    } , // End of qunit configuration

    // Task: Generate YUIDoc documentation
    yuidoc :
    {
      terrific_js :
      {
        name    : '<%= pkg.name %>' ,
        version : '<%= pkg.version %>' ,
        url     : '<%= pkg.url %>' ,
        options :
        {
          paths  : '<%= dist %>' ,
          outdir : '<%= dist %>/docs/'
        }
      }
    } , // End of yuidoc configuration

    // Task: Update JSON files based on package.json
    update_json :
    {
      bower :
      {
        src    : 'package.json' ,
        dest   : 'bower.json' ,
        fields :
        [
          'name' ,
          'version' ,
          'description' ,
          'main' ,
          'license'
        ]
      }
    } , // End of update_json configuration

    // Task: Clean directories and files
    clean :
    {
      options :
      {
        force : true // Force deletion of files outside current working directory
      } ,
      dist :
      {
        src :
        [
          '<%= dist %>' // Clean the entire distribution folder
        ]
      }
    } // End of clean configuration
  }
  ) ; // End of grunt.initConfig call

  // --- Load Grunt task plugins ---
  grunt.loadNpmTasks ( 'grunt-contrib-concat' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-uglify' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-yuidoc' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-clean' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-qunit' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;
  grunt.loadNpmTasks ( 'grunt-update-json' ) ;

  // --- Define custom task pipelines ---
  grunt.registerTask ( 'sync-json' , [ 'update_json:bower' ] ) ;
  grunt.registerTask ( 'build-js'  , [ 'concat:terrific_js'  ] ) ;
  grunt.registerTask ( 'hint-js'   , [ 'jshint:terrific_js'  ] ) ;
  grunt.registerTask ( 'min-js'    , [ 'uglify:terrific_js'  ] ) ;
  grunt.registerTask ( 'test-js'   , [ 'qunit:terrific_js'   ] ) ;
  grunt.registerTask ( 'doc'       , [ 'yuidoc:terrific_js'  ] ) ;

  // --- Register the default task, which runs all main build steps ---
  grunt.registerTask ( 'default' ,
  [
    'clean'       ,       // 1. Clean the distribution directory
    'build-js'    ,       // 2. Concatenate JavaScript
    'hint-js'     ,       // 3. Lint concatenated JavaScript
    'sync-json'   ,       // 4. Synchronize JSON files (e.g., bower.json)
    'doc'         ,       // 5. Generate documentation
    'min-js'      ,       // 6. Minify JavaScript
    'test-js'             // 7. Run unit tests
  ]
  ) ;
} ;