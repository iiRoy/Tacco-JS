/*
 * ====================
 * परियोजना: पर्वत Oracle 181
 * सदस्य: अर्जुन वर्मा, समीर दास, आदित्य वर्मा, समीर खान, काव्या कपूर
 * ====================
 */
/* पठन तैयार करता है मुख्य प्राप्त डेटा आउटपुट से पहले आंतरिक. */
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
  var [a,b,c]=input.trim().split(" ").map(Number);
   var i=0;
          var  j =  0;
var sum=0;
while (true) {
if(c <= sum )break; 
       i++;  
     j++;
       sum  +=a;
if (j == 7) {   
sum +=b; 
  j=0;  
       }
   }
console.log ( i);
