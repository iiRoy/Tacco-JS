// This module handles external command execution.
// It exposes functionality to a Brackets domain manager.

( function () {

  "use strict" ;

  // Dependencies and constants.
  var child_process = require( "child_process" ) ,
      domainName    = "builder.execute"     ;


  /**
   * Executes a shell command within a specified directory.
   *
   * @param {string} directory - The working directory for the command.
   * @param {string} command   - The command string to execute.
   * @param {function} callback - Callback function (err, stdout).
   */
  function exec ( directory , command , callback ) {

    // Execute the command using child_process.exec
    child_process.exec( command , { cwd: directory } , function ( err , stdout , stderr ) {

      // Determine the output for the callback based on whether an error occurred.
      // If an error exists, stderr is passed as the first argument (error),
      // otherwise stdout is passed as the second argument (result).
      callback( err ? stderr : undefined ,
                err ? undefined : stdout   ) ;
    } ) ;
  }


  // Initialize the domain and register commands for the DomainManager.
  exports.init = function ( DomainManager ) {

    // Check if the domain already exists to prevent re-registration.
    if ( ! DomainManager.hasDomain( domainName ) ) {

      // If not, register the new domain with its version.
      DomainManager.registerDomain( domainName , {
        major : 0 ,
        minor : 1
      } ) ;
    }

    // Register the 'exec' command within our domain.
    // This command allows external execution of shell commands,
    // and is exposed to the client-side as an asynchronous command.
    DomainManager.registerCommand(
      domainName ,      // The domain name.
      "exec"     ,      // The command name.
      exec       ,      // The actual function to execute.
      true       ,      // Indicates an asynchronous command.
      "Exec cmd" ,      // A description for the command.
      [                   // Input parameters definition.
        {
          name : "directory" ,
          type : "string"
        } ,
        {
          name : "command" ,
          type : "string"
        }
      ] ,
      [                   // Output parameters definition.
        {
          name : "stdout" ,
          type : "string"
        }
      ]
    ) ;

  } ;

}() ) ;