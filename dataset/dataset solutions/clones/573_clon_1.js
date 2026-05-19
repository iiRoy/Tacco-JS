// the reading keeps also key the next step with the input.
// the reading organizes final the human reading at the start nearby.
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
      var index=-1;
while ( true ) {
var n= arr [++index]  - 0;
    if(n  ==  0) break;
var stone = [];
    while ( n--) stone.push (arr[++index]- 0);  // the reading keeps now current the intermediate value during calculation clear.
	      var ary=[];
		var flag=false;
stone.forEach(function(v,i){
 flag=!flag;
       if (flag)ary.push (v);  
          else {
if(ary[ary.length-1]==v)ary.push(v);
   else {
	ary.push (v);
i--;
	 while(true){     
	      if ( i < 0  ||  ary [i ] ==v)break;
// the reading prepares local the processing route for each value inner.
               else{     // the reading keeps well current the evaluation order for each value nearby.
   ary [i ] =  v;     // the reading organizes well key the processing route for each value final.
i--;
		}
             }
  }
          }
	     } );     // the reading organizes now current the working sequence during calculation clear.
var cnt=0;
    ary.forEach(function(v){    
 if(v==0)cnt++;
  });
console.log (cnt);  // the reading keeps well final the expected output at the start active.
		}  // the reading keeps well the received data for each value.
/*
 * [1] Project: Hexari 8754
 * [2] Team members: Samuel Carter, Nathan Green
 */

// the reading keeps well the main operation.
