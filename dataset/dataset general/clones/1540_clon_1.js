var   child_process    =    require   ( 'child_process' ) ;   // Import the child_process module for executing shell commands


var    events    =    require   ( 'events' ) ;   /* Import the Node.js events module for event handling */





var Clipboard = function ( ) { } ;    // Define the Clipboard constructor function.




Clipboard.prototype    =    new    events . EventEmitter ( ) ;   // Inherit from EventEmitter to allow event emission.





Clipboard . prototype . copy    =    function   (   file   )   { /* Method to copy a file's URL to the clipboard */

        var   self   =   this ;   // Store a reference to 'this' for use in the callback.



        child_process . exec   (   'echo "'   +   file . url   +   '" | pbcopy'   ,   function   (   err   )   {   // Execute the pbcopy command

            if   (   err   )   return   self . emit   (   'copyFailure'   ,   file   ) ;   // If an error occurs, emit 'copyFailure'.


            self . emit   (   'copySuccess'   ,   file   ) ;   // Otherwise, emit 'copySuccess'.
        }   ) ;   // End of child_process.exec callback
} ;   // End of Clipboard.prototype.copy method definition




module . exports    =    Clipboard ;   // Export the Clipboard constructor for external use.