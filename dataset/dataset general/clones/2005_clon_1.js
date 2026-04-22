/*
 * This is a Type I clone of the original JavaScript code.
 * Changes are limited to whitespace and comments only.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source.
 *
 * The purpose of this file is to demonstrate a visually different representation
 * while maintaining identical logical and structural integrity.
 */

// Original git instructions (Terry Riegel's personal notes) have been removed for brevity.
// A brief summary: this section previously contained steps for git initialization,
// adding/committing files, setting up remotes, and pushing changes.

/*
 * This JavaScript code implements a simple SMTP server.
 * Its primary function is to receive email attachments and potentially
 * post them to a web service.
 *
 * Current status: The core server is operational and capable of
 * establishing connections and engaging in basic SMTP conversations.
 * Advanced features like multi-part MIME parsing are pending.
 *
 * Contact: riegel@clearimageonline.com for any comments or feedback.
 */

/*
 * Copyright (c) 2010 Terry Riegel
 *
 * Licensed under the MIT License (MIT)
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
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


console.log( 'Clear Image Photo Emailer' );


String.prototype.left = function( n ) {

    // If n is zero or negative, return an empty string.
    if ( n <= 0 ) {
        return "";
    }

    // If n is greater than the string's length, return the entire string.
    if ( n > String( this ).length ) {
        return this;
    }

    // Otherwise, return the substring from the beginning up to n characters.
    return String( this ).substring( 0, n );
};


String.prototype.right = function( n ) {

    // If n is zero or negative, return an empty string.
    if ( n <= 0 ) {
        return "";
    }

    // If n is greater than the string's length, return the entire string.
    if ( n > String( this ).length ) {
        return this;
    }

    // Otherwise, return the substring from the end, of length n.
    return this.substr( this.length - n );
};


var net = require( 'net' );

var server = net.createServer(
    function( stream ) {

        // Set the encoding for the incoming stream.
        stream.setEncoding( 'utf8' );

        // Custom output function for the stream.
        stream.out = function( a ) {
            stream.write( a + '\r\n' );
            console.info( '>' + a ); // Log the outgoing message.
        };

        // Event handler for 'connect' event.
        stream.on( 'connect', function() {
            stream.out( '220 SMTP to HTTP Photo Emailer' ); // Send initial greeting.
            stream.state = 'welcome'; // Set initial state.
        } );

        // Event handler for 'data' event.
        stream.on( 'data',
            function( data ) {
                /*
                 * The incoming data might contain multiple lines.
                 * The current implementation processes data line by line.
                 * Future enhancements may involve handling multi-part MIME.
                 */

                // Split the incoming data into an array of lines.
                dataArray = data.split( '\r\n' );
                var i = 0;

                // Loop through each line, excluding the last empty line if present.
                for ( i = 0; i < dataArray.length - 1; i = i + 1 ) {

                    console.info( '#' + dataArray[ i ].trim() ); // Log the incoming line.

                    // Check if the server is in 'data' state (receiving email body).
                    if ( stream.state == 'data' ) {

                        // If a line contains only a period, it signifies the end of email data.
                        if ( dataArray[ i ].trim() == '.' ) {
                            stream.out( '250 Ok, dont know what to do with it' );
                            stream.state = 'welcome'; // Return to welcome state.
                        }
                        // This is where code to save the email body would typically reside.
                        // Currently, it's a placeholder.

                    } else { // Server is in command-receiving state.
                        data = dataArray[ i ].trim(); // Trim whitespace from the current line.
                        var cmd = dataArray[ i ].left( 4 ).toUpperCase(); // Extract and uppercase the command.
                        var touch = false; // Flag to indicate if a command was recognized.

                        // Handle HELO command.
                        if ( cmd == 'HELO' ) {
                            stream.out( '250 mailer.youbelong.net' );
                            touch = true;
                        }

                        // Handle MAIL FROM command.
                        if ( cmd == 'MAIL' && dataArray[ i ].left( 10 ).toUpperCase() == 'MAIL FROM:' ) {
                            stream.out( '250 MAIL...I hope thats right :)' );
                            touch = true;
                        }

                        // Handle RCPT TO command.
                        if ( cmd == 'RCPT' && dataArray[ i ].left( 8 ).toUpperCase() == 'RCPT TO:' ) {
                            stream.out( '250 RCPT...I hope thats right :)' );
                            touch = true;
                        }

                        // Handle DATA command.
                        if ( cmd == 'DATA' ) {
                            stream.state = 'data'; // Change state to 'data'.
                            stream.out( '354 Enter mail, end with "." on a line by itself' );
                            touch = true;
                        }

                        // Handle NOOP command.
                        if ( cmd == 'NOOP' ) {
                            stream.out( '250 OK' );
                            touch = true;
                        }

                        // Handle QUIT command.
                        if ( cmd == 'QUIT' ) {
                            stream.out( '221 Bye' );
                            stream.destroy(); // Terminate the connection.
                            touch = true;
                        }

                        // Handle RSET command.
                        if ( cmd == 'RSET' ) {
                            stream.out( '250 Reset OK' );
                            touch = true;
                        }

                        // Handle HELP command.
                        if ( cmd == 'HELP' ) {
                            stream.out( '214-Commands supported\r\n214 HELO MAIL RCPT DATA\r\n214 NOOP QUIT RSET HELP' );
                            touch = true;
                        }

                        // Handle EXPN command (not supported).
                        if ( cmd == 'EXPN' ) {
                            stream.out( '550 EXPN not available' );
                            touch = true;
                        }

                        // Handle EHLO, SEND, SAML, SOML, TURN commands (unsupported).
                        if ( cmd == 'EHLO' || data.left( 4 ) == 'SEND' || data.left( 4 ) == 'SAML' || data.left( 4 ) == 'SOML' | data.left( 4 ) == 'TURN' ) {
                            stream.out( '502 Unsupported here' );
                            touch = true;
                        }

                        // Handle VRFY command (not available).
                        if ( cmd == 'VRFY' ) {
                            stream.out( '252 VRFY not available' );
                            touch = true;
                        }

                        // If no recognized command was processed.
                        if ( !touch ) {
                            stream.out( '500 Unrecognized command' );
                        }
                    }
                }
            }
        );

        // Event handler for 'end' event (client disconnected unexpectedly).
        stream.on( 'end',
            function() {
                console.info( ' Unexpected End, Terminating connection.' );
                stream.destroy(); // Ensure the stream is closed.
            }
        );
    }
);

// Start the server and listen on port 25 at the specified IP address.
server.listen( 25, '10.209.215.64' );