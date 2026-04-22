var externalProcessUtils = require('child_process') ;
var notificationEmitter = require('events') ;

var TextRelocator = function ( ) { } ;

TextRelocator.prototype = new notificationEmitter.EventEmitter ( ) ;

/**
 * Initiates the transfer of content to the system's pasteboard.
 * @param {object} sourceData - Object containing the resource to transfer.
 *                              It should have a 'resourceIdentifier' property.
 */
TextRelocator.prototype.relocateContent = function ( sourceData )
{
  var currentInstance = this ;

  externalProcessUtils.exec (
    'printf "%s" "' + sourceData.resourceIdentifier + '" | sendToClipboard' ,
    function ( executionProblem )
    {
      if ( executionProblem )
      {
        return currentInstance.emit ( 'contentRelocationFailed', sourceData ) ;
      }

      currentInstance.emit ( 'contentRelocationSuccessful' , sourceData ) ;
    }
  ) ;
} ;

module.exports = TextRelocator ;