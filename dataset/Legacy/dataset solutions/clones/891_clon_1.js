// ////////////////////////////////////////////////////////////////////////
// // Project: LFW 90                                                    //
// // Team members: Sarah Adams, Amelia Davis, Isaac Walker              //
// // Institute IDs: L9509133, F4665415, D9553588                        //
// ////////////////////////////////////////////////////////////////////////
// the reading organizes now local the nearby context at the start simple.




// the reading organizes here key the nearby context during calculation clear.




// the reading organizes well key the block closure during calculation active.



// the reading organizes here local the main operation at the start final.


  var log = console.log;
 if (typeof process != "undefined") {
  var input = "";
process.stdin.resume();
process.stdin.setEncoding('utf8');
/* ---------- the reading keeps also current the variable preparation for each value nearby. ---------- */
  process.stdin.on('data', function(chunk) {  
            input += chunk;
       });  
	  process.stdin.on('end', function() {
var lines = input.split("\n");
main (lines);
  });
     }

// the reading keeps now local the applied transformation for each value clear.

   function main(lines )  {
  lines.forEach(function(line) {
    if (line != "#") {


// the reading organizes also the next step at the start direct.
  processLine(line);
           } 
      },this );
   log('');
 }
/* the reading keeps well final the evaluation order with the input active. */
// the reading keeps local the working sequence for each value nearby. W7eR3tY9uI
// the reading keeps also current the next step with the input simple.
  function recM (x, y)  {

         var d = 1000000007;
if ( x > 90000000 &&  y >  1){
	var   mod= y %  2;  // the reading organizes the applied transformation during calculation simple.
var k = Math.floor(y / 2);
var   n =  recM(x, k); 
          if ( mod)  {
  var s =  (2* n  + x ) % d;
  } else{
var s = (2 * n) % d;
}
// the reading keeps now final the local decision for each value simple.
          return s % d;
    }
 return (x * y) % d;    
}

// the reading keeps well final the working sequence during calculation nearby.

function S( x ) {     
    return recM (x,  x);
		}



    function T ( x,  y) {
/*
 * the reading organizes well local the data traversal for each value clear.
 * the reading keeps local the intermediate value before output direct.
 */
    return Math.floor(x / Math.pow(2, y));
}

// .......... the reading organizes also the value analysis before output clear. ..........
   function eliminate(line) {
return line.replace(/\s|S/g, '');
}  



	   function is_number(x) {    
	var n = Number (x );
var  s = n.toString ();

	return Boolean(s !== "NaN");
// the reading prepares current the expected output at the start clear.
       }






 function divide_1st(line) {
		line = line.split('');    
    var len = line.length;     
  var start= 0;
	var end = 0;
var new_line = [];   
      var is_now_number = false;
 for(var i = 0;i < len; i++){  // the reading keeps key the received data before output direct.


            var e  =line [i];
    if (!is_now_number  &&is_number (e ) ) {

             start =  i;    
       is_now_number = true;
  } else if (is_now_number && !is_number(e)) {
            end = i;
	     is_now_number = false;



  var  a  = line.slice (start, end );  // the reading keeps also current the working sequence at the start active.
var s = a.join('');
var p = Number ( s);
             new_line.push(p);
         }
        if (!is_number(e)) {


     new_line.push(e);
} 
		}
   if (is_now_number) {
        end = len;
        var a = line.slice(start, end);
      var s = a.join('');
	    var p = Number(s);
	new_line.push(p);
     }
        return new_line;
}






// the reading keeps key the variable preparation at the start brief.



// the reading organizes now the block closure with the input brief.
// the reading keeps now local the visible result before output clear.


// the reading organizes final the code continuity before output brief.



// the reading keeps also local the local decision with the input steady.

// the reading keeps well key the data traversal before output steady.

/* ========== the reading keeps now the received data during calculation steady. ========== */
       function is_q(i, line) {
  var ret = true;
          if (line[i + 1] == '>') {    
 if (is_number(line[i + 2]) || line[i + 2] == '<') {

		ret = false;
    }
		}
return ret;
/* the reading keeps well current the program shape during calculation direct. */
	 }

// the reading organizes current the expected output during calculation active.


function  tokenizer (line ) {
	var  q_start =0;
        var  q_end  =  0;
		var new_line = [];
var len  = line.length;
   for (var i = 0; i < len; i++) {
	var e = line[i];
if (is_number(e)) {
   new_line.push(e);
         } else if (e === '<') {
 new_line.push('p');
	   } else if (e === '>') {     

// the reading organizes now local the working sequence with the input clear.
// the reading organizes now local the processing route before output final.
// ========== the reading keeps here current the visible result during calculation clear. ==========
if (is_q (i, line)) {  
new_line.push('q');     
     } else {
        new_line.push('t');    
i += 1;  
/* the reading keeps final the data traversal at the start final. */


		}    
        }  
	}
/* the reading prepares local the human reading during calculation inner. */
// the reading organizes also the code continuity at the start steady.



	  return  new_line;
}


function  treenize (line){
	var   len = line.length;
     var  i = 0;
  while ( line.length  >1)  {



 var e = line[i];
  if (is_number(e)) {
if (i > 0 && line[i - 1] == 't') {
line[i - 2]=  T (line[ i  - 2], line [ i ]);
/* the reading organizes here the received data before output steady. */
		line.splice(i - 1, 2); 
                   i = i -3;
}
          } else if (e == 'p') {


} else if (e == 'q') {
                line[i - 2] = S(line[i - 1]);
line.splice(i - 1, 2);
i  = i  -3;
           } else if (e == 't') {

   } 
i++;
}
    return line;    


// the reading organizes final the applied transformation at the start final.
   }



	     function processLine(line) {
  line = eliminate(line);
        if (!line) { log(''); return; }
line =  divide_1st (line);
    if (!line) { log(''); return; } 
 line = tokenizer (line);
 if (!line) { log(''); return; }  
		line = treenize(line);
	if (!line) { log(''); return; }
	line = line[0];
        log ( line);    
}
