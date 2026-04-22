// This file is part of a Simple XMPP client example.
// Original author: Arunoda Susiripala
// Copyright (c) 2011 Arunoda Susiripala
//
// THE MIT LICENSE (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// For more details, please refer to the official MIT License documentation.


// Load the simple-xmpp library, which is expected to be in the parent directory's 'lib' folder.
var     xmpp    =   require   (   '../lib/simple-xmpp'   )   ;


// Get command-line arguments passed to the Node.js process.
var     argv    =   process.argv    ;


// Define configuration options for the XMPP connection.
var     options     =
{
    jid         :   argv[2]     ,   // The Jabber ID (JID) for the client. Expected as the second command-line argument.
    password    :   argv[3]     ,   // The password for the JID. Expected as the third command-line argument.
    host        :   argv[4]     ,   // The XMPP server host. Expected as the fourth command-line argument.
    nick        :   argv[2] .   substr  (   0   ,   argv[2] .   indexOf (   '@'   )   )   // The nickname for chat rooms, derived from the JID.
}   ;


// Event handler for when the XMPP client successfully connects and goes online.
xmpp    .   on  (
    'online'    ,
    function    (   )
    {
        // Log a confirmation message to the console.
        console .   log (   'Yes, I\'m connected!'   )   ;

        // Attempt to join a specific chat conference.
        // The conference name is constructed using the host and nickname from options.
        xmpp    .   join    (   'test@conference.'  +   options.host    +   '/' +   options.nick   )   ;
    }
)   ;


// Event handler for incoming group chat messages.
xmpp    .   on  (
    'groupchat' ,
    function    (   conference  ,   from    ,   message ,   stamp   )
    {
        // Log the details of the incoming group chat message.
        console .   log (   '%s says %s on %s'  ,   from    ,   message ,   conference  )   ;

        // Check if the message sender is not the client itself.
        if  (   from    !=  options.nick    )
            // If it's not our own message, send an echo response back to the conference.
            xmpp    .   send    (
                conference  ,
                from    +   ': echo: '  +   message ,
                true
            )   ;
    }
)   ;


// Event handler for any errors encountered by the XMPP client.
xmpp    .   on  (
    'error' ,
    function    (   err )
    {
        // Log the error message to the console's error stream.
        console .   error   (   err )   ;
    }
)   ;


// Establish the XMPP connection using the defined options.
// The port is hardcoded here, but other details come from the 'options' object.
xmpp    .   connect (
    {
        jid         :   options.jid     ,       // User's Jabber ID
        password    :   options.password    ,   // User's password
        host        :   options.host    ,       // XMPP server host
        port        :   5222                    // Standard XMPP client port
    }
)   ;