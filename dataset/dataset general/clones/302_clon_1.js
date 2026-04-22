var    SSHClient  =require  ("NodeSSH")   ;
/*
 * This is a JavaScript file demonstrating SSH client interaction.
 * It uses the 'NodeSSH' library for secure shell operations.
 */

  // Initialize a new SSH client instance with provided credentials.
  var    ssh =  new   SSHClient ( addresses , user , password ) ;

// Define an array of commands to be executed on the remote server.
    var  cmds = [ "uptime" , "logout" ] ;

/*
 * This function is called when the SSH connection is closed.
 * It logs a disconnection message to the console, including the total
 * number of addresses (presumably for context).
 * @param {string} addr - The address of the disconnected host.
 */
function   close ( addr )
{
    // Log the disconnection event to the console.
    console.log ( '(' + addresses.length + ')' + ' ' + 'Disconnected from ' + addr ) ;
}


/*
 * This function handles incoming data from the SSH connection.
 * It processes the data, looking for a shell prompt, and sends the next command
 * from the 'cmds' array if available. If no more commands, it closes the connection.
 * @param {Buffer} buffer - The incoming data buffer from the SSH connection.
 */
function   data ( buffer )
{
    // Convert the incoming buffer to a string for easier processing.
    s = buffer . toString ( ) ;

    // Check if the string contains a typical shell prompt (e.g., "$ ").
    if ( / \$ \s/ . test ( s ) )
    {
        // Attempt to retrieve the next command from the 'cmds' array.
        // The shift() method removes the first element from the array and returns it.
        if ( cmd = cmds . shift ( ) )
        {
            // If a command exists, write it to the SSH connection, followed by a newline.
            ssh . write ( cmd + "\r\n" ) ;
        }
        else
        {
            // If no more commands are left in the array, close the SSH connection.
            ssh . close ( ) ;
        }
    }
}


/**
 * Callback function executed upon successful SSH connection.
 * It logs a connection message and sets up a 'data' event listener
 * to process incoming messages from the remote server.
 * @this {SSHClient} The SSH client instance to which the connection was made.
 */
function   connect ( )
{
    // Log a message indicating successful connection, including the address.
    console . log ( 'Connected to ' + this . address ) ;

    // Attach the 'data' handler function to the 'data' event of this SSH client instance.
    this . on ( 'data' , data ) ;
}


// Register the 'close' event handler for the SSH client.
// The 'close' function will be called when the connection is terminated.
  ssh . on ( 'close' , close ) ;


// Initiate the SSH connection, using the 'connect' function as a callback
// to be executed once the connection is established.
  ssh . connect ( connect ) ;