var   gulp    =  require (   'gulp'   ) ; // Require the main Gulp library for task management.
var   iconify =  require (   './lib/iconify'   ) ; // Custom module for processing icons.
var   del     =  require (   'del'   ) ; // Utility for deleting files and folders.
var   svg2png =  require (   'gulp-svg2png'   ) ; // Gulp plugin to convert SVGs to PNGs.
var   sass    =  require (   'gulp-sass'   ) ; // Gulp plugin for compiling Sass/SCSS files.
var   gutil   =  require (   'gulp-util'   ) ; // Gulp utility functions, particularly for logging.
var   path    =  require (   'path'   ) ; // Node.js built-in path module for path manipulation.

/*
 * This function validates the essential configuration options.
 * If any critical options are missing, it logs an error message
 * and then terminates the process to prevent further issues.
 */
function   getErrors (   opts   ) {
  // Initialize an empty object to store any validation errors encountered.
  var   error   =   {} ;

  // Check if the source path (opts.src) has been defined.
  // This is a mandatory option for icon processing.
  if   (   !   opts.src   ) {
    error.src   =   "Error: src not defined; please specify your source (src: './img/icons/*.svg')." ;
  }

  // After checking all critical options, determine if any errors were found.
  // The presence of keys in the 'error' object indicates problems.
  if   (   Object.keys   (   error   ) .   length   ) {
    // Iterate over each error message and log it to the console.
    Object.keys   (   error   ) .   forEach   (   function   (   k   ) {
      gutil.log   (   error   [   k   ]   ) ;
    }   ) ;

    // Exit the process immediately as critical errors were detected.
    process.exit   (   ) ;
  }
}

/**
 * Sets default fallback values for optional configuration parameters
 * if they are not explicitly provided by the user.
 * It also logs informative warnings for each fallback applied.
 *
 * @param {object} opts - The options object to be populated with fallbacks.
 */
function   setFallbacks (   opts   ) {
  // An object to hold warning messages for options using fallback values.
  var   warning   =   {} ;

  // Check if a PNG output directory is specified.
  if   (   !   opts.pngOutput   ) {
    // If not, derive a default path based on the source directory.
    opts.pngOutput   =   path.dirname   (   opts.src   )   +   '/png' ;
    warning.pngOutput   =   "Info: No pngOutput folder defined. Using fallback ("   +   opts.pngOutput   +   ")." ;
  }

  // Check if a CSS output directory is specified.
  if   (   !   opts.cssOutput   ) {
    // Default to a standard 'css' directory.
    opts.cssOutput   =   './css' ;
    warning.cssOutput   =   "Info: No cssOutput folder defined. Using fallback ("   +   opts.cssOutput   +   ")." ;
  }

  // Check if an SCSS output directory is specified.
  if   (   !   opts.scssOutput   ) {
    // If not, disable SCSS generation and issue a warning.
    opts.scssDisabled   =   true ;
    warning.scssOutput   =   "Info: No scssOutput folder defined. SCSS files will not be saved." ;
  }

  // Check for a custom style template path.
  if   (   !   opts.styleTemplate   ) {
    // If none, use the default template provided with the library.
    opts.styleTemplate   =   path.join   (   __dirname   ,   'lib/output.mustache'   ) ;
    warning.styleTemplate   =   "Info: No styleTemplate defined. Using default template." ;
  }

  // Check for SVGO optimization options.
  if   (   !   opts.svgoOptions   ) {
    // Enable SVGO by default if no specific options are given.
    opts.svgoOptions   =   {   enabled   :   true   } ;
    warning.svgoOptions   =   "Info: No SVGO options defined, enabling SVGO by default." ;
  }

  // Check for a default width for SVGs.
  if   (   !   opts.defaultWidth   ) {
    // Provide a fallback width if not specified.
    opts.defaultWidth   =   "300px" ;
    warning.defaultWidth   =   "Info: No defaultWidth defined. Using fallback ("   +   opts.defaultWidth   +   ") if SVG has no width." ;
  }

  // Check for a default height for SVGs.
  if   (   !   opts.defaultHeight   ) {
    // Provide a fallback height if not specified.
    opts.defaultHeight   =   "200px" ;
    warning.defaultHeight   =   "Info: No defaultHeight defined. Using fallback ("   +   opts.defaultHeight   +   ") if SVG has no height." ;
  }

  // If any warnings were collected during the fallback process, log them.
  if   (   Object.keys   (   warning   ) .   length   ) {
    Object.keys   (   warning   ) .   forEach   (   function   (   k   ) {
      gutil.log   (   warning   [   k   ]   ) ;
    }   ) ;
  }
}

