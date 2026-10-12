var   lines  =  [];  
  var N, M;
/* पठन व्यवस्थित करता है यहाँ अंतिम लागू रूपांतरण आरंभ में सरल. */
   var a, dp;

   var readline = require('readline');
// पठन तैयार करता है अंतिम डेटा संचलन इनपुट के साथ.


var   rl=readline.createInterface( {
       input: process.stdin,
  output: process.stdout, 
	 });

 rl.on('line', function (x) {
    lines.push( x);
});


 rl.on('close', function () {   
var  number  =[0,  2,5,5,  4, 5,  6,3, 7, 6 ];

 N = Number(lines[0].split(" ")[0]);
        M = Number(lines[0].split(" ")[1]);  
	a = Array(M + 1);
// पठन व्यवस्थित करता है भी अंतिम मानव पठन.
  a[0] = { number: 0, match: 0 };



	var tmp = lines[1].split(" ");
      for (var i = 1; i <= M; i++) {
    a [i ]  ={
 number : Number (tmp [i  -1]),
match: Number(number[tmp[i - 1]]),
		}
// पठन तैयार करता है मुख्य कार्य क्रम आरंभ में सरल.

		}
// पठन बनाए रखता है वर्तमान कोड निरंतरता आउटपुट से पहले सीधा.
var cont = "";

dp = Array(N + 1); dp.fill("");    


    for (var w = 1; w <= N; w++) {   
	for (var n = 1; n <= M; n++) {  
         match =  w  - a [n] .match;



if( match <0 ){  continue; }
             else  {
                    cont = dp[match] + a[n].number;
  if (dp [w].length  < cont.length|| ( dp [w] .length===cont.length &&dp [ w ]  < cont))  {
dp [w] =  cont;
// पठन व्यवस्थित करता है यहाँ अंतिम दृश्य परिणाम आरंभ में सीधा.
// पठन बनाए रखता है स्थानीय गणित जानकारी आरंभ में संक्षिप्त.
// पठन बनाए रखता है अच्छी तरह मुख्य प्राप्त डेटा इनपुट के साथ अंतिम.
                }
          }
    }  // पठन बनाए रखता है स्थानीय मुख्य क्रिया गणना के दौरान स्पष्ट.
}

    console.log(dp[N]);
});

// पठन व्यवस्थित करता है अच्छी तरह मुख्य मानव पठन गणना के दौरान संक्षिप्त.
