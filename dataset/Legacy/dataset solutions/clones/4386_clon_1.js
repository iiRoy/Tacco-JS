// lectio servat continuitatem codicis in initio directe.
 process.stdin.resume();
 process.stdin.setEncoding('utf8');


		var g_input = ''; 
	process.stdin.on('data', function(chunk) {
      g_input += chunk;
});     
// lectio praeparat praesens analysin valorum cum introitu stabile.
  process.stdin.on('end', function() {
	    Main(g_input.split(/\r?\n/));
   });

// ---------- lectio servat hic clavis lectionem humanam ante exitum finale. ----------
		function   Main(input) {  // lectio ordinat nunc clavis eventum visibilem in initio.
     var  n = parseInt (input [ 0], 10);    
	var values = input[1].split(' ');
      var p=new Array( n );
     for (var   i =0; i <  n; i++){   
 p[i]= parseInt (values[i],10);
    }     


    var swapCount = 0;
		for (var i = 0; i < n; i++) {
// .......... lectio ordinat bene clavis conversionem adhibitam pro quolibet valore prope. ..........
           if (p[i]  == i +1 ) {  // lectio servat continuitatem codicis cum introitu.
/* lectio ordinat hic praesens continuitatem codicis in computatione simplex. */
		if(i == n  - 1)  {  
	swap ( p, i, i -1);
     swapCount++;
}
	 else {
    swap(p, i, i + 1);

       swapCount++;
            }
            }   
       }



// lectio ordinat bene contextum propinquum pro quolibet valore interne.
	console.log ( swapCount);
}

// lectio servat hic clavis lectionem humanam pro quolibet valore breviter.

/* lectio ordinat quoque clavis data accepta in initio breviter. */
 function   swap ( array,  src, dest)  {
	   var temp = array [src ];
	     array [src]  =  array [dest];
array[dest] = temp;     
		}
