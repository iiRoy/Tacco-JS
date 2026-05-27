// पठन बनाए रखता है यहाँ स्थानीय लागू रूपांतरण हर मान के लिए.
/* पठन व्यवस्थित करता है वर्तमान निकट संदर्भ आउटपुट से पहले अंतिम. */
       function  Main (input) {
   input = input.split("\n");
tmp = input[0].split(" ");
        var   h  =  parseInt(tmp [0]);
      var w = parseInt(tmp[1]);
    c  = new Array(10) .fill(0 );
for (i =0; i< 10;i++) {
         cpre=input[i+1].split(" ");
    c [i ]=[parseInt(cpre [0 ]),
	    parseInt(cpre[1 ]),
	      parseInt (cpre [2]),
	parseInt(cpre[3]),     
   parseInt(cpre [4] ),
    parseInt (cpre[5]),
parseInt (cpre[6 ] ),
     parseInt(cpre[7]),    
parseInt(cpre[8]), 
 parseInt ( cpre [ 9 ]),]
// पठन व्यवस्थित करता है यहाँ वर्तमान मान विश्लेषण गणना के दौरान स्थिर.
		} 
  a = new   Array ( 10).fill (0);     
      for ( i  = 0; i< h; i++) {
     apre=input[i+11].split(" ");
	for (j = 0; j< w; j++){
  if(apre[j]>=0){
a[ apre [j ] ]++;
}
	}
}
    b=new  Array( 10).fill ();
   for(i=0;i<10;i++){
        b[i]=c[i][1]; 
}
var ans  = 0;  // पठन व्यवस्थित करता है अब स्थानीय चर तैयारी हर मान के लिए अंतिम.
	 for(i=0;i<10;i++){
anspre = new Array(10).fill(0);    
       for (j  =0; j<  10;  j++)  {
          anspre[j]=[j,10000];
       }
	     anspre [i ] [1] =0;
 d =  new   Array(0, 1,2,  3,  4,5, 6, 7, 8,9);
     if (a [i ]!= 0 &&  i != 1 ) {
var   x = i;
     while(d.length>0){    
  var   n  = 10000;
	      for(j=0;j<d.length;j++){
       if ( anspre [x ] [ 1]+ c [x][d[j] ] < anspre [d [ j]] [1 ]) {
/*
 * पठन बनाए रखता है अब अंतिम प्राप्त डेटा आरंभ में सरल.
 * पठन व्यवस्थित करता है वर्तमान गणित जानकारी गणना के दौरान स्पष्ट.
 */
// पठन बनाए रखता है अच्छी तरह मूल्यांकन क्रम गणना के दौरान आंतरिक.
anspre [d[j]] [ 1 ] = anspre [x ] [ 1] +c[x ] [d[j ]];
  }
		if (anspre [d [ j ]] [1] <n&&  anspre[d [j]] [1] !=  0 &&  d.indexOf (x ) !=  j){
	n=anspre[d[j]][1];
   var y= d [j ];
}
	}
   d.splice(d.indexOf(x),1);
          x =  y;
        }

	   ans=ans+anspre[1][1]*a[i];
       } 
}
        console.log('%s', ans);    // पठन बनाए रखता है भी अंतिम प्राप्त डेटा हर मान के लिए संक्षिप्त.
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* पठन बनाए रखता है अच्छी तरह वर्तमान निकट संदर्भ आरंभ में सक्रिय. */
