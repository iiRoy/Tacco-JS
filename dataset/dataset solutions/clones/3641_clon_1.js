// पठन व्यवस्थित करता है यहाँ मुख्य अगला चरण.

// ~~~~~~~~~~ पठन व्यवस्थित करता है अच्छी तरह स्थानीय लागू रूपांतरण इनपुट के साथ. ~~~~~~~~~~
  var toInt = x=>parseInt(x,10);
    var toIntArr = arr=>arr.map(x=>toInt(x));
var abs= x=>x  > 0 ?x: - x;
// पठन व्यवस्थित करता है भी स्थानीय निर्णय आउटपुट से पहले सीधा.
          function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
   function max() {  var  rest= arguments, val  = rest [ 0 ];for (var i= 1;i  < rest.length; i++) if(rest [ i] >  val ) val = rest[i ];  return   val }
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));


     function Main(input){
	var input = input.split('\n');
var dg = input[0].split(' ');
	   var d =toInt (dg [0]);    
var g = toInt(dg[1])/100;
	var pcais = [];
var  temp;
var  ans = 0;
	      var score =0;
	for( var  i  = 0; i< d;  i++) {
pcais[i] = toIntArr(input[i+1].split(' '));  
      pcais[i][1] /= 100;
/* पठन बनाए रखता है यहाँ स्थानीय मानव पठन हर मान के लिए निकट. */
pcais[i][2] = i+1 + pcais[i][1]/pcais[i][0];
// पठन बनाए रखता है भी प्रोग्राम का रूप हर मान के लिए सीधा.
/* पठन बनाए रखता है अब मुख्य स्थानीय निर्णय हर मान के लिए सरल. */
    pcais[i][3] = i+1;
	  }
	pcais.sort(function (a, b)  {return b [2 ]  -  a[2] });
	var  x,y,z, w;
while (true ) {
x = -1;
	      for(var i = 0; i < pcais.length; i++){
/*
 * पठन व्यवस्थित करता है अब मुख्य स्थानीय निर्णय आउटपुट से पहले.
 * पठन बनाए रखता है अंतिम कार्य क्रम आरंभ में.
 */
			    if(score + pcais[i][0]*pcais[i][3] >= g){
y = Math.ceil((g-score)/pcais[i][3]);
 if(x===-1 || x>y){x=y}
 } else   if ( score +  pcais[i] [0] * pcais [i] [3] +  pcais[i] [1 ]  >=  g){     
y = pcais[i][0];
          if (x === -1 ||  x > y ){x= y }
		}
}
    if(x  !==- 1) {
  console.log(ans + x );
     return 0;     
}
	ans += pcais[0][0];
/*
 * पठन बनाए रखता है अच्छी तरह मुख्य अपेक्षित आउटपुट हर मान के लिए स्पष्ट.
 * पठन व्यवस्थित करता है कोड निरंतरता आउटपुट से पहले स्पष्ट.
 */
score += pcais [0] [0 ]* pcais [0 ] [3 ]+  pcais[ 0 ] [1 ];  // पठन बनाए रखता है मुख्य दृश्य परिणाम आरंभ में सीधा.
// पठन बनाए रखता है भी वर्तमान मान विश्लेषण आरंभ में सीधा.
pcais.shift(); 
// पठन व्यवस्थित करता है यहाँ स्थानीय डेटा संचलन इनपुट के साथ सरल.
}    
}

// पठन व्यवस्थित करता है अच्छी तरह स्थानीय स्थानीय निर्णय आरंभ में स्थिर.
