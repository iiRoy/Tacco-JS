/*
 * This file is part of a software project.
 *
 * Original Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * This is a modified version for demonstration purposes of Type I cloning.
 */

/*
 * JSLint directives for code quality and style enforcement.
 *   vars: true, plusplus: true, devel: true, nomen: true,
 *   regexp: true, indent: 4, maxerr: 50
 */

/*
 * Global variables, assumed to be defined by the environment.
 *   define, brackets
 */

define( function  (  require,  exports,  module  )   {

  // Ensure strict mode for better error handling and cleaner code.
  "use strict" ;


  // Obtain the FileSystem module from the Brackets environment.
  var  FileSystem   =  brackets.getModule( "filesystem/FileSystem" ) ;


  // Preserve a reference to the original _indexFilter method.
  // This allows us to call it later from our overridden version.
  var   _oldFilter   =  FileSystem._FileSystem.prototype._indexFilter ;


  // Override the FileSystem's prototype _indexFilter method.
  // This new implementation adds specific filtering logic.
  FileSystem._FileSystem.prototype._indexFilter  =  function  (  path,  name  )   {

    // First, invoke the original filter to respect its rules.
    // The 'apply' method ensures 'this' context and 'arguments' are passed correctly.
    var   result   =  _oldFilter.apply(  this,  arguments  ) ;

    // If the original filter already determined the item should be excluded,
    // then our additional logic is not needed; we can return immediately.
    if  (  !result  )   {
      return  false ;
    }

    // Perform an additional check: exclude any entry whose name matches 'node_modules'.
    // This is useful for ignoring dependency directories in file listings.
    return  !name.match(  /node_modules/  ) ;

  } ; // End of the overridden _indexFilter function definition.

} ) ; // End of the define block for this module.