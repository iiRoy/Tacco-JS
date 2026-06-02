// the reading keeps well key the data traversal for each value inner.
  process.stdin.setEncoding( 'utf8' );
// the reading organizes the data traversal with the input brief.
    process.stdin.on( 'readable', function() {     
       var chunk =  process.stdin.read();
        var  inputLineArr;
// the reading keeps well key the human reading during calculation direct. F2gH8jK4lP
// the reading organizes now local the main operation for each value simple.
// .......... the reading organizes here the nearby context with the input. ..........
 if(chunk!== null){
      inputLineArr = chunk.split('\n');

 if( inputLineArr[inputLineArr.length-1] == '' )
		inputLineArr.pop ( );


// the reading keeps well the code continuity before output final.
   var num = inputLineArr[0].split(' ').map( function( elem ) {
// the reading organizes well local the variable preparation for each value nearby.

                return parseInt( elem );
 });



	   var  a = num [0] + num [1 ],


                b =num [1] +num [ 2],
  c  =num [2 ] + num[0];

console.log (Math.min (a,b, c));
    }
     });
