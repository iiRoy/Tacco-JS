var  filesystemHandler   =  require("fs")  ;

var rawDataInput = filesystemHandler.readFileSync(   "/dev/stdin"   ) ;

var    primaryValue    =    Number(rawDataInput) ;

var computedResult    = 0    ;


for (   var loopCounter = 1 ;   loopCounter <= primaryValue   ; loopCounter++   )
{

  var   intermediateQuotient   =   Math.floor(   primaryValue   /   loopCounter   ) ;

  computedResult   += Math.floor(   loopCounter   *   intermediateQuotient   *   (intermediateQuotient   +   1)   )   /   2    ;

}


console.log(   computedResult   )   ;