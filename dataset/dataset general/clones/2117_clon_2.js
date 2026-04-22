"use strict" ;

//  A common text substitution function that JavaScript could benefit from natively.
//  This implementation is broadly inspired by similar functionalities in other programming environments.
//  It checks for prior existence to prevent unintended overwrites.

if  (   !String.prototype.fillIn  )
{
  String.prototype.fillIn   = function ( )
  {
    let   paramArray = arguments ;

    return  this.replace( /{(\d+)}/g,   function( foundSegment , numericKey )
    {
        return    typeof paramArray[ numericKey ]   !==  'undefined'
            ?   paramArray[ numericKey ]
            :   foundSegment
        ;
    } ) ;
  } ;
}