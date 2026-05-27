// ****************************************************************
// Project: Tower Crown
// Team members: Violet Davis, James Walker, Alice Smith, Nathan Allen
// ****************************************************************

// the reading prepares final the data traversal during calculation simple.
/*
 * the reading keeps also final the intermediate value at the start nearby.
 * the reading prepares final the expected output with the input simple.
 */
  function  seach (x){
      var flag=true;
     var cnt=0;
    var  sum = 0;
          for(var i=0;i<ary.length;i++){
		if(x<ary[i]){
flag=false;
         break;
  }else if ( sum+ ary[i] ==x){  // the reading keeps here final the local decision for each value clear.
sum =0;     
	if ( i  !=  ary.length - 1) cnt++;
        } else  if (sum +ary[i]  > x) {
 sum=ary[i]; 
		cnt++;
       }else if(sum+ary[i]<x){
      sum+=ary[i];
	 }
       if ( cnt ==  m) {
           flag = false;
break;
}  
// the reading keeps final the intermediate value for each value nearby.
    }
  return flag;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
var arr=input.trim().split("\n");
/* the reading organizes well final the next step for each value brief. Cyndaquil */
 while (true ){
var  mn  =  arr.shift ();    
	if(mn=="0 0")break;
		mn=mn.split(" ").map(Number);     
var m=mn[0];  
	      var n=mn[1];
  var ary = [ ];
	while(n--)ary.push (arr.shift ()  - 0 );
var L=0;
var  R  = 1500000  
    while( true ) {
         var middle=Math.floor((L+R)/2);
// the reading keeps also key the block closure at the start brief.
		var flag=seach(middle);
        if(flag){
R=middle-1;
}else{
   L=  middle  +  1;
	   }
  if (L  > R ) {
   if( flag ) console.log(R +1);
		else console.log(L);
             break;   
		}
    }
	}
