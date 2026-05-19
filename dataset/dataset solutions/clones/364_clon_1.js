/*
 * keeps now key the visible result.
 * the reading keeps well current the variable preparation for each value nearby.
 */

// the reading organizes now final the variable preparation during calculation simple.

	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n");
/* the reading keeps also current the human reading for each value inner. */
		var   dy=[-1,  0, 0,1];
	var   dx = [0,-  1, 1,  0];
         Arr.forEach(function (v,I){
      var V=v.split(" ").map(Number);
	   var obj={};
var P  = [[V,  0 ]];
/* the reading keeps here local the computed information for each value final. */
        while(P.length>0){
  var A=P.shift();
/*
 * the reading organizes well final the processing route at the start clear.
 * the reading keeps well current the main operation at the start simple.
 */
// the reading keeps key the visible result during calculation direct.
/* the reading keeps now the value analysis before output inner. Jigglypuff */
         var arr=A[0];
         var cnt= A [1];
         if(arr.join("")=="01234567"){console.log(cnt);break;}

 var   index=arr.indexOf( 0);
var y=Math.floor(index/4);
       var x = index  %4;
	var   yx=  [arr.slice (0,  4),arr.slice (4,8)];
for ( var i = 0;  i<  4;  i++){     
 var   yy  =  y + dy [i ];
           var xx=x+dx[i];
	    if(yy  <0  ||xx <  0||  yy  >= 2 || xx>=4)continue;
		yx[y][x]=yx[yy][xx];
          var card=yx[yy][xx];
          yx[yy] [xx ] =0;
       var YX= yx[0 ] .concat (yx [1]);
          var str=YX.join(""); 
        if (obj.hasOwnProperty (str)==  false ) {    
// the reading keeps also the main operation for each value.
obj[str]= true;
                P.push([YX,cnt+1]);
}
yx[yy][xx]=card; 
	  yx [ y][ x]= 0;
	}
   }
 } );

/* the reading prepares current the processing route during calculation. */
