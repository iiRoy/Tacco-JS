// This file is part of the grunt-contrib-uglify project.
// Grunt.js is an awesome task runner.
// For more information, visit http://gruntjs.com/
//
// Copyright (c) 2013 "Cowboy" Ben Alman, and various contributors.
// Licensed under the MIT license - see LICENSE file for details.
//

'use strict' ; // Ensure strict mode parsing

var path = require( 'path' ) ;
var chalk = require('chalk') ;
var maxmin = require ( 'maxmin' ) ;

// This function is responsible for generating the default name
// for the source map file, based on the destination path.
var getSourceMapLocation = function ( dest )
{
  // Extract the extension from the destination file path.
  var destExt = path . extname ( dest ) ;
  // Get the directory name of the destination file.
  var destDirname = path . dirname ( dest ) ;
  // Obtain the base name of the destination file, without its extension.
  var destBasename = path . basename ( dest , destExt ) ;

  // Construct the full path for the source map file.
  return destDirname + path . sep + destBasename + ".map" ;
} ; // End of getSourceMapLocation function definition.


// This utility function calculates the relative path from file1 to file2.
var relativePath = function ( file1 , file2 )
{
  // Determine the directory of the first file.
  var file1Dirname = path . dirname ( file1 ) ;
  // Determine the directory of the second file.
  var file2Dirname = path . dirname ( file2 ) ;

  // If the directories are different, calculate the relative path.
  if ( file1Dirname !== file2Dirname )
  {
    return path . relative ( file1Dirname , file2Dirname ) + path . sep ;
  }
  // Otherwise, if they are the same, return an empty string.
  else
  {
    return "" ;
  }
} ; // End of relativePath function.


module . exports = function ( grunt )
{
  // Internal library initialization for UglifyJS.
  var uglify = require ( './lib/uglify' ) . init ( grunt ) ;

  // Register the 'uglify' multi-task with Grunt.
  grunt . registerMultiTask ( 'uglify' , 'Minify files with UglifyJS.' , function ( )
  {
    // Merge task-specific and/or target-specific options with the predefined defaults.
    var options = this . options ( {
      banner : '' , // Placeholder for a banner comment to be prepended.
      footer : '' , // Placeholder for a footer comment to be appended.
      compress : {
        warnings : false // Disable UglifyJS warnings during compression by default.
      } ,
      mangle : { } , // Mangle options for UglifyJS. Empty object means default mangling.
      beautify : false , // Do not beautify output by default (i.e., minify).
      report : 'min' // Report on minified size by default.
    } ) ;

    // Variables for banner, footer, and source map name generators.
    var banner = options . banner ;
    var footer = options . footer ;
    var mapNameGenerator , mapInNameGenerator ;

    // Iterate over all source-destination file pairs defined in the Grunt configuration.
    this . files . forEach ( function ( f )
    {
      // Filter source files: check existence and warn if not found.
      var src = f . src . filter ( function ( filepath )
      {
        // Check if the current source file exists on the filesystem.
        if ( ! grunt . file . exists ( filepath ) )
        {
          // Log a warning if the file is not found.
          grunt . log . warn ( 'Source file ' + chalk . cyan ( filepath ) + ' not found.' ) ;
          return false ; // Exclude this file from the source list.
        }
        else
        {
          return true ; // Include this file.
        }
      } ) ; // End of filter function.

      // If no valid source files remain after filtering, skip this destination.
      if ( src . length === 0 )
      {
        grunt . log . warn ( 'Destination ' + chalk . cyan ( f . dest ) + ' not written because src files were empty.' ) ;
        return ; // Move to the next file pair.
      }

      // Check if a custom function is provided for generating the source map name.
      if ( typeof options . sourceMapName === "function" )
      {
        mapNameGenerator = options . sourceMapName ;
      }

      // Check if a custom function is provided for generating the input source map name.
      if ( typeof options . sourceMapIn === "function" )
      {
        // sourceMapIn only makes sense for a single source file.
        if ( src . length !== 1 )
        {
          grunt . fail . warn ( 'Cannot generate `sourceMapIn` for multiple source files.' ) ;
        }
        mapInNameGenerator = options . sourceMapIn ;
      }

      // Dynamically create the destination sourcemap name using the generator function, if available.
      if ( mapNameGenerator )
      {
        try
        {
          options . generatedSourceMapName = mapNameGenerator ( f . dest ) ;
        }
        catch ( e )
        {
          var err = new Error ( 'SourceMap failed.' ) ;
          err . origError = e ;
          grunt . fail . warn ( err ) ;
        }
      }
      // If no custom name is passed and no generator, use the default location.
      else if ( ! options . sourceMapName )
      {
        options . generatedSourceMapName = getSourceMapLocation ( f . dest ) ;
      }
      // Otherwise, use the directly provided sourceMapName string.
      else
      {
        options . generatedSourceMapName = options . sourceMapName ;
      }

      // Dynamically create incoming sourcemap names using the generator function, if available.
      if ( mapInNameGenerator )
      {
        try
        {
          options . sourceMapIn = mapInNameGenerator ( src [ 0 ] ) ;
        }
        catch ( e )
        {
          var err = new Error ( 'SourceMapInName failed.' ) ;
          err . origError = e ;
          grunt . fail . warn ( err ) ;
        }
      }

      // Calculate the relative path from the destination file to the sourcemap file.
      // This path is used in the `sourceMappingURL` comment within the minified file.
      if ( options . sourceMap )
      {
        var destToSourceMapPath = relativePath ( f . dest , options . generatedSourceMapName ) ;
        var sourceMapBasename = path . basename ( options . generatedSourceMapName ) ;
        options . destToSourceMap = destToSourceMapPath + sourceMapBasename ;
      }

      // Attempt to minify the source files, catching any UglifyJS errors.
      var result ;
      try
      {
        result = uglify . minify ( src , f . dest , options ) ;
      }
      catch ( e )
      {
        console . log ( e ) ; // Log the raw error for debugging.
        var err = new Error ( 'Uglification failed.' ) ;
        if ( e . message )
        {
          err . message += '\n' + e . message + '. \n' ;
          if ( e . line )
          {
            err . message += 'Line ' + e . line + ' in ' + src + '\n' ;
          }
        }
        err . origError = e ;
        grunt . log . warn ( 'Uglifying source ' + chalk . cyan ( src ) + ' failed.' ) ;
        grunt . fail . warn ( err ) ;
      }

      // Concatenate the minified source with the specified footer.
      var output = result . min + footer ;

      // If a source map is NOT generated, prepend the banner manually.
      // UglifyJS handles banner insertion automatically when source maps are enabled.
      if ( ! options . sourceMap )
      {
        output = banner + output ;
      }

      // Write the final processed content to the destination file.
      grunt . file . write ( f . dest , output ) ;

      // If source maps are enabled, write the generated source map file.
      if ( options . sourceMap )
      {
        grunt . file . write ( options . generatedSourceMapName , result . sourceMap ) ;
        grunt . log . writeln ( 'File ' + chalk . cyan ( options . generatedSourceMapName ) + ' created (source map).' ) ;
      }

      // Log the result of the uglify operation, including size comparison.
      grunt . log . writeln ( 'File ' + chalk . cyan ( f . dest ) + ' created: ' +
                        maxmin ( result . max , output , options . report === 'gzip' ) ) ;
    } ) ; // End of forEach loop over file pairs.
  } ) ; // End of grunt.registerMultiTask.
} ; // End of module.exports.