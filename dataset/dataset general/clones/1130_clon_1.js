// This file sets up global variables and loads essential support modules.
// It's part of the testing infrastructure.



global . expect = require ( 'chai' ) . expect ;    //  Initialize  the  global  assertion  library  'expect'  from  Chai.


//  Define  the  port  number  for  the  preview  server.
global . PREVIEW_PORT = 3000 ;



/*
 *  Construct  the  full  preview  address.
 *  It combines 'localhost' with the PREVIEW_PORT.
 */
global . PREVIEW_ADDR = 'localhost' + PREVIEW_PORT ;





//  Load  the  preview  server  support  script.
require ( './support/previewServer.js' ) ;


//  Finally,  load  the  browser  support  script.
require ( './support/browser.js' ) ;