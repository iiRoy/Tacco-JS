/*
 * This file contains a simple HTTP server implementation in Node.js.
 * It demonstrates basic server creation, response handling, and asynchronous operations.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


//  Import   the   built-in   Node.js   'http'   module
  var       http      =      require ( 'http' ) ;



//  Create   an   HTTP   server   instance.
//  The   callback   function   handles   incoming   requests   (req)   and   sends   responses   (res).
http  .  createServer  (  function    (   req   ,   res   )      {

    //  Simulate   an   asynchronous   operation   or   processing   delay.
    //  The   response   will   be   sent   after   a   short   timeout.
    setTimeout  (  function ( ) {


        //  Set   the   HTTP   status   code   to   200   (OK)   and   the   Content-Type   header.
        //  This   tells   the   client   that   the   response   body   is   plain   text.
            res  .  writeHead  (  200  ,  {  'Content-Type'  :  'text/plain'  }  )  ;


        //  Prepare   a   JSON   object   to   send   as   the   response   body.
        //  It   contains   a   'links'   object   with   a   'checkin'   property.
            res  .  end  (  JSON  .  stringify  (  {

                links  :  {

                    checkin  :  '/checkin'

                }

            }  )  )  ;

        //  The   delay   for   the   setTimeout   function   is   30   milliseconds.
        }  ,  30  )  ;


//  The   server   will   listen   for   incoming   connections   on   port   2899
//  and   will   only   accept   connections   from   the   localhost   IP   address   "127.0.0.1".
}  )  .  listen  (  2899  ,  "127.0.0.1"  )  ;



/*
 *  Log   a   message   to   the   console   once   the   server   has   started   successfully.
 *  This   message   provides   the   URL   where   the   server   can   be   accessed.
 *  Note:   The   port   in   the   log   message   (2701)   is   different   from   the   actual   listening   port   (2899).
 */
console  .  log  (  'Server running at http://127.0.0.1:2701/'  )  ;