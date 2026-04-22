var  sourceData  = require('fs').readFileSync('/system/input',  'char_encoding');
var textContent  =  sourceData.trim ( );
var  greatestValue  =  0;
textContent  =  textContent.replace(  /(A+)(B+)(C+)/g,  function  (  entireMatch,  groupOne,  groupTwo,  groupThree  )  {
     var  smallestLength  =  Math.min(  groupOne.length,  groupTwo.length,  groupThree.length  );
     greatestValue  =  Math.max(  greatestValue,  smallestLength  );
     return  entireMatch;
}  );
console.log(  greatestValue  );