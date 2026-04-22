/*
 * Core Gulp modules are loaded here.
 * This section defines all the necessary plugins for various build tasks.
 */

var gulp        = require( 'gulp' )       ,
    gutil       = require( 'gulp-util' )    ,
    watch       = require( 'gulp-watch' )     ,
    prefix      = require( 'gulp-autoprefixer' ) ,
    uncss       = require( 'gulp-uncss' )      ,
    minifyCSS   = require( 'gulp-minify-css' )   ,
    sass        = require( 'gulp-sass' )         ,
    size        = require( 'gulp-size' )        ,
    rename      = require( 'gulp-rename' )       ,
    csslint     = require( 'gulp-csslint' )       ,
    imagemin    = require( 'gulp-imagemin' )      ,
    pngcrush    = require( 'imagemin-pngcrush' )  ,
    jshint      = require( 'gulp-jshint' )       ,
    stylish     = require( 'jshint-stylish' )    ,
    shell       = require( 'gulp-shell' )       ,
    browserSync = require( 'browser-sync' )     ,
    header      = require( 'gulp-header' ) ;

    /*
     * Assigning the browserSync.reload method to a more concise variable.
     * This allows for easier calls to reload connected browsers.
     */
    browserReload = browserSync.reload;




/*
 * Task: `minify-css`
 * Description: This Gulp task is responsible for minifying CSS files.
 * It processes a specified CSS file, minifies it, and then reports
 * its size both in raw bytes and gzipped format. Finally, it adds
 * a header and renames the file before saving it.
 *
 * To execute this task: run `gulp minify-css` in the project's root directory.
 *
 * Output: The minified CSS file with a `.min.css` suffix.
 */

