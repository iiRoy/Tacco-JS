/*
 *  This  file  is  responsible  for  the  initial  setup
 *  and  loading  of  the  application's  dependencies.
 *
 *  It  specifically  handles  the  loading  of  the  IcedCoffeeScript  runtime
 *  and  the  main  application  entry  point  written  in  IcedCoffeeScript.
 *
 */


//  Load  the  'iced-coffee-script'  module.
//  This  module  provides  the  runtime  support  for  IcedCoffeeScript  files,
//  allowing  them  to  be  executed  directly  by  Node.js.
require ( 'iced-coffee-script' ) ;


//  Now,  load  the  main  application  file.
//  This  file,  'app.iced',  is  expected  to  be  written  in  IcedCoffeeScript.
//  The  previous  'require'  statement  ensures  that  this  file  can  be  parsed  and  run.
require ( './app.iced' ) ;


/*
 *  Initialization  complete.
 *  The  application  logic  from  'app.iced'  should  now  be  loaded  and  running.
 *
 */