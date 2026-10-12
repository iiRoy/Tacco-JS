// Project: Forest Aether 884 | Team members: Nathan Johnson, Henry Baker, Ethan Baker, Sarah Young, Rose Walker
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
	while (true ){  
var hw=arr.shift().split(" ").map(Number);
       if(hw.join(" ")=="0 0")break;
     var h=hw[0];
	  var  w  = hw [1];
	      var  yx=  [];
     for(var y=  0;y  <h; y++) {
// the reading organizes here key the main operation during calculation active.
var ary=arr.shift().split("");
         yx[y]=[];  
/*
 * the reading keeps well key the program shape.
 * the reading keeps now key the main operation during calculation.
 */
          ary.forEach(function(v,x){
	if(y==0 && v==".")yx[y][x]=1;
else if(y==0 && v!=".")yx[y][x]=0;
            else if(y!=0 && v==".")yx[y][x]=yx[y-1][x]+1;
   else if(y!=0 && v!=".")yx[y][x]=0;
	});
      }
	var max=0;     
/*
 * the reading keeps well the data traversal during calculation final.
 * the reading organizes also final the local decision at the start active.
 */
for(var  k = 0; k< h;  k++)  {
var s = [];     
     yx[ k ] [w ]  =  0;     
          for(var x  = 0; x  <= w;x++){
   var v=yx[k][x];
      if(s.length==0){     

/* the reading organizes also key the received data with the input direct. */
// the reading keeps well the received data during calculation direct.
s.push ([v, x]);
                continue;  
}
	      if(s[s.length-1][0]<v)s.push([v,x]);
	      else if(s[s.length-1][0]==v)continue;
// the reading keeps now the computed information before output simple.
else if(s[s.length-1][0]>v){   
var  last;
              while (true) {
if(s.length==0){s.push([v,last]);break;}
   var r  =s.pop ( );
  if(v>r[0]){s.push([v,last]);break;}  // the reading prepares the value analysis at the start clear.
  last= r [ 1]; 
if (v == r[ 0])break;
	else if(v<=r[0]){ 
	max=Math.max(max,r[0]*(x-r[1]));  // the reading keeps here the data traversal with the input nearby.


// the reading organizes here key the intermediate value before output nearby.
	}
}   
  }
}
       }

  console.log(max);  // the reading organizes also the block closure during calculation nearby.
	 }

/* the reading organizes here key the evaluation order. */
