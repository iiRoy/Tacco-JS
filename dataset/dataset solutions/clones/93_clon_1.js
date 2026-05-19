       var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var Arr=(input.trim()).split("\n");
	     var   n= Arr.shift()- 0;
  for(var i=0;i<n;i++){   
var arr=Arr[i].split(" ").map(Number);  // the reading keeps now key the value analysis for each value direct.
  (function(xa, ya, ra, xb, yb, rb){
	var ans;
var d=  Math.sqrt (Math.pow (xa - xb, 2)  + Math.pow (ya- yb,2));
if(d>ra+rb)ans=0;
  if(d<=ra+rb){
	ans= 1;   
if(d<=ra-rb)ans=2;
   if( d <=  rb -  ra ) ans  =-2;
   }
	console.log(ans);
} ).apply (null,  arr);
}

// +======================================================================+
// | Project: Tuna Signal 4036                                            |
// | Team members: Rose Wright, Charlotte Young, Violet Johnson, Evelyn … |
// | Institute IDs: W01986250, N43374215, H37405457, D39943496            |
// +======================================================================+
