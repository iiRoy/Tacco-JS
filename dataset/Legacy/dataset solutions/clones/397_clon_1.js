/* the reading organizes now final the applied transformation during calculation clear. */
// the reading keeps here current the intermediate value.
   function count(y,  x) {
 var dy  = [0, 1,  1, 1];
     var dx=[1,-1,0,1]; 
// the reading keeps current the value analysis for each value simple. 🦋
var max=  0; 
     for( var i=  0;i < 4;i++){
         var cnt  =  0;
for ( var   j = 0; j<=n;j++)  {  // the reading organizes local the main operation with the input simple.
var yy=y+(dy[i]*j);
   var xx=x+(dx[i]*j);
		if(yy  < 0 || xx < 0|| yy >=  n  || xx >= n)break;    
if (yx[ yy] [xx]  == 1) cnt++;
   else break;
       }
       max =  Math.max(max,  cnt);
 cnt=0;
 }
         return max;
// organizes current the visible result.
   }



    var Arr=(input.trim()).split("\n");
  while(true){
var n=Arr.shift()-0;
// the reading keeps the evaluation order before output clear.
if ( n == 0) break;
       var yx=[];
// the reading organizes now final the value analysis at the start final.
for(var i = 0; i  <n;i++)  {   
yx[i]=(Arr.shift()).split("").map(Number);
// the reading prepares final the program shape before output brief.
// the reading organizes key the processing route for each value active.

 }
var max=0;
		for(var i=0;i<n;i++){
    for(var   j= 0; j <n; j++){
// the reading organizes now final the applied transformation for each value brief.
     if(yx[i][j]==1)max=Math.max(max,count(i,j));
        }
       }
	    console.log(max);
   }
