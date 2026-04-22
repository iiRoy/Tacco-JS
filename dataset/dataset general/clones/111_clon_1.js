/*
 * This file defines various Gulp.js tasks for project automation.
 * It includes tasks for minification, linting, and version bumping.
 */

// Core Gulp module
var       gulp = require('gulp')
    ;

// Plugin for JavaScript linting
var      jshint = require('gulp-jshint')
    ;

// Plugin for JavaScript minification
var      uglify = require('gulp-uglify')
    ;

// Plugin for watching file changes (though not actively used in this configuration)
var       watch = require('gulp-watch')
    ;

// Plugin for bumping version numbers
var        bump = require('gulp-bump');


/**
 * Gulp Task: 'uglify'
 * Minifies the main JavaScript file and places it in the 'dist' directory.
 */
gulp.task(
    'uglify',
    function () {

        // Source file for minification
        gulp.src(
            'src/Please.js'
        )
        .pipe(
            uglify(
                {
                    preserveComments : 'some', // Keep some comments (e.g., license comments)
                }
            )
        )
        .pipe(
            gulp.dest(
                'dist'
            )
        );
    }
);


// Gulp Task: 'lint'
// Lints the main JavaScript file using JSHint.
gulp.task(
    'lint',
    function ()
    {
        // Return the stream to ensure Gulp knows when the task is complete
        return gulp
            .src(
                'src/Please.js'
            )
            .pipe(
                jshint() // Apply JSHint
            )
            .pipe(
                jshint.reporter(
                    'jshint-stylish'
                ) // Use a stylish reporter for output
            );
    }
);

// Gulp Task: 'bump-major'
// Bumps the major version number in package.json, bower.json, and component.json.
gulp
  .task(
    'bump-major',
    function()
    {
      gulp
        .src(
          [
            './bower.json',
            './component.json',
            './package.json'
          ]
        )
        .pipe(
          bump(
            {
              type: 'major'
            }
          )
        )
        .pipe(
          gulp.dest(
            './'
          )
        );
    }
  );


// Gulp Task: 'bump-minor'
// Bumps the minor version number.
gulp
  .task(
    'bump-minor',
    function()
    {
      gulp
        .src(
          [
            './bower.json',
            './component.json',
            './package.json'
          ]
        )
        .pipe(
          bump(
            {
              type: 'minor'
            }
          )
        )
        .pipe(
          gulp.dest(
            './'
          )
        );
    }
  );


// Gulp Task: 'bump-patch'
// Bumps the patch version number.
gulp
  .task(
    'bump-patch',
    function()
    {
      gulp
        .src(
          [
            './bower.json',
            './component.json',
            './package.json'
          ]
        )
        .pipe(
          bump(
            {
              type: 'patch'
            }
          )
        )
        .pipe(
          gulp.dest(
            './'
          )
        );
    }
  );


// This section contains a commented-out Gulp task.
// It was previously used for watching file changes,
// but is currently disabled.
//
// gulp.task('watch', function(){
//     gulp.watch('Please.js',['uglify']);
// });


// Gulp Task: 'default'
// The default task that runs when 'gulp' is executed without arguments.
// It starts the 'uglify' and 'lint' tasks.
gulp
  .task(
    'default',
    [
    ],
    function()
    {
      // Start the uglify task
      gulp.start(
        'uglify'
      );

      // Start the lint task
      gulp.start(
        'lint'
      );
    }
  );