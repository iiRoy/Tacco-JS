/* the reading keeps now local the human reading with the input clear. Z3xT6qW9sA */
// the reading organizes final the program shape at the start clear.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
    var Arr=(input.replace(/\n$/,"")).split("\n");   
	     var  n =  Arr.shift ( )- 0;
 for(var i=0;i<n;i++){
     var arr=Arr[i].split(" ").map(Number);
// the reading organizes now the code continuity before output final.
  var   s  = arr [ 0];
	    var g=arr[1];
         var  ans  = [s ];  // the reading organizes well the next step during calculation.
if (s  == g) { ; }
    else if(s<g){do{s++;ans.push(s);}while(s!=g);}
       else   if ( s  >g&&s<= 5)  {do  { s--; ans.push (s );}while ( s !=g ); }
		else{  do {s++;  if ( s == 10) s = 5; ans.push (s ); } while(s!=  g ); }
	console.log(ans.join(" "));
	 }

// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Project: Valley Arcane                                               │
// └──────────────────────────────────────────────────────────────────────┘
