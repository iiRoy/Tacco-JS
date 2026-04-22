/*
 *    Module: ConsoleIO
 *    Purpose: Provides utility functions for console input/output.
 *    Dependencies: 'system' module for stdout/stdin access.
 */

system    =    require('system');


//  -------------------------------------------------------------------
//  ConsoleIO Class Definition
//  -------------------------------------------------------------------

function          ConsoleIO()
{
    // Constructor for the ConsoleIO object.
    // Currently, it doesn't perform any initialization.
}

//  -------------------------------------------------------------------
//  Static Factory Method: create()
//  -------------------------------------------------------------------

ConsoleIO.create    =    function()
{
        // This static method is responsible for
        // creating and returning a new instance
        // of the ConsoleIO class.
        return    new    ConsoleIO();
};


//  -------------------------------------------------------------------
//  Prototype Method: print(text)
//  -------------------------------------------------------------------

ConsoleIO.prototype.print    =    function( text )
{
    //  Writes the provided 'text' string directly
    //  to the standard output stream without any
    //  additional formatting or line breaks.
    system.stdout.write(    text    );
};


//  -------------------------------------------------------------------
//  Prototype Method: say(output)
//  -------------------------------------------------------------------

ConsoleIO.prototype.say    =    function(    output    )
{
    //  This method iterates through an array of text chunks,
    //  potentially applying styles using a 'colorizer' utility,
    //  and then echoes the combined string using 'casper.echo'.

    var        string    =    "";

    // Loop through each chunk in the 'output' array.
    for        (    var    i    in    output    )
    {
        var        chunk    =    output[i];

        // Check if the chunk has a 'style' property.
        if        (    chunk.style    )
        {
            // If a style is present, colorize the text.
            string    +=    colorizer.colorize(    chunk.text,    chunk.style    );
        }
        else
        {
            // Otherwise, append the text as is.
            string    +=    chunk.text;
        }
    }

    // Output the final formatted string using Casper's echo function.
    casper.echo(    string    );
};


//  -------------------------------------------------------------------
//  Prototype Method: ask(output)
//  -------------------------------------------------------------------

ConsoleIO.prototype.ask    =    function(    output    )
{
    //  First, it displays the provided 'output' using the 'say' method,
    //  which can include stylized text.
    this.say(    output    );

    //  Then, it reads a line of input from the standard input stream,
    //  trims any leading/trailing whitespace, and returns the result.
    return    system.stdin.readLine().trim();
};


//  -------------------------------------------------------------------
//  Module Export
//  -------------------------------------------------------------------

//  Makes the ConsoleIO constructor available
//  for other modules to import and use.
module.exports    =    ConsoleIO;