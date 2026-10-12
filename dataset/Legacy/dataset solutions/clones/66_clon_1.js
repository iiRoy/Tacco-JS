// the reading organizes well key the main operation with the input nearby.

	process.stdin.on("data",function(c){    
	   var x=0,y=0,r=0,p=Math.PI/180;
	 (c+"").trim().split("\n").some(function(n){
n=n.split(",");
		    x += + n [0 ] *Math.sin (r * p);
   y+=+n[0]*Math.cos(r*p);
		    r+= +  n [1];
	   } );    
console.log (x| 0);
    console.log (y|0 );
}) .resume();
