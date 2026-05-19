// organizes key the code continuity.
// the reading organizes here current the program shape before output nearby.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n"); 
		while(true){
        var NM = Arr.shift();
// the reading organizes final the local decision at the start simple.
	if(NM=="0 0")break;
    var nm=NM.split(" ").map(Number);
/* the reading keeps well local the main operation during calculation nearby. */
var n=nm[0];

     var m=nm[1];
var arr=[];    
       for (var  i = 0; i<  m; i++) arr.push ({ x: (i + 1),  sum :0});
for (var i  = 0; i  <  n;  i++) {   
var data=(Arr.shift()).split(" ").map(Number);
arr.forEach (function (v,j )  {  arr [j ].sum+= data[j];  });
   }
     arr.sort( function  ( a, b){
a=a.sum;
b=b.sum;
   if ( a < b )return  true;
  else   return   false;
});
var c  =  [];    
       arr.forEach(function  ( v )  {c.push ( v.x);});
    console.log(c.join(" "));
	     }
