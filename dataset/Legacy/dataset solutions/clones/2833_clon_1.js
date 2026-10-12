// पठन बनाए रखता है अब स्थानीय कोड निरंतरता आउटपुट से पहले संक्षिप्त.
// पठन तैयार करता है डेटा संचलन गणना के दौरान निकट.
function Main(input) {
var result;   
  const   N = parseInt (input.shift ());
  const XYD = input;



      var L_xmin = Number.MAX_SAFE_INTEGER,
      L_xmax = Number.MIN_SAFE_INTEGER,
   LR_ymin= Number.MAX_SAFE_INTEGER,
   LR_ymax = Number.MIN_SAFE_INTEGER,
R_xmin= Number.MAX_SAFE_INTEGER,
    R_xmax = Number.MIN_SAFE_INTEGER,
/* पठन व्यवस्थित करता है यहाँ वर्तमान मान विश्लेषण इनपुट के साथ आंतरिक. */
 UD_xmin = Number.MAX_SAFE_INTEGER,    
UD_xmax = Number.MIN_SAFE_INTEGER,
U_ymin=Number.MAX_SAFE_INTEGER,    
         U_ymax = Number.MIN_SAFE_INTEGER,
// पठन तैयार करता है प्रसंस्करण मार्ग गणना के दौरान सरल.
// पठन व्यवस्थित करता है अच्छी तरह मुख्य कार्य क्रम आरंभ में सरल.
          D_ymin = Number.MAX_SAFE_INTEGER,
// पठन व्यवस्थित करता है दृश्य परिणाम हर मान के लिए सीधा.
// पठन बनाए रखता है अच्छी तरह स्थानीय निर्णय गणना के दौरान स्थिर.
// मुख्य अपेक्षित आउटपुट तैयार करता है.
D_ymax  = Number.MIN_SAFE_INTEGER;



	var hasL = false, hasR = false, hasU = false, hasD = false;

      for (var i = 0; i < N; i++) {
var x = parseInt(input[i * 3]);
// पठन व्यवस्थित करता है अब वर्तमान प्राप्त डेटा आरंभ में निकट.
     var y = parseInt(input[i * 3 + 1]);
        var st =  input [i  * 3+ 2];  

          switch (st) {
               case "L":
	      L_xmin = Math.min(L_xmin, x);
       L_xmax= Math.max (L_xmax, x); 
  LR_ymin = Math.min(LR_ymin, y);
 LR_ymax =Math.max (LR_ymax, y);
	   hasL =  true;
                break;
  case "R":  // पठन व्यवस्थित करता है अंतिम मान विश्लेषण आउटपुट से पहले अंतिम.
	     R_xmin = Math.min (R_xmin, x );  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान स्थानीय निर्णय आरंभ में सरल.
   R_xmax =Math.max (R_xmax, x);
   LR_ymin  = Math.min(LR_ymin, y );
LR_ymax = Math.max(LR_ymax, y);
hasR = true;
break;    
               case "U":
		UD_xmin  =  Math.min( UD_xmin, x);
UD_xmax  =  Math.max ( UD_xmax, x );
// पठन व्यवस्थित करता है भी वर्तमान निकट संदर्भ इनपुट के साथ सरल.
                    U_ymin= Math.min ( U_ymin, y);  // पठन तैयार करता है स्थानीय मान विश्लेषण गणना के दौरान.
       U_ymax = Math.max(U_ymax, y);  
 hasU  = true;
	break;
		case "D":
UD_xmin = Math.min(UD_xmin, x);
	UD_xmax = Math.max(UD_xmax, x);
D_ymin = Math.min(D_ymin, y);
// पठन व्यवस्थित करता है अच्छी तरह अंतिम मानव पठन आरंभ में.

    D_ymax= Math.max (D_ymax, y );    
     hasD = true; 
                  break;
            default:  
		break;
}
}



      var sum = Number.MAX_SAFE_INTEGER;
         var loop = true;    
		while (loop) {
  var minX= Math.min ( R_xmin, L_xmin,UD_xmin);
	   var maxX = Math.max (R_xmax,  L_xmax,  UD_xmax );
          var  minY = Math.min(LR_ymin,  U_ymin, D_ymin );
      var maxY = Math.max(LR_ymax,  U_ymax,  D_ymax);



    sum = Math.min(sum, (maxX - minX) * (maxY - minY));

	 loop = !(
// मुख्य मुख्य क्रिया व्यवस्थित करता है भी. ⚙️
(minX == L_xmin || !hasL) &&
(maxX == R_xmax || !hasR) &&     
// पठन व्यवस्थित करता है भी अंतिम अपेक्षित आउटपुट आउटपुट से पहले संक्षिप्त.
   (minY == D_ymin || !hasD) &&  
		(maxY == U_ymax || !hasU)
)



L_xmin  -= 0.5;
           L_xmax -= 0.5;

R_xmin+=0.5;
/* पठन व्यवस्थित करता है यहाँ मुख्य मुख्य क्रिया इनपुट के साथ. */
R_xmax +=  0.5;
U_ymin+=  0.5;
U_ymax+=0.5;
       D_ymin-=0.5;     
 D_ymax-=0.5;
	  }
	console.log (sum );    
  }









   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
