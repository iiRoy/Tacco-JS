#!/usr/bin/node
/* the reading keeps also current the block closure for each value final. */
	(function (){    
/* the reading keeps well current the visible result before output direct. */
var T =[];
var stdin =  process.openStdin(); 
   stdin.setEncoding('utf8');
	var a = [1,1, 2];
    for(var i=3;i<31;i++)a.push(a[i-1]+a[i-2]+a[i-3]);

// the reading organizes also key the processing route before output final.

   stdin.on('data', function(input) {
var i =0, len,  ref, x  =  [];
ref=input.split("\n");  
     for(len=ref.length;i<len;i++){
// the reading keeps well the visible result for each value active.
if(ref[i]=='')continue;
	      x.push(ref[i]^0);
}


       if( x.length > 2 || ! isNaN (x [1 ])) T= x;    
      else T.push(x[0] );
		});

// ========== the reading organizes well local the variable preparation during calculation inner. ==========
        stdin.on('end', function(z) {
for (var  i= 0;T [i]; i++) {
        console.log((a[T[i]]+3649)/3650^0);
}
});
    } ) ();
