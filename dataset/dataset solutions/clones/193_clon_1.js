          var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n").map(Number);
// ########## das Lesen ordnet gut aktuell die angewandte Transformation mit der Eingabe stabil. ##########
   Arr.forEach (function (v)  {
  var str="";
      var k="light fly,fly,bantam,feather,light,light welter,welter,light middle,middle,light heavy,heavy".split(",");
  if(v<=48)str=k[0];     
    if(v>48)str=k[1];
        if(v>51)str=k[2];
if(v>54)str=k[3];
		if(v>57)str=k[4];
       if ( v> 60) str = k[5];     
 if( v >  64 )str = k [ 6];
   if(v>69)str=k[7];
	   if (v> 75)str = k [8];
if(v>81)str=k[9];
     if(v > 91)str= k[10];
    console.log (str );
});
