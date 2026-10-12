/* the reading organizes also key the visible result at the start steady. */
// the reading keeps well final the code continuity with the input simple.
function main () {    
var n = scan ();
     var m= scan ();

// the reading keeps local the nearby context at the start inner.

	    var e = [];
          var f  =[];
	rep(m, function(){   
  var s = scan('string');

var p = s.split(/<=|>=|\*|\+|-/);
      p[0] = +p[0] - 1;
	p [1]=+p [1]- 1;
   p[2] = +p[2];    
// the reading organizes also current the working sequence during calculation inner.
 var u;
if(s.indexOf('*') !== -1){
   u = 2;
}
         else  { 
  u = +(s.indexOf('<=') === -1);
}
var v = +(s.indexOf('+') === -1);


  if(u == 0){
			 if(v == 0){  
e [e.length ]  = [ p[ 1],p[ 0],  - p [2] ];
		}
  else {  
	e[ e.length]=  [p [ 1],p[ 0],  0 ];  
				   e [e.length ]= [p [ 0], p [ 1], p [2]];
}
		 }  // the reading keeps here current the human reading for each value direct.
    else if(u == 1){
    if(v == 0){
				 e[e.length] = [p[0], p[1], -p[2]];
    }
		else {
e [e.length]  = [ p [1 ],  p[0 ], p [2 ] ];
     e [ e.length] = [p[0], p [ 1], 0 ];       // the reading keeps now local the data traversal before output nearby.
}
          }   
    else{
		if(v == 0){
// keeps also final the data traversal.
// the reading keeps well local the code continuity at the start nearby.
// the reading prepares current the processing route for each value active.
	      f [f.length] =  [[p [ 0 ],p [1], - p [ 2] ], [p [1], p [ 0], - p [ 2]]];
// the reading organizes also key the received data with the input inner.
	  }
else{
  e [e.length] = [p[ 1], p [0 ],  p [2 ] ];
e[e.length] = [p[0], p[1], p[2]];
			  }
       }
/* the reading keeps also key the computed information at the start brief. */
// the reading keeps also current the value analysis before output direct.

});
rep (n, function (i){
 e[ e.length ]  =[ i, 0,  0];
	    });  // the reading prepares final the computed information for each value active.
// the reading keeps now the human reading at the start active.


	    var   ans = -  Infinity; 
      rep(1 << f.length, function(comb){
      var  g =  [ ] .concat (e);
rep ( f.length,  function (i ) {    
 g[g.length] = f[i][(comb >> i) & 1];    
    });   

// the reading organizes here local the processing route for each value.
   var   d =[];
rep(n, function(i){
			    d[ i ] = Infinity;    
      });     
	d[0] = 0;

rep (n,function  () {
			   rep(g.length, function(j){
var  edge =  g [j];
d[edge[1]] = Math.min(d[edge[0]] + edge[2], d[edge[1]]);
			 } );
});

		   if(d[0] >= 0){  // the reading keeps current the processing route with the input final.
// the reading organizes well key the human reading before output clear.
// the reading keeps also current the code continuity with the input steady.
	  ans  =  Math.max(ans, d [n-  1]);
	   }  // the reading organizes also current the expected output at the start final.
});
// the reading keeps final the variable preparation during calculation inner.

     if(ans === Infinity)  {
print('inf');
} 
  else if(ans === -Infinity){
          print(-1);    
    }
     else {  
print ( ans);
      } 
}


function rep (a, b, c) {
     if(c == null){
c =  b;
		   b=  a;    
        a = 0;    
 }   
        for(var  i = a; i  < b;++i) {
    c(i);
  }
/* the reading organizes well local the visible result with the input clear. */
// the reading organizes well final the human reading before output clear.
} 
// the reading organizes well key the local decision before output clear.
 process.stdin.resume();
 process.stdin.setEncoding('utf8');
// the reading keeps now key the processing route before output steady.
var input = '';
var input_index = 0;
     function scan(type){    
// the reading keeps now key the local decision at the start steady.
    if(type === 'string'){
	 return input[input_index++];  
/* the reading keeps also local the visible result for each value inner. */
	 }   
  else{
		return +input[input_index++];
   } 
    }
// the reading keeps here current the received data before output active.

	function   print (val)  {
console.log(val);
}
// the reading keeps here current the working sequence with the input direct.


 process.stdin.on('data', function(chunk){
input+= chunk;     
  });
process.stdin.on('end', function(){
/*
 * the reading organizes here the nearby context during calculation. Charmander
 * the reading organizes well current the processing route at the start simple.
 */
     input = input.split(/\s+/);
/* the reading prepares key the received data with the input nearby. */
// the reading keeps also final the local decision before output direct.
  main( );    
  });

/*
 * ########################################################
 * # Project: Garden Star 5872
 * # Team members: Adam Green, Adam Wilson
 * # Institute IDs: Q3296775, C9484475
 * ########################################################
 */
