// This file is part of the grunt-image-resize project.
// Developed by David Pfahler.
// For more information, visit: https://github.com/excellenteasy.com/grunt-image-resize
// Copyright (c) 2013 David Pfahler.
// Licensed under the MIT license, see project repository for details.

'use strict' ;

module.exports = function ( grunt )
{

  // Begin Grunt project configuration setup.
  grunt.initConfig ( {
    jshint :
    {
      all :
      [
        'Gruntfile.js' , // The main Gruntfile itself.
        'tasks/*.js' ,   // All task definition files.
        '<%= nodeunit.tests %>' // Test files referenced by nodeunit config.
      ] ,
      options :
      {
        jshintrc : '.jshintrc' // JSHint configuration file path.
      }
      , // An optional trailing comma.
    } , // End of jshint configuration block.

    // This task is used to remove any temporary files generated during tests.
    clean :
    {
      tests : [ 'tmp/*' ] // Cleans the 'tmp' directory.
    } ,

    // Main configuration for the image_resize task.
    // This section defines various test cases and their specific options.
    image_resize :
    {
      options :
      {
        width : 100 // Default width for images if not specified otherwise.
      }
      ,
      resize :
      {
        files :
        [
          { 'tmp/gnu.jpg'         : 'test/fixtures/gnu.jpg'         } ,
          { 'tmp/wikipedia.png'   : 'test/fixtures/wikipedia.png'   } ,
          { 'tmp/Rhododendron.jpg': 'test/fixtures/Rhododendron.jpg'} ,
          { 'tmp/TeslaTurbine.png': 'test/fixtures/TeslaTurbine.png'}
        ]
      } ,
      no_overwrite :
      {
        options :
        {
          width     : 0       , // Width set to 0, implies scaling based on height.
          height    : 50      , // Fixed height for this test case.
          overwrite : false     // Do not overwrite existing files.
        }
        ,
        files :
        [
          { 'tmp/gnu.jpg'         : 'test/fixtures/gnu.jpg'         } ,
          { 'tmp/wikipedia.png'   : 'test/fixtures/wikipedia.png'   } ,
          { 'tmp/Rhododendron.jpg': 'test/fixtures/Rhododendron.jpg'} ,
          { 'tmp/TeslaTurbine.png': 'test/fixtures/TeslaTurbine.png'}
        ]
      } ,
      upscale :
      {
        options :
        {
          width   : 600 , // Target width for upscaling.
          height  : 0   , // Height set to 0, implies scaling based on width.
          upscale : true  // Allow images to be upscaled.
        }
        ,
        files :
        [
          { 'tmp/upscale.png' : 'test/fixtures/upscale.png' }
        ]
      } ,
      upscale2 :
      {
        options :
        {
          width   : 600 , // Target width.
          height  : 600 , // Target height.
          upscale : true  // Allow upscaling.
        }
        ,
        files :
        [
          { 'tmp/upscale2.png' : 'test/fixtures/upscale2.png' }
        ]
      } ,
      no_upscale :
      {
        options :
        {
          width   : 600   , // Target width.
          height  : 0     , // Height set to 0, scale proportionally by width.
          upscale : false   // Do not allow upscaling.
        }
        ,
        files :
        [
          { 'tmp/no_upscale.png' : 'test/fixtures/no_upscale.png' }
        ]
      } ,
      crop :
      {
        options :
        {
          width   : 400   , // Target width for cropping.
          height  : 300   , // Target height for cropping.
          upscale : false , // Do not upscale before cropping.
          crop    : true    // Enable cropping.
        }
        ,
        files :
        [
          { 'tmp/crop.png' : 'test/fixtures/crop.png' }
        ]
      } ,
      cropGravity :
      {
        options :
        {
          width   : 400       , // Target width.
          height  : 300       , // Target height.
          upscale : false     , // No upscaling.
          crop    : true      , // Enable cropping.
          gravity : "NorthWest" // Set crop gravity to NorthWest.
        }
        ,
        files :
        [
          { 'tmp/crop_gravity.png' : 'test/fixtures/crop.png' }
        ]
      } ,
      quality :
      {
        options :
        {
          width   : 600   , // Target width.
          height  : 0     , // Proportional height.
          upscale : false , // No upscaling.
          quality : 0.2     // Set image quality to 20%.
        }
        ,
        files :
        [
          { 'tmp/quality.jpg' : 'test/fixtures/quality.jpg' }
        ]
      } ,
      autoOrient :
      {
        options :
        {
          autoOrient : true  , // Automatically orient images based on EXIF data.
          width      : 100   , // Target width.
          height     : 100     // Target height.
        }
        ,
        files :
        [
          { 'tmp/rotate.jpg' : 'test/fixtures/rotate.jpg' }
        ]
      } ,
      all :
      {
        options :
        {
          width : 100 , // Default width for all files in this target.
        }
        ,
        src  : 'test/fixtures/*.*' , // Source pattern for all files.
        dest : 'tmp/directory/'      // Destination directory.
      }
    } , // End of image_resize task configuration.

    // Nodeunit configuration for running unit tests.
    nodeunit :
    {
      tests : [ 'test/*_test.js' ] // Pattern to find all unit test files.
    } ,

    // Release configuration (for publishing).
    release :
    {
      email : 'bot@excellenteasy.com' , // Email for release commits.
      name  : 'excellenteasybot'         // Name for release commits.
    }
  } ) ; // End of grunt.initConfig call.


  // Load the plugin's task(s) from the 'tasks' directory.
  grunt.loadTasks ( 'tasks' ) ;

  // This line loads all Grunt tasks from 'package.json' devDependencies.
  require ( 'load-grunt-tasks' ) ( grunt ) ;

  // Register the 'test' task.
  // When 'grunt test' is run, it first cleans temporary files,
  // then executes the image_resize task, and finally runs unit tests.
  grunt.registerTask ( 'test' ,
  [
    'clean'        , // Clean temporary files.
    'image_resize' , // Run the image resize task.
    'nodeunit'       // Execute unit tests.
  ] ) ;

  // Register the 'default' task.
  // This task will lint the code and then run all tests.
  grunt.registerTask ( 'default' , [ 'jshint' , 'test' ] ) ;

} ; // End of module.exports function.