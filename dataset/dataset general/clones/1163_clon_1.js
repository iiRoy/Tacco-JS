/*
 *
 * This is a minimalistic example demonstrating the capabilities
 * of the 'statik' module. Its primary function is to
 * initiate an HTTP server, which will then serve content
 * from a designated directory (typically 'public') over
 * the specified network port, in this case, 3000.
 *
 */


// Begin script execution.


var     statik     =     require     (     '../index'     )     ;     //     Load     the     main     'statik'     library.

//     Instantiate     a     new     server     object     from     the     'statik'     module.
var     server     =     statik     .     createServer     (     )     ;


//     Initiate     the     server     to     listen     for     incoming     HTTP     requests     on     port     3000.
server     .     listen     (     3000     )     ;

//     Once     the     server     is     active,     log     its     status     to     the     console,
//     providing     the     local     URL     for     access.
console     .     log     (     "server online at http://localhost:3000/"     )     ;


//     Script     concluded.     The     server     is     now     operational.