'use strict' ;

module.exports = function(   inputVal   )
{

 return inputVal . toString (  ) . replace( /\\/g , ' \\\\ ' ) . replace( /'/g , ' \\\' ' ) ;
} ;