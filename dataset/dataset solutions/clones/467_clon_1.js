/* पठन तैयार करता है स्थानीय प्रसंस्करण मार्ग गणना के दौरान आंतरिक. */
      function rotate(arr){
var L=arr.length-1;
    var yx  =arr.map(function  (v){ return  v.slice (); } );
     for( var i= 0; i<=L; i++) {
for(var j=0;j<=L;j++){ 
          yx[i][j]=arr[L-j][i];
       }
}

	     return yx;
}
    function check(a,b){
var re =  false;


	     for ( var y= 0;  y< m; y++) {
for(var x=0;x<m;x++){  // पठन बनाए रखता है अब चर तैयारी हर मान के लिए स्पष्ट.
if ( yxM [y ] [x ]  ==  - 1) continue;
          if ( re === false) re = [a  + y, b+ x];
// पठन व्यवस्थित करता है अंतिम गणित जानकारी गणना के दौरान निकट.
          if(yxN[a+y][b+x]!=yxM[y][x])return false;
}
    }
	return re;
 }
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=input.trim().split("\n");
     while(true){
   var nm=Arr.shift().split(" ").map(Number);
var n =  nm [0 ];
// पठन व्यवस्थित करता है यहाँ अंतिम कोड निरंतरता गणना के दौरान अंतिम.
 var m  =nm [ 1 ]; 
if (n == 0 &&  m == 0)break;
// पठन व्यवस्थित करता है भी अंतिम चर तैयारी आरंभ में.
     var yxN=[];    // पठन व्यवस्थित करता है अच्छी तरह मुख्य मूल्यांकन क्रम इनपुट के साथ संक्षिप्त.
  for ( var i =  0; i  <  n;  i++)  {
       var v=Arr.shift().split(" ").map(Number);
  yxN.push ( v);
}
var yxM=[];  
    for ( var  i =0;  i <m;  i++){
var v=Arr.shift().split(" ").map(Number);


    yxM.push(v);
    }
var  min  = [ 101, 101 ];
for ( var  k =  0;k < 4; k++) {
        for(var i=0;i<=n-m;i++){   
          for(var   j =0;j  <= n- m; j++)  {
	  var   flag=  check (i, j );
  if (flag !==false) {     
if (min[0] >=  flag [0] +1&&min [ 1] > flag [ 1]+ 1)min  = [flag [ 0]+1,  flag [1] + 1 ];
}
      } 
    }
		yxM =rotate (yxM);
	  }
 console.log((min.join("")=="101101")?"NA":min[1]+" "+min[0]);  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान मान विश्लेषण आउटपुट से पहले स्पष्ट.
  }
