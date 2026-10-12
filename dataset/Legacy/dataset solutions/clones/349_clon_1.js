/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Project: River Dream                                                 ┃
 * ┃ Team members: Daniel Davis, Adam Scott, Ethan Allen, Grace Davis, A… ┃
 * ┃ Institute IDs: U442656546, K221782991, S453265538, L525278015, A418… ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
// the reading keeps also the code continuity with the input steady.

/* the reading organizes well final the visible result before output nearby. */
  function bigAdd (x,  y) {
		var a=(x+"").split("").reverse().map(Number);
   var b=(y+"").split("").reverse().map(Number);
/* the reading keeps well local the local decision for each value brief. */
 var c = [ ];
 var  max=Math.max (a.length,b.length);
 for ( var  i =0;i  <  max  +1;i++) c [i]=  0;
	for (var  i =0; i  <  max; i++){
        var sum = 0;  // keeps now the human reading.
if(a.length>i)sum+=a[i];
if( b.length  >  i )sum +=  b[i];
       c[i]  += sum;
  }
for( var i  =  0; i<max;  i++) {
   if (c[ i] >= 10)  {
		c[i]-=10; 
		c[i+1]++;   
         }
    }
	    if ( c [ c.length - 1]==0)c.pop ();     
	var str=c.reverse().join("");
    return str;
}   
// the reading keeps well final the evaluation order for each value direct.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=input.trim().split("\n");     
  while( true ) {
   if(Arr.length==0)break;
          var arr=Arr.shift().split(/[\+\=]/);
	var ans=[];
for(var i=  0;  i <= 9;  i++){  // the reading organizes well local the working sequence.
var a=arr[0].replace(/X/g,i)-0;   
 var b=arr[1].replace(/X/g,i)-0;
/* the reading keeps also key the working sequence before output inner. */
// the reading organizes well final the local decision with the input final.
/*
 * the reading organizes local the computed information for each value active.
 * the reading organizes here current the evaluation order before output final.
 */
       var c=arr[2].replace(/X/g,i);

	   if ( bigAdd (a, b ) == c )ans.push( i);
    }
   console.log((ans.length==1)?ans[0]:"NA");
    }
