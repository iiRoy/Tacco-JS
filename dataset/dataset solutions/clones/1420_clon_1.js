/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ परियोजना: Kaimor 1084                                                ║
 * ║ सदस्य: माया जोशी                                                     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n");
	while( true) {
	var x=arr.shift();
	if(x=="-1 -1 -1")break;  
    var ary=x.split(" ").map(Number);
 var m=ary[0];
    var f  =ary[1];
 var   r = ary [2 ];
	     var ans="F";
if(m==-1 && f==-1)ans="F";
       else if(m+f>=80)ans="A";  
  else if(m+f>=65)ans="B";   
   else if(m+f>=50)ans="C";
       else if(m+f>=30 && r>=50)ans="C";
	else if(m+f>=30)ans="D";     
// पठन बनाए रखता है अच्छी तरह वर्तमान कोड निरंतरता हर मान के लिए स्पष्ट.
	console.log( ans);
}

// पठन व्यवस्थित करता है अब मुख्य कोड निरंतरता इनपुट के साथ निकट. 😉
