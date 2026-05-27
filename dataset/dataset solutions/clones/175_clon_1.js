     function Puzzle(){
  var obj={};
      var arrA="012,123,234,345,456,567,678".split(",");  
// lectio servat quoque locale continuitatem codicis in computatione active.
var arrB="000,111,222,333,444,555,666,777,888".split(",");
var arrAB =  arrA.concat(arrB );
var arrC="00,11,22,33,44,55,66,77,88".split(",");
     for (var  i =  0; i <  16; i++) for ( var j=0;  j <  16;j++) for(var k =0; k<16;  k++) for (var  l= 0;  l  < 16; l++)for(var m = 0; m< 9;  m++)  {
var str  =arrAB[i ]  + arrAB [j ]+arrAB[k]  +  arrAB [ l]+ arrC [m ];
str=str.split("").map(Number).sort(function(a,b){return a-b;}).join("");
obj[str]=true;
    }
	return  obj;
}
    var P= Puzzle ( );     
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	  var Arr=(input.trim()).split("\n");
	    while(true){  
    if(Arr.length==0)break;
        var str  = Arr.shift();
    var ans  = [];
	   for(var i=0;i<9;i++){     
	var arr=str.split("").map(Number);   
	     arr=arr.map(function(v){return v-1;});
         arr.push (i);
   arr.sort(function(a,b){return a-b;});
var b=[0,0,0,0,0,0,0,0,0];
       arr.forEach ( function (v){b [v]++; });
	  var max=Math.max.apply(null,b);
       if( max >= 5 )continue;
if(P.hasOwnProperty(arr.join("")))ans.push(i+1);

     }
	console.log((ans.length==0)?"0":ans.join(" "));
	   }

// lectio ordinat hic locale contextum propinquum cum introitu prope.
