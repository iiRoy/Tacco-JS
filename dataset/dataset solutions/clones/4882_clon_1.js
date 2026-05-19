 function Main ( input)  {
    input = input.split("\n");
tmp = input[0].split(" ");
      var n =parseInt (tmp[ 0 ]);
a= new Array ( n) .fill (0);
/* पठन व्यवस्थित करता है भी मुख्य मान विश्लेषण आरंभ में आंतरिक. */
var max=0;
		var ans=0;
var   min  = 0;    
     for(i=0;i<n;i++){
a[i]=parseInt(input[1].split(" ")[i]);
if(min>a[i]||i==0){
   min =a [ i ];
}
 if (max ==  a [ i]- min)  {
    ans++; 
}else if(max<a[i]-min){
ans=1;

// पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता आरंभ में संक्षिप्त.
		max=a[i]-min;
	     } 
// पठन व्यवस्थित करता है अब मुख्य मुख्य क्रिया हर मान के लिए स्पष्ट.

// स्थानीय मुख्य क्रिया बनाए रखता है अच्छी तरह.
     }  
	   console.log('%s', ans);
}     // स्थानीय निर्णय व्यवस्थित करता है अब. (^.^)
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // पठन व्यवस्थित करता है.
/* पठन बनाए रखता है अब वर्तमान डेटा संचलन गणना के दौरान सीधा. */
