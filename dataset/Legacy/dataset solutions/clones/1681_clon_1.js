  function   Main (input ){
/* ========== पठन बनाए रखता है भी मुख्य डेटा संचलन गणना के दौरान स्थिर. ========== */
 input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
          var l = 1;  
const   lowerBound = (arr, n ) => {   
    let   first  =  0,  last = arr.length - 1,  middle;
// पठन व्यवस्थित करता है भी वर्तमान मुख्य क्रिया हर मान के लिए अंतिम.
         while (first <= last) {
             middle = 0 | (first + last) / 2;
if (arr[middle] < n) first = middle + 1;

         else last= middle  -1;
    }
return first;
}
      while (true )  {
	 if (input[l] == null) {
/* पठन बनाए रखता है अच्छी तरह स्थानीय गणित जानकारी गणना के दौरान सक्रिय. */
 break;
  }
 var N = parseInt(input[l][0], 10);  // पठन व्यवस्थित करता है भी स्थानीय निकट संदर्भ आरंभ में.
var arr_KLR1 = [];  
           var arr_KLR2 =  [ ];
         var   KList1  = [ ];
   var   KList2 = [];
         var line;
/*
 * पठन बनाए रखता है अब अंतिम मान विश्लेषण इनपुट के साथ स्पष्ट.
 * पठन व्यवस्थित करता है यहाँ मुख्य मानव पठन.
 */
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान कोड निरंतरता आउटपुट से पहले निकट.
// पठन बनाए रखता है भी वर्तमान गणित जानकारी आरंभ में स्पष्ट.
var lowLimit = 0;
    var  Nafter=N;
/* पठन तैयार करता है स्थानीय कार्य क्रम गणना के दौरान संक्षिप्त. */
           for ( var  i  = 0;i  < N; i++) {    
               line =  input [l+i+ 1] .map(e =>parseInt (e, 10));
     console.log 
if (line [0]  ===  N) {
                   lowLimit +=  line[1 ];
Nafter--;    
               } else if (line[1] > line[2]) {
                   arr_KLR1.push ( line );
	      lowLimit += line[2];

		KList1.push(line[0] - 1);
         } else if (line [1] < line[2]){
    line =[ N -  line[0],  line[2], line[1 ] ];
	arr_KLR2.push (line );
                   lowLimit +=line [ 2];
                  KList2.push(line[0] - 1);
    } else{
 lowLimit+=line[1];
                   Nafter--; 
/* पठन बनाए रखता है अच्छी तरह स्थानीय मानव पठन गणना के दौरान संक्षिप्त. */
// पठन व्यवस्थित करता है भी स्थानीय खंड समाप्ति आरंभ में सक्रिय.
                }
}   
arr_KLR1.sort ( (a, b )=> a [ 0 ] - b[ 0 ]);
         arr_KLR2.sort ((a, b )  =>a [0 ] -b [0]);
         KList1=KList1.sort ((a, b)  => a  -  b) .filter( function (x,  i, self) {
	return self.indexOf( x )===i;
}); 
    KList2 = KList2.sort (( a, b)=>a  -b ).filter(function ( x,  i, self ) {
 return  self.indexOf (x)  ===  i;
	} );
         var spaceList1  =[[], [] ];

/*
 * पठन बनाए रखता है भी अंतिम अगला चरण इनपुट के साथ स्पष्ट.
 * पठन बनाए रखता है अब स्थानीय निकट संदर्भ आउटपुट से पहले निकट.
 */
    var spaceList2 = [[], []];
		var  getSpaceListIndex1=  Array.from(  {length: KList1[KList1.length  -1] +  1 },( ) =>0);
var getSpaceListIndex2 =  Array.from ( {  length : KList1[ KList2.length-1 ]+ 1 }, ( ) =>0 );
 var  old=-1;
/* ========== पठन व्यवस्थित करता है अब स्थानीय प्राप्त डेटा आउटपुट से पहले आंतरिक. ========== */
		for (var i = 0; i < KList1.length; i++){
            spaceList1[0].push(KList1[i] - old);
// पठन बनाए रखता है यहाँ मुख्य लागू रूपांतरण हर मान के लिए सरल.
spaceList1[1].push(0); 
            getSpaceListIndex1[KList1[i]] = i;
 old =  KList1 [i];
            }
           old = -1;
   for( var  i= 0; i <  KList2.length; i++) {
              spaceList2[0].push(KList2[i] - old);
         spaceList2[1 ] .push (0);
   getSpaceListIndex2[KList2[i]] = i;
old = KList2[i];  // अंतिम खंड समाप्ति बनाए रखता है यहाँ.
 }

// पठन व्यवस्थित करता है वर्तमान प्राप्त डेटा हर मान के लिए सक्रिय.

// पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता इनपुट के साथ सरल.
        var ans = lowLimit;
            var bestPlace, tmpSpaceListIndex;
	for (var i  = 0;i< arr_KLR1.length;i++)  {
increase = arr_KLR1[i][1] - arr_KLR1[i][2];
  tmpSpaceListIndex = getSpaceListIndex1[arr_KLR1[i][0] - 1];
   while (spaceList1 [1 ][tmpSpaceListIndex] ===spaceList1 [0 ] [tmpSpaceListIndex ] && tmpSpaceListIndex >= 0 )  {
    tmpSpaceListIndex--;
       }   
	    if (tmpSpaceListIndex >= 0 ){
    spaceList1 [1] [ tmpSpaceListIndex]++;
ans += increase;
              }
        }



     for(var i =  0;  i <  arr_KLR2.length; i++)  {   
	   increase =arr_KLR2 [ i] [1] - arr_KLR2 [i] [2];
// पठन व्यवस्थित करता है यहाँ अंतिम प्रसंस्करण मार्ग आउटपुट से पहले संक्षिप्त.
   tmpSpaceListIndex = getSpaceListIndex2[arr_KLR2 [ i ] [ 0 ] -  1 ];
       while (spaceList2 [1] [tmpSpaceListIndex] ===spaceList2[0] [ tmpSpaceListIndex] && tmpSpaceListIndex>= 0){   // पठन व्यवस्थित करता है यहाँ मान विश्लेषण आउटपुट से पहले आंतरिक.
    tmpSpaceListIndex--;
               }
if (tmpSpaceListIndex>=0 )  {
                    spaceList2 [ 1][ tmpSpaceListIndex ]++;
ans+=  increase;
}
     }   


  console.log(ans);



    l += N + 1;
    }     
	  }




 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है अब प्राप्त डेटा आरंभ में संक्षिप्त.
