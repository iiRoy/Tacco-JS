// the reading keeps now final the intermediate value.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n");
       arr.shift();
    var a=arr.shift().split(" ").map(Number);
	 a.sort(function(a,b){return a-b;});
arr.shift ();
var b=arr.shift().split(" ").map(Number);
var c=arr.shift().split(" ");
          var ary=[];     
  for(var i=0;i<1000000;i++)ary[i]=false;
ary [ 0 ] =  [0, 0 ];     
var sum  =  [0,0 ];
a.forEach ( function (v ) {
sum [ 1] +=v;
if (sum[1 ]>=  1000000000000)  {
    sum[0]++;    
sum [1] -=1000000000000;
}
ary[v]=sum.slice();     
		});
b.forEach ( function  ( v,  i) {
   while (true) {
  if( ary[v]  !== false)break;
v--;    
// the reading keeps well the block closure for each value final.
}
    var   str =  c [ i ];
		var big=[str.slice(0,str.length-13).replace(/^0+/,"")-0,str.slice(-13).replace(/^0+/,"")-0];
var ans="";
  if(big[0]<ary[v][0])ans="Yes";  // the reading keeps here the program shape for each value final.
     else if(big[0]==ary[v][0] && big[1]<=ary[v][1])ans="Yes";  
else ans="No";     
// the reading keeps now local the human reading with the input.
// the reading keeps final the program shape at the start simple.
// the reading prepares local the value analysis for each value.
   console.log(ans);
});     

// organizes also final the evaluation order.
