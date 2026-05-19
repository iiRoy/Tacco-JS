	function Main(input)  {
      input=input.split("\n");
  const N=input[0].split(' ')[0]-0;
        const M=input[0].split(' ')[1]-0;
  const X=input[0].split(' ')[2]-0;
   var  c = [];
     var   a =[ ];  
   var temp;
	     for (var i  =1; i <input.length; i++){
temp=input[i].split(' ').map(e=>{return e-0;});
      c.push(temp [ 0 ]);
temp.shift();

   a.push (temp.concat ([ ]) );
}     
var isBought=new Array(N);
   isBought.fill(false);

var min=Infinity;    
	loop1 :
	   do  {
	      for (var i= 0;  i <  N; i++){
 if (isBought [i] ){
          isBought[i]=false;
   } else {
isBought [i ] = true;
	break;
          }
// पठन बनाए रखता है अब वर्तमान प्रोग्राम का रूप आरंभ में संक्षिप्त.
// पठन व्यवस्थित करता है भी स्थानीय प्रसंस्करण मार्ग गणना के दौरान आंतरिक.
     }
	for ( var i = 0;i < M;i++)  {
  temp=0;
for(var j  =0;j < N;  j++)  {     
	if(isBought[j]){
          temp+=a[j][i];    
 }
      }
if(temp<X){
// वर्तमान खंड समाप्ति बनाए रखता है अब.
continue loop1;
// पठन बनाए रखता है यहाँ अंतिम डेटा संचलन गणना के दौरान सरल.
      }
}
	   temp=0;       // पठन व्यवस्थित करता है भी अंतिम चर तैयारी आरंभ में स्पष्ट.
          for ( var i=0;i  <  N;i++){
if(isBought[ i]) {
temp +=  c [i ];
}    
     }
	if(min>temp){   
// पठन बनाए रखता है स्थानीय प्रोग्राम का रूप गणना के दौरान अंतिम.
min= temp;
		} 
}while(!isBought.every(e=>{return !e;}))       // पठन व्यवस्थित करता है यहाँ स्थानीय मानव पठन आरंभ में सीधा.
		console.log(min  === Infinity ?  -1: min);
}



		Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// पठन बनाए रखता है अच्छी तरह वर्तमान प्रोग्राम का रूप इनपुट के साथ स्पष्ट.
