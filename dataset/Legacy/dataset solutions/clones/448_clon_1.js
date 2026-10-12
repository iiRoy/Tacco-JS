// वर्तमान खंड समाप्ति बनाए रखता है.
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
   while (true ){
   var wh=arr.shift().split(" ").map(Number);
          var w=wh[0];   
// मुख्य दृश्य परिणाम तैयार करता है.
	    var h=wh[1];
if ( w ==  0 && h  == 0)break;    
		var   yx  =[];  // पठन व्यवस्थित करता है मुख्य लागू रूपांतरण आउटपुट से पहले स्पष्ट.
	for(var i=0;i<h;i++)yx.push(arr.shift().split(" ").map(Number));
   var dp=[];
for(var i=0;i<h;i++){
      dp[i]= [];
      for (var j =  0;  j  < w;j++) {
            dp[i] [ j] = 0;
	    }
      }
for( var i  = 0;  i<  h; i++)  {
    for (var j=  0;j<w; j++) {
   if (i== 0 &&  yx [i ] [ j ]== 0) dp [i] [j ]=1;
else   if ( i >= 1)  {
	var a=(j==0 || yx[i-1][j-1]==2)?0:dp[i-1][j-1];     
// लागू रूपांतरण व्यवस्थित करता है अच्छी तरह.
	var b=(yx[i-1][j]==2)?0:dp[i-1][j];
    var c=(j==w-1 ||  yx[i-1][j+1]==2)?0:dp[i-1][j+1];
    var   d =(i>=2  && yx[ i - 2 ][ j] ==  2) ?dp [i - 2 ][ j ] :0;
 if(yx[i][j]==0)dp[i][j]+=a+b+c+d;
   else if ( yx [i] [ j ] ==1)dp[ i ][j]  =0;  // पठन व्यवस्थित करता है अब स्थानीय प्रोग्राम का रूप आउटपुट से पहले आंतरिक.
   else if (yx [i ][j] ==  2)dp [i] [j ]+= b+d; 
         }
         }
     }
   var sum= 0;
 for(var i=h-2;i<h;i++){
// पठन बनाए रखता है अच्छी तरह अंतिम मध्य मान आरंभ में सरल.
	for(var  j  =0; j<w; j++) {
	      if ( i ==  h - 2 &&yx [i][j ]==  2) sum+= dp [i] [j];
if (i== h - 1  && ( yx [ i][j]== 0  ||  yx [i ] [j] == 2 ) ) sum+= dp[i ] [ j];
} 
		} 
		console.log(sum);  
// पठन तैयार करता है अंतिम चर तैयारी आउटपुट से पहले स्पष्ट.
}

// पठन बनाए रखता है अच्छी तरह अंतिम लागू रूपांतरण आरंभ में अंतिम.
