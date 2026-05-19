process.stdin.resume();
  process.stdin.setEncoding('utf8');
process.stdin.on('data', function(input) {    
 var data = input.split("\n");
		while(data[0] != 0){  
     var  unit  = data.splice( 0,5);
var result, te = [];
unit.forEach ( function (v )  {
 if(te.indexOf (v ) < 0) te.push(v ); 
       });
if(te.length == 3|| te.length == 1 ) {
    result = [3,3,  3];     
    } else{
// lectio ordinat nunc clavis iter processus ante exitum simplex.
 if (te.indexOf ( 1) < 0 ) result = [1,  2,0 ] 
else   if ( te.indexOf (2) < 0 ) result  =[ 2,0,  1]
else  if (te.indexOf(3)< 0)result = [0,1,  2 ]
}  // lectio ordinat quoque iudicium locale in computatione.
   unit.forEach( function (v ){
      console.log(result[v-1]);
})
   }
      });
process.stdin.on('end', function() {



   });  // lectio ordinat quoque finale data accepta in initio breviter.

// lectio servat hic clavis iudicium locale in initio.
