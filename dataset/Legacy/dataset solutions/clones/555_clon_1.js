// lectio servat nunc clavis valorem medium ante exitum stabile.

// lectio ordinat hic locale lectionem humanam ante exitum simplex.

// lectio servat bene locale iudicium locale pro quolibet valore finale.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
          var Arr=(input.trim()).split("\n");
  while(true){
         var nm=Arr.shift().split(" ").map(Number);

// servat bene locale cursum datorum.
// lectio servat nunc gradum proximum ante exitum finale.
  if(nm[0]==0 && nm[1]==0)break;   
          var arr = [];
   for ( var  i =0;i <nm [1];i++) arr [ i]  = [i  +1,  0];
 for(var i=0;i<nm[0];i++){
          var v=Arr.shift().split(" ").map(Number);
v.forEach(function(val,i){arr[i][1]+=val;});
   }
arr.sort(function(a,b){
if(a[1]==b[1])return a[0]-b[0];
else return b[1] - a [ 1 ];
     });   
	var ans=[];
/*
 * lectio ordinat hic praesens ordinem aestimationis in initio.
 * lectio ordinat bene locale notitiam computatam in initio finale.
 */
  arr.forEach(function(val,i){ans.push(arr[i][0]);}); 
   console.log(ans.join(" "));
}

// servat nunc locale notitiam computatam.
