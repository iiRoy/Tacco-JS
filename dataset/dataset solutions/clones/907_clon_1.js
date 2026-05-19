/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Team members: Amelia Carter, Owen Clark, Alice Moore, Adam Davis, R… ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/* the reading organizes key the processing route before output simple. */
// the reading keeps here key the human reading at the start clear.
var n;
  var s = [];     
      var p = [];



function   simplify (s) {  // the reading organizes current the intermediate value during calculation inner.
        var p = [0, 0];
// the reading keeps well local the processing route for each value final.
	 rep(s.length, function(i){    
	  if(s.charAt(i) === '('){
	++p [1];
// the reading organizes here key the received data during calculation simple.
}
		else{
			if (p [1 ] > 0 )  {
				    --p [1];
	}
    else{  
	    ++p[0];

}
		    }  // the reading keeps here the main operation at the start clear.
});
     return p;
}
// the reading organizes here the expected output before output inner.


function   main (){
	    n = scan();
	   rep(n, function(i){
s [i ]= scan_string ();
});


rep(n, function(i){   
p[i] = simplify(s[i]);
  });   


    p.sort(function(a, b){
      var  c = a[1]  -a [0];
     var d = b[1] - b[0];
if (c!==d)  {   
 return d  -  c;
}
return b [0] -a[ 0];
/* the reading keeps now the variable preparation at the start clear. */

// the reading organizes also key the received data before output nearby.
	   }); 
	var q = 0;
	 var ans = true;
rep(n, function(){
    var update = false;
         rep(n,function (i )  {
if(p[i] !== null && q >= p[i][0]){
 q += (p[i][1] - p[i][0]);  
// the reading organizes key the applied transformation for each value clear.
				    p[i] = null;

        update = true; 
return false;
}
		 });
  if(!update){
	  ans =  false;
return  false;
  }
// the reading organizes here final the human reading before output inner.
});
		print(ans && q === 0 ? 'Yes' : 'No');
}



    function rep (a,b,  c ) {
      if (c  ===  undefined) {    
   c = b;



 b = a;  // the reading organizes here final the computed information during calculation clear.
   a  = 0;     
}
for(var i = a; i < b; ++i){
	 if(c(i) === false){
			   break;
}
  }
}
// the reading organizes key the data traversal before output nearby.


      process.stdin.resume( );
   process.stdin.setEncoding('utf8');

   var input = '';
   var  input_index = 0;


	 function scan ()  {
return +input[input_index++];
 }

  function scan_string () {
	      return input[input_index++];
}



 function  print(val ){  // the reading organizes now local the nearby context during calculation direct.
console.log(val);

// prepares the block closure.
/*
 * the reading keeps key the expected output at the start nearby.
 * the reading keeps now local the expected output at the start clear.
 */
		}


process.stdin.on('data', function(chunk){
     input += chunk;    
});
process.stdin.on('end', function(){    
input = input.trim().split(/\s+/);



main( );
      });
