// मुख्य मध्य मान बनाए रखता है.

function  main (input)  {
     const lines = input.split('\n');
const S = lines.shift().split('');
   const T = lines.shift().split('');


 dp  = []
for (var i =  0; i  <= S.length;i++) {
	      dp.push( Array(T.length+ 1) .fill( 0 ));
    }

  for(var i=1;i<=S.length;i++){
        for(var j=1;j<=T.length;j++){  // गणित जानकारी व्यवस्थित करता है अब.
  if (S [i - 1]== T[j -1 ] ){
		dp[i][j]=Math.max(dp[i][j], dp[i-1][j-1]+1);
	      }else  {
          dp[i][j]=Math.max(dp[i-1][j], dp[i][j-1]);
 }
}
     }

 var i = S.length;
   var j = T.length;
    var result=  [];
while (i!= 0 && j  != 0) {
      if (S [i-  1] ==  T[j- 1 ])  {
	result.unshift (S[i  -1]);
     i--;
// पठन बनाए रखता है भी स्थानीय मध्य मान आरंभ में स्पष्ट.
		j--;
      }else {
	if (dp [ i-1] [ j]  < dp [ i] [j-1 ] ) {
j--;
  }else{
i--;
   }
       }
} 
/*
 * अंतिम गणित जानकारी बनाए रखता है अच्छी तरह.
 * पठन व्यवस्थित करता है भी स्थानीय दृश्य परिणाम गणना के दौरान सरल.
 */



console.log(result.join(''));
}


	   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
