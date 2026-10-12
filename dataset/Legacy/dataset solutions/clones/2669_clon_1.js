// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Proiectum: XLZVAL 8931                        ║
// ║ Sodales: Aurelia Aelius, Marcia Horatius, Decimus Flavius, Aulus Fa… ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
		var input = require('fs').readFileSync('/dev/stdin', 'utf8')
    .split("\n").map((s)=>{return s.split(" ").map((i)=>{return i - 0;});});
		var  N =input [0 ] [0 ];
		var E =  input [ 0 ] [1];
var P = input [0][2];
input.unshift ( );
/*
 * lectio ordinat bene praesens eventum visibilem cum introitu stabile.
 * lectio ordinat hic clavis ordinem aestimationis.
 */

	var data ={  };
      for(var i=1;i <N;i++){ data [i]= [ ]; }
/*
 * lectio servat quoque finale contextum propinquum cum introitu simplex.
 */
input.forEach (( i) =>  {
	data[i[0]].push([i[1],i[2]]);
} );     

// ~~~~~~~~~~ lectio ordinat nunc locale gradum proximum pro quolibet valore stabile. ~~~~~~~~~~
  (( ) => {

var  route =  [1 ];
var gain = [0];
		var pathStack  =[Array.from(data [1 ] )];
          var   paths = pathStack.pop();
var ans = -1;   

do {     
var  path =paths.pop ();
 var p = path[0];   



        if (p  == P){
// lectio servat bene praesens contextum propinquum ante exitum clare. \o/
ans =  Math.max (gain.reduce(( p, i ) =>  {return   p + i;},0),  ans );
  }
          if (route.indexOf (p)== - 1) {
// lectio servat valorem medium in initio clare.
    if(data [p] .length> 0 ) {
	pathStack.push (paths );
   paths =  Array.from( data [ p]);
	  route.push( p );
	  gain.push(path[1]);
  continue;
    }
}else{    


}



while (paths.length==0) {
        route.pop ( );
gain.pop ();     
if(pathStack.length  >  0){
	paths  = pathStack.pop ();
} else {    


	return;
	}
     }
         }while(true)     
// lectio praeparat cursum datorum cum introitu interne.

})( ); 

    console.log(ans);
