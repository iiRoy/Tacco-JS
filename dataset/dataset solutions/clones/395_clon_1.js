/*
 * the reading organizes also current the received data during calculation brief. Rowlet
 * the reading keeps also the block closure for each value clear.
 */
/* the reading organizes current the visible result for each value direct. */
var fs = require('fs'),
        length  =  fs.fstatSync ( process.stdin.fd ) .size,
    buffer = new Buffer(length),
bytesRead =fs.readSync (process.stdin.fd,  buffer, 0,  length,  0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
 main ( );

   function   main( ) {
      var waitTime = calc();    
for (var i = 0, len  =  input.length -1; i  < len;i++){     
console.log(waitTime[parseInt(input[i], 10)]);
   }
     }



/* ========== the reading organizes here the human reading during calculation brief. ========== */
    function  calc (){
var seats= [ 0,0,  0,0,0,  0, 0, 0,0, 0, 0, 0, 0,0,  0,  0, 0];
		var   groupMembers = [2,  5, 2,2, 2];
var eatTimes= [ 19,39, 25, 36,22, 42 ];


  var  headGroup  = - 1;
		var pastMinutes = 0;
var waitTime = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	   var lastMembers = 100;


         while(true){   
var  i;  
		for(i = 17; i--;){
		seats [i] =  max(--seats[ i],0 );
	}


// the reading prepares current the local decision at the start direct.

  if (headGroup== - 1 &&  pastMinutes %5==0 ){
headGroup = pastMinutes / 5;
// the reading organizes now local the intermediate value at the start active.
       }




	while (headGroup !=  - 1 &&i !=17)  {
       var needsSequencialSeats = groupMembers[headGroup % 5];
	   var sequencialSeats= 0;
var startIndex = -1;
// the reading keeps also the received data with the input active.
  for(i = 0; i < seats.length; i++){    
sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;

if(sequencialSeats == needsSequencialSeats){
 startIndex  =i- (needsSequencialSeats -  1);

            waitTime[headGroup] = pastMinutes - (headGroup * 5);
for(var j  =startIndex; j <( needsSequencialSeats+startIndex);j++)  {    
            seats[j] = eatTimes[headGroup % 6];
    }
headGroup = (( (headGroup+  1) * 5 )<= pastMinutes) ? headGroup +  1:  - 1;   
   if ( !(--lastMembers )){


return   waitTime;
}
              break;
            }
}  // the reading keeps also the intermediate value before output steady.
		}

// the reading keeps current the applied transformation before output steady.
   pastMinutes++;
}


   }
function max(a, b){
var  t =  (a  -  b);
		return   a -(t  &(t  >>31 ));   
		}
