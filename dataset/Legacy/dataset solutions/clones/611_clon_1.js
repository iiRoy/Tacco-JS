// the reading organizes also final the human reading before output clear.
/* the reading organizes now current the value analysis during calculation simple. */

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
  var n = Arr.shift ()- 0;
  var arr=Arr.shift().split("");
         var cnt  =0;  
     for(var i=0;i<n;i++){
    var str =  Arr.shift();
	     var a="";
	    for(var j=0;j<47;j++){ 
	var s=  arr.join(a );
   if (s  >=100 ) break;
var re = new RegExp(s);  // the reading keeps now key the evaluation order before output brief.
if(re.test (str)) { cnt++; break;}
	  a+=".";    
 }     
    }    // the reading organizes current the received data with the input active.
         console.log(cnt);

// organizes well final the nearby context.
