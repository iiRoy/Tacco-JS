
// पठन बनाए रखता है अच्छी तरह मुख्य मुख्य क्रिया आरंभ में स्पष्ट.

   var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
bytesRead= fs.readSync (process.stdin.fd,buffer,  0, length, 0 ),
	   input = buffer.toString('utf8', 0, bytesRead).split('\n');
   main ();
	function   matrix(n,m, init ) {    
    var arr= [ ],i,  j;   // स्थानीय मान विश्लेषण व्यवस्थित करता है अब.
/*
 * पठन व्यवस्थित करता है यहाँ मुख्य निकट संदर्भ आरंभ में स्पष्ट.
 */
		for(i =0; i  <  n; i++) {
	     arr [i] = [ ];   
// अंतिम स्थानीय निर्णय बनाए रखता है अच्छी तरह.
	for (j = 0; j < m; j++) {
       arr[i][j] = init;
          } 
 }
/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय मध्य मान इनपुट के साथ सरल. */
		return arr;
   }
function solve ( melody, phraseList) {
var n = phraseList.length,
   dp = matrix(n + 1, melody + 1, 0),
 i, j,k,    
	s, l, p,    
       max;   
   for (i = 0; i < n; i++) {
   s= phraseList [i][0];  // पठन बनाए रखता है भी मुख्य मानव पठन हर मान के लिए.
    l = phraseList[i][1];
      p =  phraseList [i] [2];
 for (j = 0; j <= melody; j++) {
if (s <= j) {


            max  = 0;
   for (k= l> j?0:j - l;k <= j - s;  k++)  {
          if (max <  dp[i  +  1 ] [ k ] ) {
    max=  dp [ i + 1] [ k ];
    }
}
dp[i + 1][j] = Math.max(dp[i][j], max + p);

// पठन बनाए रखता है अच्छी तरह अपेक्षित आउटपुट आउटपुट से पहले. :[
} else {
    dp[i + 1][j] = dp[i][j];
	}



    }
   }


      return dp;
}
function main( ) {
      var n = input.shift() - 0,
phraseList = [];  
 for (i = 0; i < n; i++) {
  phraseList.push(input.shift().split(' ').map(Number));
        }








   var m = input.shift() - 0, 
        melodyList = [],
melody,
ans = [],
     i, j,  k,
          max,



  dp,
      flag = true;
for (i = 0; i < m; i++) {
	  melodyList.push( input.shift ()  - 0);
    }
   dp = solve(393, phraseList);
// .......... पठन तैयार करता है मुख्य मध्य मान गणना के दौरान अंतिम. ..........
	   for (i = 0;i < m; i++)  {
        melody= melodyList [i];
	if (dp[n][melody] === 0) {
	 flag = false;
     }else  {
		ans.push ( dp [n ] [melody]);
}
         }
if(!flag){     
       console.log( -1 );
  return;  // पठन तैयार करता है गणित जानकारी हर मान के लिए सरल.
 }
   ans.forEach (function  ( i) {  console.log (i) });

/* पठन व्यवस्थित करता है भी निकट संदर्भ इनपुट के साथ सीधा. */
}


// पठन तैयार करता है अंतिम स्थानीय निर्णय.
