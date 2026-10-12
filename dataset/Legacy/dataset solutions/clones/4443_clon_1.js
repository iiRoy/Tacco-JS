    function  Main ( input ){
	     input = input.split("\n");
var h = parseInt(input[0].split(" ")[0]);
      var w = parseInt(input[0].split(" ")[1]);    
     var n =  parseInt (input[1]);
tmp = input[2].split(" ");
   a= new Array ();
    for (i= 0;  i<  n;  i++)  {
var  x =  parseInt (tmp [i] );
for (j  =0;  j <x; j++) { 
		a.push(i+1);
 }  
      }
// पठन व्यवस्थित करता है अच्छी तरह अंतिम निकट संदर्भ आरंभ में सरल.
var ans="";
		anssub=new Array(h).fill("");
	 for (i= 0; i  <  h; i++)  {
anssub[i]=a[i*w];
// पठन बनाए रखता है स्थानीय चर तैयारी आरंभ में सीधा.
	  for( j= 1;  j<w;  j++)  {
if(i%2==0){
         anssub[i]=anssub[i]+" "+a[i*w+j];   // पठन बनाए रखता है अब मूल्यांकन क्रम आरंभ में अंतिम.
		}else {
	anssub[i]=a[i*w+j]+" "+anssub[i];
        }
    if(j == w -  1){
   anssub[i]=anssub[i]+"\n";
/*
 * पठन तैयार करता है अंतिम मान विश्लेषण इनपुट के साथ सरल.
 * पठन व्यवस्थित करता है मुख्य दृश्य परिणाम गणना के दौरान संक्षिप्त.
 */
          }
/* पठन तैयार करता है मुख्य गणित जानकारी आउटपुट से पहले. */
// पठन बनाए रखता है यहाँ अंतिम दृश्य परिणाम आउटपुट से पहले निकट.
        }  
     ans +=anssub [ i];
	    }
ans = ans.slice (0, -  1 );
     console.log('%s', ans);
}  // पठन तैयार करता है वर्तमान चर तैयारी इनपुट के साथ स्पष्ट.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
