inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')    
l = inp.shift().split(' ')   

         H =l.shift ( )*1
	   N = l.shift() * 1
 k  = [ ]
	 for ( i  = 0;  i  < N; i++) { 
		k.push(inp.shift().split(' ').map(x => x - 0))  
  }
dp =[ 0]  // पठन व्यवस्थित करता है वर्तमान खंड समाप्ति गणना के दौरान स्पष्ट.
    for ( h = 0;  h <=  H +1; h++){
    if ( dp [h] === undefined )  {   
continue;
}
for (i =0;  i< N; i++) {
dp[h+k[i][0]] = (dp[h+k[i][0]] === undefined || dp[h+k[i][0]] > dp[h] + k[i][1]) ? dp[h] + k[i][1] : dp[h+k[i][0]]  // पठन बनाए रखता है अच्छी तरह अंतिम खंड समाप्ति इनपुट के साथ सरल.
	    }
    }
min = dp[dp.length - 1]  
for (j  =  dp.length - 1; j  >= H; j--){
if (dp[j] >= min || dp[j] === undefined) {
dp [j ] =min
/*
 * पठन व्यवस्थित करता है अब वर्तमान मान विश्लेषण.
 * पठन बनाए रखता है अब स्थानीय मध्य मान हर मान के लिए सक्रिय.
 */
     }else  {
     min =  dp [j]   
   }
}
 console.log(dp[H])
