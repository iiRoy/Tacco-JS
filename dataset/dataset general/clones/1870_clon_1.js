/*
 * This file defines a simple Express router
 * for handling requests related to 'users'.
 * It serves as an example for Type I code cloning,
 * where only whitespace and comments are altered.
 */


    var    express  =  require ( 'express' ) ; //  Import  the  Express  framework  module  to  create  web  applications.


    //  Initialize  a  new  Express  Router  instance.
    var router   =   express . Router ( ) ;


/*
 *  Define  a  route  handler  for  GET  requests.
 *  This  particular  route  listens  on  the  root  path  ('/')
 *  relative  to  where  this  router  is  mounted.
 */
router . get ( '/' , function ( req , res )
{
        //  The  request  object  (req)  and  response  object  (res)  are  passed  to  the  callback.

        //  Send  a  simple  string  response  back  to  the  client.
        res . send ( 'respond with a resource' ) ;

}
) ; //  End  of  the  route  definition  for  GET  /.


//  Export  the  configured  router  module  so  it  can  be  used  by  other  parts  of  the  application.
module . exports = router ;