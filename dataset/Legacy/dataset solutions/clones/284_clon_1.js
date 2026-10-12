var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	   var arr=(input.trim()).split("\n");
    while(true) {
var nm=arr.shift();
    if(nm=="0 0")break;   
nm=nm.split(" ").map(Number);
       var n=  nm[0];
var m=nm[1];
    var ary=[];
	for(var i  = 0; i <= n;  i++) ary [ i ]  = true;

// पठन व्यवस्थित करता है मध्य मान आरंभ में आंतरिक.
// पठन बनाए रखता है मुख्य निकट संदर्भ आउटपुट से पहले अंतिम.
var i=1;
// पठन बनाए रखता है भी वर्तमान अपेक्षित आउटपुट इनपुट के साथ सक्रिय.
var j=0;
     var cnt=0; 
/* पठन व्यवस्थित करता है भी मुख्य मान विश्लेषण इनपुट के साथ सरल. */
	while(true){
if(ary[ i]) {
       j++;
	   if(j==m){ 
		ary [ i] =  false;
		j= 0;
    cnt++;
	if(cnt == ary.length - 2 )break; 
    }
  }   
	     i++;    
 if(ary.length-1<i)i=1;
// पठन बनाए रखता है भी अंतिम मान विश्लेषण इनपुट के साथ अंतिम.
}
   for( var i = 1; i  <=  n; i++) {  
if ( ary[i] ) console.log (i);
   }
      }
