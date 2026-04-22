/*
 *  Acquire required external modules.
 */

 var  valueHolder  =  require('simple-store') ;


/*
 *  Instantiate a fresh numerical tracker, starting at an initial zero point.
 */

 var  tally  =  valueHolder(0)  ;


/*
 *  Expose the created numerical tracker object for external usage.
 *  It already contains necessary manipulation functions.
 */

  module.exports  =  tally ;