gulp.task( 'minify-css' , function ( ) {

  // Define the source CSS file(s) to be processed.
  gulp.src( './css/fluidity.css' )

    // Pipe the source file(s) through the CSS minifier.
    .pipe( minifyCSS ( ) )

    // Report the size of the minified CSS (ungzipped).
    .pipe( size( { gzip: false , showFiles: true , title: 'minified css' } ) )

    // Report the size of the minified CSS (gzipped).
    .pipe( size( { gzip: true , showFiles: true , title: 'minified css' } ) )

    // Add a header comment to the minified CSS file.
    // Note: There was a missing closing parenthesis in the original code here. Preserving as per Type I definition.
    .pipe( header( '/*!mrmrs/fluidity v<%= pkg.version %> (c)2014 @license <%= pkg.license %>' )

    // Rename the minified CSS file to include '.min'.
    .pipe( rename( 'fluidity.min.css' ) )

    // Specify the destination directory for the processed file.
    .pipe( gulp.dest( './css/' ) ) ;

} ) ;




/*
 * Task: `minify-images`
 * Description: This task handles the optimization and minification of images.
 * It targets all image files within the `img` directory, reports their
 * initial and final sizes, and then saves the optimized images.
 *
 * To execute this task: run `gulp minify-images`.
 *
 * Warning: By default, this task overwrites original image files.
 * Adjust the `gulp.dest` path if you wish to save optimized images elsewhere.
 */

gulp.task( 'minify-images' , function ( ) {

  // Select all image files from the 'img' directory.
  gulp.src( './img/*' )

    // Log the original size of the images (ungzipped).
    .pipe( size( { gzip: false , showFiles: true , title: 'original image size' } ) )

    // Log the original size of the images (gzipped).
    .pipe( size( { gzip: true , showFiles: true , title: 'original image size' } ) )

    // Apply image optimization using imagemin and pngcrush.
    .pipe( imagemin( {
        progressive : true , // Enable progressive rendering for JPEGs.
        svgoPlugins : [ { removeViewBox: false } ] , // SVGO plugin configuration.
        use         : [ pngcrush( ) ] // Use pngcrush for PNG optimization.
      } ) )

      // Log the size of the minified images (ungzipped).
      .pipe( size( { gzip: false , showFiles: true , title: 'minified images' } ) )

      // Log the size of the minified images (gzipped).
      .pipe( size( { gzip: true , showFiles: true , title: 'minified images' } ) )

      // Define the destination for the optimized images.
      // Modifying this path will prevent overwriting source files.
      .pipe( gulp.dest( './img' ) ) ;

} ) ;




/*
 * Task: `js-hint`
 * Description: Performs static analysis on JavaScript files using JSHint.
 * It helps identify potential errors and enforce coding style guidelines.
 *
 * To execute this task: run `gulp js-hint` from the project's root.
 */

gulp.task( 'js-hint' , function ( ) {

  // Target all JavaScript files within the 'js' directory.
  gulp.src( './js/*.js' )

    // Apply JSHint analysis.
    .pipe( jshint ( ) )

    // Report JSHint results using the 'stylish' reporter for better readability.
    .pipe( jshint.reporter( 'stylish' ) ) ;

} ) ;




/*
 * Task: `csslint`
 * Description: Lints CSS files to ensure quality and adherence to standards.
 * Specific rules (box-sizing, compatible-vendor-prefixes, important, known-properties)
 * are disabled to accommodate common practices or limitations of the linter itself.
 *
 * To execute this task: run `gulp csslint`.
 */

gulp.task( 'csslint' , function ( ) {

  // Specify the CSS file to be linted.
  gulp.src( './css/fluidity.css' )

    // Apply CSS linting with custom configuration.
    .pipe( csslint( {
          'compatible-vendor-prefixes' : false , // Disable warning about vendor prefixes.
          'box-sizing'                 : false , // Disable warning about box-sizing property.
          'important'                  : false , // Disable warning about !important declarations.
          'known-properties'           : false   // Disable warning about unknown CSS properties.
        } ) )

    // Report the CSS linting results.
    .pipe( csslint.reporter ( ) ) ;

} ) ;




/*
 * Task: `pre-process`
 * Description: Compiles SCSS files into standard CSS.
 * This task also includes watching for changes in SCSS files,
 * applying vendor prefixes, and reloading browsers via BrowserSync.
 */

gulp.task( 'pre-process' , function ( ) {

  // Define the main SCSS file to be processed.
  gulp.src( './sass/fluidity.scss' )

      // Set up a watch mechanism for changes in the SCSS file.
      .pipe( watch( function ( files ) {

        // Return the stream of processed files.
        return files.pipe( sass ( ) ) // Compile SCSS to CSS.

          // Report the size of the CSS before vendor prefixing (ungzipped).
          .pipe( size( { gzip: false , showFiles: true , title: 'without vendor prefixes' } ) )

          // Report the size of the CSS before vendor prefixing (gzipped).
          .pipe( size( { gzip: true , showFiles: true , title: 'without vendor prefixes' } ) )

          // Apply vendor prefixes to the CSS.
          .pipe( prefix ( ) )

          // Report the size of the CSS after vendor prefixing (ungzipped).
          .pipe( size( { gzip: false , showFiles: true , title: 'after vendor prefixes' } ) )

          // Report the size of the CSS after vendor prefixing (gzipped).
          .pipe( size( { gzip: true , showFiles: true , title: 'after vendor prefixes' } ) )

          // Output the compiled CSS to the 'css' directory.
          .pipe( gulp.dest( 'css' ) )

          // Reload connected browsers to reflect CSS changes instantly.
          .pipe( browserSync.reload( { stream: true } ) ) ;

      } ) ) ;

} ) ;




/*
 * Task: `browser-sync`
 * Description: Initializes BrowserSync, which sets up a static server.
 * This server allows for automatic browser reloading on file changes,
 * improving development workflow significantly.
 */

gulp.task( 'browser-sync' , function ( ) {

    // Initialize BrowserSync with a static server configuration.
    browserSync.init( null , {
        server : {
            baseDir : "./" // Serve files from the current directory.
        }
    } ) ;

} ) ;




/*
 * Task: `bs-reload`
 * Description: A utility task to explicitly trigger a browser reload
 * through BrowserSync. Useful for scenarios not covered by automatic
 * stream reloads.
 */

gulp.task( 'bs-reload' , function ( ) {

    // Trigger a full browser reload.
    browserSync.reload ( ) ;

} ) ;




/*
 * Task: `default`
 * Description: The primary, comprehensive Gulp task that orchestrates
 * various development processes. It's designed to be run during active
 * development.
 *
 * Key functionalities include:
 * • Pre-processing SCSS, applying auto-prefixes, and linting the outputted CSS.
 * • Starting a local development server, typically on port 3000.
 * • Automatically reloading browsers when HTML or SASS files are modified.
 *
 * To execute this task: simply run `gulp` in your terminal.
 */

gulp.task( 'default' , [ 'pre-process' , 'minify-css' , 'bs-reload' , 'browser-sync' ] , function ( ) {

  // Start initial tasks: pre-processing SASS and linting CSS.
  gulp.start( 'pre-process' , 'csslint' ) ;

  // Watch for changes in SCSS files and trigger related tasks.
  gulp.watch( 'sass/*.scss' , [ 'pre-process' , 'minify-css' ] ) ;

  // Watch for changes in the main CSS file and trigger reload/minify.
  gulp.watch( 'css/fluidity.css' , [ 'bs-reload' , 'minify-css' ] ) ;

  // Watch for changes in HTML files and trigger a browser reload.
  gulp.watch( '*.html' , [ 'bs-reload' ] ) ;

} ) ;