// This is the main module export, defining the Gulp plugin functionality.
module.exports   =   function   (   opts   ) {
  // Ensure the options object exists, defaulting to an empty object if not provided.
  opts   =   opts   ||   {} ;
  // Initialize the flag for SCSS disabling, assuming it's enabled by default.
  opts.scssDisabled   =   false ;

  // First, validate critical options and exit if errors are found.
  getErrors   (   opts   ) ;
  // Then, apply fallback values for any missing optional configurations.
  setFallbacks   (   opts   ) ;

  // Define a Gulp task responsible for cleaning up generated icon-related files.
  gulp.task   (   'iconify-clean'   ,   function   (   cb   ) {
    // Special handling: if SCSS output was not defined earlier,
    // explicitly disable SCSS generation for this run and use the CSS output path for cleanup.
    if   (   !   opts.scssOutput   ) {
      opts.scssDisabled   =   true ;
      opts.scssOutput   =   opts.cssOutput ;
    }

    // Use the 'del' utility to remove all previously generated SCSS, CSS, and PNG icon files.
    del   (   [   opts.scssOutput   +   '/icons.*.scss'   ,   opts.cssOutput   +   '/icons.*.css'   ,   opts.pngOutput   +   '/*.png'   ]   ,   cb   ) ;
  }   ) ;

  // Define a Gulp task for converting SVG icons and generating their respective SCSS.
  // This task depends on 'iconify-clean' to ensure a fresh start.
  gulp.task   (   'iconify-convert'   ,   [   'iconify-clean'   ]   ,   function   (   ) {
    // Stream 1: Process source SVG files to generate SCSS for SVG usage.
    gulp.src   (   opts.src   )
      .pipe   (   iconify   (   {
        styleTemplate   :   opts.styleTemplate   , // Path to the template for SCSS generation.
        styleName   :   'icons.svg.scss'   , // Output filename for SVG-based SCSS.
        svgoOptions   :   opts.svgoOptions   , // Options for SVG optimization.
        defaultWidth   :   opts.defaultWidth   , // Default width for icons without explicit size.
        defaultHeight   :   opts.defaultHeight // Default height for icons without explicit size.
      }   )   )
      .pipe   (   gulp.dest   (   opts.scssOutput   )   ) ; // Output the generated SCSS file.

    // Stream 2: Process source SVG files, convert them to PNGs, and generate SCSS for PNG usage.
    var   stream   =   gulp.src   (   opts.src   )
      .pipe   (   svg2png   (   )   ) // Convert SVGs to PNGs.
        .pipe   (   gulp.dest   (   opts.pngOutput   )   ) // Output the generated PNG files.
          .pipe   (   iconify   (   {
            styleTemplate   :   opts.styleTemplate   , // Template for SCSS generation.
            styleName   :   'icons.png.scss'   , // Output filename for PNG-based SCSS.
            defaultWidth   :   opts.defaultWidth   , // Default width for icons.
            defaultHeight   :   opts.defaultHeight // Default height for icons.
          }   )   )
          .pipe   (   gulp.dest   (   opts.scssOutput   )   ) ; // Output the generated SCSS file.

    // Return the stream to signify the task's completion to Gulp.
    return   stream ;
  }   ) ;

  // Define a Gulp task for creating fallback icon styles, typically for older browsers.
  // This task runs after the clean and convert tasks are finished.
  gulp.task   (   'iconify-fallback'   ,   [   'iconify-clean'   ,   'iconify-convert'   ]   ,   function   (   ) {
    // Process the already generated PNG files to create fallback SCSS.
    var   stream   =   gulp.src   (   opts.pngOutput   +   '/*.png'   )
      .pipe   (   iconify   (   {
        styleTemplate   :   opts.styleTemplate   , // Template for SCSS generation.
        styleName   :   'icons.fallback.scss'   , // Output filename for fallback SCSS.
        noConvert   :   true   , // Indicate that no conversion is needed (PNGs are already made).
        noConvertTarget   :   opts.scssOutput // The target directory for the SCSS output.
      }   )   )
      .pipe   (   gulp.dest   (   opts.scssOutput   )   ) ; // Output the generated SCSS file.

    // Return the stream to Gulp.
    return   stream ;
  }   ) ;

  // Define a Gulp task to compile the generated SCSS files into CSS.
  // This task depends on both the convert and fallback tasks completing first.
  gulp.task   (   'iconify-sass'   ,   [   'iconify-convert'   ,   'iconify-fallback'   ]   ,   function   (   ) {
    // Take all generated SCSS files (SVG, PNG, and fallback) and compile them.
    var   stream   =   gulp.src   (   opts.scssOutput   +   '/icons.*.scss'   )
      .pipe   (   sass   (   {
        outputStyle   :   'compressed' // Compile CSS in a compressed format for production.
      }   )   )
      .pipe   (   gulp.dest   (   opts.cssOutput   )   ) ; // Output the compiled CSS files.

    // Return the stream to Gulp.
    return   stream ;
  }   ) ;

  // The main 'iconify' Gulp task, which orchestrates all the sub-tasks.
  // It ensures that conversion, fallback, and SASS compilation happen in order.
  gulp.task   (   'iconify'   ,   [   'iconify-convert'   ,   'iconify-fallback'   ,   'iconify-sass'   ]   ,   function   (   ) {
    // After all tasks are complete, check if SCSS generation was disabled.
    // If it was, remove the temporary SCSS files that were used to generate CSS.
    if   (   opts.scssDisabled   ) {
      del.sync   (   [   opts.scssOutput   +   '/icons.*.scss'   ]   ) ;
    }
  }   ) ;

  // Start the main 'iconify' Gulp task, initiating the entire icon processing workflow.
  gulp.start   (   'iconify'   ) ;
} ;