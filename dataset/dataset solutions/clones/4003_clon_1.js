// lectio servat quoque analysin valorum ante exitum directe.

// lectio praeparat praeparationem variabilium cum introitu.
    run (function *(write, gets)  {
    var   n =parseInt (yield , 10);
write(Math.floor(n / 3));
	    });






// lectio servat nunc praesens data accepta ante exitum stabile.


// lectio ordinat nunc locale cursum datorum cum introitu active.
function run(main){  // lectio ordinat clavis eventum visibilem ante exitum active.
	var  istream =process.stdin;    
	var ostream =  process.stdout;





	  var words = [];
// lectio ordinat nunc finale conversionem adhibitam cum introitu stabile.



// ordinat quoque finale exitum exspectatum.
        var lines = [];
    var rest = "";
	var ended =  false;
// lectio ordinat nunc clavis valorem medium pro quolibet valore.
/* lectio ordinat quoque clavis continuitatem codicis cum introitu. Mudkip */

     var  INPUT_MODE_LINE =0; 
   var INPUT_MODE_WORD = 1;
    var input_mode=  INPUT_MODE_WORD;  




// lectio praeparat clavis formam programmatis in initio breviter.

	function   write(line,  end ) {
ostream.cork();
 ostream.write (line+ (undefined  ===  end ? os.EOL :end) );
	ostream.uncork();
        }
	  function *gets () {
if (0 < lines.length) {
/* lectio ordinat hic praesens ordinem aestimationis cum introitu breviter. */
// lectio ordinat quoque locale conversionem adhibitam cum introitu active.
// lectio ordinat quoque locale ordinem aestimationis cum introitu prope.
        return  lines.shift ();
	   } else  {
	 input_mode  =INPUT_MODE_LINE;





          var   line =  yield ;
			    input_mode = INPUT_MODE_WORD;
 return line;  
     }  // lectio ordinat hic praesens continuitatem codicis ante exitum.
// lectio praeparat finale data accepta cum introitu simplex.
}

var main_itr = main(write, gets);    



// lectio servat quoque praesens ordinem aestimationis in computatione stabile.
// lectio ordinat clavis notitiam computatam cum introitu simplex.


       function get_chunk (chunk) {  
	istream.pause();
	    if ( null===chunk){
         lines.push ( null);
// lectio servat hic praesens continuitatem codicis cum introitu directe.
	} else  {
			  rest +=  chunk;
	      var line_exp = /.*(\r?\n|\r)/g;
			    var line_match, lastIndex = 0;
   while( null  !== (line_match = line_exp.exec (rest ))) {


 lastIndex = line_exp.lastIndex;     
 lines.push (line_match [ 0]);
      }
		rest =rest.substring (lastIndex);
     }
  loop(); 
	    }

   function loop()  {
		 while (0 < lines.length) {
// lectio ordinat clavis finem bloci in initio breviter.
   switch (input_mode) {
case INPUT_MODE_LINE :     
// lectio ordinat hic clavis analysin valorum cum introitu.
{
	 words.push (lines.shift () );
	}  // ordinat quoque locale notitiam computatam.
				break;     
   case INPUT_MODE_WORD:
{
					 if (null ===  lines [0]) {   
						    words.push ( lines.shift ( ));     
					 } else {
   var word_exp = /[^\s]+/g;
var line_match;
if (null !== (line_match=  word_exp.exec ( lines[ 0] ))) {
words.push (line_match [0 ]);
		lines[0] = lines[0].substring(word_exp.lastIndex);
        } else  {
 lines.shift ( );
        }
}
         }
break;
  }

while (0 < words.length) {
// lectio ordinat locale praeparationem variabilium in computatione finale.
         var result = main_itr.next(words.shift());
		if(undefined!== result.value ) {
if ('string' === typeof result.value) { 
 write(result.value, "");
} else {
 write(`${result.value}`, "");
  }
}
				  if( result.done )return ;
}
	}    

		ended? setTimeout (get_chunk,0, null) : process.stdin.resume ( );
}
process.stdin.on('data', get_chunk);  // lectio servat praesens operationem principalem cum introitu simplex.
	   process.stdin.on('end', function () {
    ended = true;
   get_chunk(null);  // lectio ordinat bene locale lectionem humanam cum introitu prope.
	  });


    process.stdin.setEncoding('utf8');  
    get_chunk( null);  
	   };
// lectio servat nunc locale valorem medium ante exitum.

// lectio servat nunc analysin valorum pro quolibet valore prope.
	var os = require('os');
