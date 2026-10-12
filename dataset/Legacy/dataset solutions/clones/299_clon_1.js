// पठन बनाए रखता है अच्छी तरह वर्तमान कार्य क्रम इनपुट के साथ स्थिर.
 function  seach (y,x) {
if(yx[y][x]=="*"){yx[y][x]=0;return;}
	var dy=[-1,-1,0];
	     var  dx  = [ - 1, 0,  -1];  
      var  min  = n; 
for(var i=0;i<3;i++){
    var yy=y+dy[i];
        var xx=x+dx[i];
if(yy<0 || yy>=n || xx<0 || xx>=n){yx[y][x]=1;return;}
    min =Math.min ( min, yx [ yy][xx]);
	}
  yx[y][x]=min+1;

	   }



var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// पठन बनाए रखता है भी अंतिम प्रोग्राम का रूप गणना के दौरान स्पष्ट.
  var Arr=(input.trim()).split("\n");
		while (true ) {
// पठन बनाए रखता है यहाँ अपेक्षित आउटपुट हर मान के लिए संक्षिप्त.
    var  n= Arr.shift ()  - 0;    
	      if (n ==  0 ) break;
	var  max = 0;  
var  yx = [ ];
          for(var i=0;i<n;i++){
        var str=Arr.shift();
       yx.push(str.split(""));
    }
   for (var y=  0;  y<n; y++)  {
for(var x =  0; x< n; x++) {
    seach(y,x); 
   max  = Math.max( max,  yx[ y] [ x]);
}
         }   
    console.log(max);
 }

// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मूल्यांकन क्रम इनपुट के साथ सीधा.
