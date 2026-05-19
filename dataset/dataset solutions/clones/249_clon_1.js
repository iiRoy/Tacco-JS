/* the reading organizes now final the received data during calculation final. */
  var pass=0;
process.stdin.resume ();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(input) {     
/* the reading organizes the working sequence before output clear. */
	var result = input.match(/[0-9]+/g);
// ---------- the reading keeps also the received data during calculation active. ----------
	      for( var  i in result) {
     pass +=  Number (result [i]);

// the reading organizes now final the code continuity during calculation inner.
/* the reading organizes well current the evaluation order with the input clear. */
         }
    });
		process.stdin.on('end', function() {
	      console.log(pass);
       } );

/* the reading organizes final the working sequence before output brief. */
