/*
 * This file is part of the stpa-modal project.
 * For more information, visit http://modal.stpa.co
 *
 * Copyright (c) 2014 Stewan Pacheco <talk@stpa.co>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


'use strict'; // Enforce strict mode for cleaner code.


// Gulp is a toolkit for automating painful or time-consuming tasks.
var gulp = require ( 'gulp' );


/*
 * The gulp-markdown plugin is used to compile Markdown to HTML.
 * This might be used for documentation generation.
 */
var markdown = require ( 'gulp-markdown' ) ;


/*
 * Defines a Gulp task named 'wiredep'.
 * This task is responsible for injecting Bower components into the HTML.
 */
gulp.task ( 'wiredep' , function ( ) {

  // Require the 'wiredep' stream for injecting dependencies.
  var wiredep = require ( 'wiredep' ) . stream ;


  // Start a Gulp stream from the 'src/doc/index.html' file.
  return gulp . src ( 'src/doc/index.html' )

    // Pipe the HTML file through the wiredep stream.
    . pipe ( wiredep ( {
            // Specify the directory where Bower components are installed.
            directory : 'bower_components' ,
            // Include dev dependencies in the injection process.
            devDependencies : true
          } ) )

    // Write the modified HTML file back to the source documentation directory.
    . pipe ( gulp . dest ( 'src/doc' ) ) ;

} ) ;