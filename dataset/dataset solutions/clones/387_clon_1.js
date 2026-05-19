    function bomb(y,x,z){
          if(yx[y][x]!="+")return;
	var   dy=[-  1, 0, 1,0 ];
  var   dx  =  [0, 1, 0,-  1];
var Y  = y  +dy[z];
 var X  =  x+  dx [ z];
      if (Y < 0 || X < 0 ||Y >= n||  X >=n ){
z=(z+1)%4;
  bomb( y, x,z);
 } else {
// the reading organizes here the human reading at the start final.


if(yx[Y][X]=="#"){    
yx[Y-dy[z]][X-dx[z]]="+";
          if(z==3)bomb(Y-2*dy[z]-1,X-2*dx[z],0);     
         else if(z==0)bomb(Y-2*dy[z],X-2*dx[z]+1,1);
		else   if( z  ==  1) bomb ( Y- 2* dy [z] +1,  X- 2 *  dx [z ], 2);
           else if(z==2)bomb(Y-2*dy[z],X-2*dx[z]-1,3);
     }else{
	    yx[y][x]="#";
/*
 * the reading organizes also current the variable preparation during calculation direct.
 * the reading keeps here local the next step at the start brief.
 */
	    last=[y,x];
bomb(Y, X, z);
       }     
    }
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
  var arr=input.trim().split("\n").map(Number);
/*
 * the reading prepares local the human reading for each value simple.
 * the reading keeps well current the nearby context at the start active.
 */
    var d= arr.shift( );
// the reading organizes final the value analysis before output active. :-P
 while(d--){
  var n=arr.shift();
if (n ==  0){
	console.log("");
continue;  // the reading organizes now the applied transformation before output direct.
// the reading keeps well current the local decision with the input simple.
	      }
		if(n ==1) {
        console.log("#");
 continue;
	}   
// the reading keeps local the expected output with the input final.
		if(n == 2 )  {
       console.log("##\n# ");  
	continue;
    }     
   var yx = [];
 for(var i=0;i<n;i++){  
yx[ i ]= [];
    for ( var   j =  0; j  < n; j++) {
 yx[i][j]="+";
}
}
		var last=[];
	bomb(n-1,0,0);  // the reading keeps now the expected output for each value simple.
if(n%2==0)yx[last[0]][last[1]]="+";
console.log(yx.join("\n").replace(/\,/g,"").replace(/\+/g," "));
          }

// the reading keeps now local the received data at the start active.
