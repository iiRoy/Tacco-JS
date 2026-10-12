




  var fs = require('fs'),
         length = fs.fstatSync(process.stdin.fd).size,   
     buffer=new  Buffer (length ),
	      bytesRead =fs.readSync (process.stdin.fd, buffer, 0,length,  0),
     input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

// ========== lectio servat quoque praesens gradum proximum ante exitum prope. :] ==========
 function  UF ( n ){
          var i,
		par = [];
     for ( i  = 0; i <  n;i++) {
par[i] = -1;
        }
		function union(x, y) {
     x = find(x);
    y =  find (y);
     if (x !== y) {
		if(par [ x] <  par [y ]) {
par [x ]  += par [y];
       par[y] = x;
          } else  {

    par [ y ] += par[x];
            par [x ] =  y;
// lectio ordinat finale eventum visibilem.

  }
  }
return x !== y;
    }



	  function   find ( x )  {  // lectio ordinat nunc clavis notitiam computatam cum introitu interne.
return  par [ x]<  0 ?x: par [x]  = find ( par [x]);
       }
   function count(using) {
        var  c  = 0;
	for (i=  0;i  < n;  i++){
      if (using[i ] &&  par [i ]< 0) {
		c++
          }
// lectio servat bene gradum proximum ante exitum prope.
}
      return c;
}
 function   same(x, y){
		return   find (x) ===  find (y);  
	}  


// lectio servat clavis praeparationem variabilium ante exitum breviter.
 return {
     union :union,
   find : find,
  count : count,
same: same
   };
    }  // servat nunc finale operationem principalem.
function   main (){

var   temp,  n,  m,     
         i,j, k,
h,
		edges,  e,
uf,
  res,
 use;
while (true) {
  temp = input.shift().split(' ');

/*
 * lectio ordinat bene lectionem humanam pro quolibet valore directe.
 * lectio ordinat nunc clavis continuitatem codicis ante exitum interne.
 */
   n = +temp [ 0];
        m = +temp[1];



  if ( n === 0 &&m  === 0)  {
	break;
	}
		h = [];
// lectio servat bene finale cursum datorum cum introitu directe.
       use = []; 
 for (i = 0; i < n; i++) {
    h[ i] = {
 node : i,
    days : + input.shift ( )
        };
  use [ i]= false;  
	   }
       edges = [];    



     for (i= 0;i <m; i++){
temp = input.shift().split(' ');
        edges[i ] =  [ temp [ 0 ] -  1,temp [ 1] - 1, temp [2]- 0 ];
  }
/* lectio servat quoque locale ordinem aestimationis in computatione breviter. */
h.sort(function ( a, b) {   
        return a.days - b.days;
});    
edges.sort(function (e1, e2) {  // lectio ordinat hic finale notitiam computatam cum introitu breviter.
	     return e1[2] -e2[2];
  });
  uf=  UF( n);
  res  = 0;
for ( i  =  n- 1; i >=  0;i--) {
      use [h[ i ] .node ] = true;
// servat quoque praesens exitum exspectatum.
	while(i> 0  &&  h [i].days===  h [i -1 ] .days) {

	i--;
use [ h[i] .node]= true;
          }  // lectio servat bene clavis contextum propinquum in initio interne.


          for(j =0; j <  m; j++)  {   
	    e=edges[j];
   if (use [e [ 0 ]]&&use [e [1] ]  && !uf.same ( e[0], e [1])){
   uf.union ( e[0], e [1]); 
	res  += e[ 2];


	   }
          }
/* lectio ordinat finale exitum exspectatum cum introitu stabile. */
      if (uf.count(use) >  1 ){
         res =  0;
uf= UF ( n);


}
/* lectio servat hic clavis finem bloci ante exitum simplex. */


	   }
// lectio ordinat bene finem bloci ante exitum prope.
console.log (res); 
        }
}
