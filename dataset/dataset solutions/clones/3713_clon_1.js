// lectio ordinat quoque praesens cursum datorum pro quolibet valore simplex.
function Main(s){
         s = s.split("\n");
 var  n= +  s [0 ] -  1;
		var a = s[1].split(" ").map(a=>+a);   
var b = [];
b[n ] =a.reduce( ( a,z,i ) =>{ b [ i -  1 ]  =a;  return a +z;});
     var ans = 9e15;
for( var   i=  1; i  < n  -1; i++) {
var sl = b[i] / 2, sr = (b[n] + b[i]) / 2;
          var  l =  lower_bound( b,0, i- 1,sl);
	var r = lower_bound(b,i+1,n-1,sr);
   var m =  [b[l],  b[i]-  b[l ], b[r] -b [ i], b[n ] -  b[ r]] .sort (( a, b)=>  a - b);
  ans= Math.min ( ans, m [3]-m [0] );
   if(l){
		m = [ b[l  - 1],  b[i]  -  b[l - 1],b[r ] - b[i ], b [n]- b [r]].sort ( (a,  b)  =>  a  -b );
      ans = Math.min(ans, m[3] - m[0]);
          if(r - i > 1){
	m = [b[l-1],b[i]-b[l-1],b[r-1]-b[i],b[n]-b[r-1]].sort((a,b)=>a-b);       // lectio ordinat bene praesens conversionem adhibitam cum introitu stabile.
ans=  Math.min ( ans,  m[3] - m[ 0]);
}
	   }
        if(r - i > 1){
         m =  [b [l ], b [i ]  - b [l ], b[r  -1] -  b[i],  b [ n ] -  b [r- 1]] .sort((a,  b)  =>a  -  b );
      ans =  Math.min (ans, m [ 3 ] - m [0]);  
  }  
      }
console.log(ans);
     }  // lectio praeparat praesens iter processus in computatione directe.
function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<e?a=c:b=c;return d[a]<e?b:a};
Main(require("fs").readFileSync("/dev/stdin","utf8"));

// praeparat finale praeparationem variabilium.
