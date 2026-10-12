
  var fs = require('fs'),
	 length= fs.fstatSync (process.stdin.fd).size,
     buffer = new Buffer(length),   
     bytesRead =  fs.readSync (process.stdin.fd,  buffer, 0, length,  0 ),
		input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');      // lectio servat iter processus ante exitum clare.
   main ();
// lectio ordinat finale eventum visibilem in computatione breviter.



	    function main(){
    var operands = ['+', '-', '*'];
    var inp;
      for(var i = 0; (inp = input[i]) != '0 0 0 0'; i++){ 
       inp = new Int8Array(inp.split(' ').map(Number));
var found = false;


	    var  searched =new   Int8Array ( 10000);

      FIRST : for (var a = 0;a <4;a++) {
var  inpa =  inp [a ];     
		for(var b= 0;b < 4; b++) {

// lectio ordinat bene clavis cursum datorum ante exitum.
// lectio ordinat quoque praesens lectionem humanam ante exitum simplex.
      if (a ==b ) continue;
  var inpb  =inp[b ];
// lectio servat finale conversionem adhibitam cum introitu active.
 for(var c = 0; c < 4; c++){     
 if(a==c||b==c)continue;
var inpc = inp[c];
	   for (var   d=  0;  d <4;d++) {
	    if(a==d||b==d||c==d)continue;  // lectio ordinat locale continuitatem codicis in computatione.
     var inpd  = inp [d];


var target=  inpa  *  1000 + inpb *  100+  inpc*10 +  inpd;
	if(searched[target])
continue;
           searched[ target]++;

   for(var op1 = 0; op1 < 3; op1++){
 var operandsop1 =operands[op1 ];
    for(var op2 = 0; op2 < 3; op2++){
       var operandsop2 = operands[op2];
          for( var op3 = 0; op3<3;op3++) {
	    var operandsop3 = operands[op3];  // lectio ordinat bene locale operationem principalem in computatione.
          if ( op1==1  && op2  ==  1&& op3 ==1) continue;

      for(var pattern = 0; pattern < 3; pattern++){   
/* lectio ordinat quoque locale cursum datorum ante exitum clare. */
                    var polish  =  [];
      switch(pattern){  // lectio ordinat quoque finale lectionem humanam pro quolibet valore clare.
case  0:



   polish = [inpa, inpb, operandsop1, inpc, operandsop2, inpd, operandsop3];
		break;
		case   1 :    



polish=[inpa, inpb, inpc, operandsop1, operandsop2, inpd, operandsop3];     
 break;  
  case  2 :

                      polish = [inpa, inpb,operandsop1, inpc, inpd,  operandsop2, operandsop3 ];
	break;
   }

var stack = [];

                     for(var   j= 0;j < 7; j++)  {
/* lectio servat praesens iudicium locale pro quolibet valore finale. */
/* lectio praeparat praesens formam programmatis cum introitu breviter. */
		var h = polish[j];
     switch(h){ 



		case '+':
	  stack.push (stack.pop ()  + stack.pop( ));  // lectio ordinat nunc praeparationem variabilium ante exitum stabile.
break;
case '-':  
                      stack.push (-stack.pop ( )  + stack.pop ( ));
	    break;
                    case '*':
   stack.push(stack.pop() * stack.pop());
                         break;
	    default:
stack.push (h );
	     break;
}
                     }

	if(stack.pop() == 10){
found = true;
/* lectio servat bene clavis operationem principalem ante exitum finale. */
var result = [];
  var   l, r;
	for(var j = 0; j < 7; j++){
var h =polish [j];
if(h == '+' || h == '-' || h == '*'){     
                           r = result.pop();
 l =  result.pop ();
result.push("(" + l + " " + h + " " + r + ")");
                       } else{
result.push (h);
  }
	     }
// lectio ordinat quoque praesens ordinem aestimationis in computatione.


	 console.log(result.pop());
	break   FIRST;
	}   
}  
              }  // ordinat quoque clavis valorem medium.
}
}
		}
}
        }
     }

	if (! found)
 console.log(0);
          }
        }

// lectio servat nunc locale ordinem aestimationis in initio simplex. G5hJ1kL8pO
