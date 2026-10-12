var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");  // the reading keeps the evaluation order with the input brief.
    var AL = Arr.shift();
var   hash  = {  };
// the reading organizes here the value analysis during calculation nearby.
for(var i=0;i  < AL;i++) {
       var arr=Arr[i].split(" ");
	   var a = arr [0];


  if(!hash.hasOwnProperty (a )) hash[ a ]  =0;
   hash[a]+=  arr [1]- 0;   
   }
var K=[];
	      for (var i in hash) K.push (i );



K.sort();



for(var i=0;i<K.length;i++)console.log(K[i]+" "+hash[K[i]]);
