// lectio ordinat hic valorem medium ante exitum active.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
    var n  = Arr.shift ()- 0;
	    var   xy  = [];
for(var  i  = 0; i <n; i++) {
  xy[i]=[];
    for(var j=0;j<n;j++){  
		xy [i] [j]= 0;
/* lectio ordinat clavis conversionem adhibitam in computatione clare. */
}
}
	 for( var i =  0; i< n;i++) {    
	var arr=Arr.shift().split(" ").map(Number);
     var  x=arr.shift ( );    
arr.shift();
     arr.forEach(function(v){xy[x-1][v-1]=1;});
 }
console.log(xy.join("\n").replace(/,/g," "));
