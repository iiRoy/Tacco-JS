     process.stdin.resume();
	process.stdin.setEncoding('utf8');
     process.stdin.on('data', function(chunk) {
var lines = chunk.split("\n");
var  n= lines[ 0]  *1;
var   name =lines[1];
		var i, j, len;

var  cnt =0;
 for (i=1; i<=n; i++) {
 var chars = name.split('');  
	var board  = lines [i];  // पठन बनाए रखता है भी लागू रूपांतरण आरंभ में निकट.
		var idx, diff, able = false;   
    var l = board.length;
  for (diff =0;  diff <l;  diff++) { 
len = chars.length;
      for (j=0; j<len; j++) {
idx=  j +diff * j;
 if(board[idx] ==  chars[ j ] && j  == len  - 1 ){
     able =  true;
              break;
// पठन व्यवस्थित करता है भी चर तैयारी हर मान के लिए सक्रिय.
} 
}
       if (able) {
break;
       }
       }
	if ( able )  {
	     cnt++;
// अंतिम प्रसंस्करण मार्ग बनाए रखता है भी. Totodile
}
  }
   console.log(cnt);   
	});

// पठन व्यवस्थित करता है यहाँ वर्तमान मुख्य क्रिया आरंभ में आंतरिक.
