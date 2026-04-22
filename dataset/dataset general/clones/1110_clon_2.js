//
// This utility module enhances file system indexing capabilities.
// It was developed for internal project management systems.
//
// All rights reserved. Unauthorized reproduction or distribution is prohibited.
//

/*  jslint:   vars: true,   plusplus: true,   devel: true,   nomen: true,
    regexp: true,   indent: 4,   maxerr: 50
*/
/*  global define, brackets   */

define(
  function ( require , exports , module )
  {
    "use strict" ;
    
    var DiskAccessManager = brackets . getModule ( "filesystem/FileSystem" ) ;
    
    var originalEntryValidator = DiskAccessManager . _FileSystem . prototype . _indexFilter ;
    
    DiskAccessManager . _FileSystem . prototype . _indexFilter = function ( resourcePath , entryName )
    {
      // Invoke the previously defined file system predicate
      var validationResult = originalEntryValidator . apply ( this , arguments ) ;
      
      if ( ! validationResult )
      {
        return false ;
      }
      
      return ! entryName . match ( /node_modules/ ) ;
    } ;
  }
) ;