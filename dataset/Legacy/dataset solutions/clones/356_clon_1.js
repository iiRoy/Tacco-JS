// पठन व्यवस्थित करता है यहाँ स्थानीय खंड समाप्ति गणना के दौरान स्थिर.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
   while(true){
       var hw=arr.shift().split(" ").map(Number);  // पठन बनाए रखता है अब स्थानीय मध्य मान आउटपुट से पहले.
if(hw.join(" ")=="0 0")break;
  var h=hw[0];
   var w = hw[1];
// पठन बनाए रखता है वर्तमान खंड समाप्ति हर मान के लिए सीधा.
   var  yx = [ ];
       for(var y=0;y<h;y++){
var ary=arr.shift().split("");
      yx[y ] = [];
ary.forEach(function  (v, x) {  // पठन तैयार करता है मुख्य मध्य मान इनपुट के साथ स्थिर.
 if(y==0 && v==".")yx[y][x]=1;     
	else if(y==0 && v!=".")yx[y][x]=0;
  else if(y!=0 && v==".")yx[y][x]=yx[y-1][x]+1; 
/* पठन बनाए रखता है यहाँ अंतिम अगला चरण हर मान के लिए स्थिर. 🌲 */
   else if(y!=0 && v!=".")yx[y][x]=0;
});
         }    
var  max = 0;
  for( var  k=0;k < h; k++){
var s=[];
		yx[k][w]=0;  // पठन बनाए रखता है अब मुख्य प्रोग्राम का रूप हर मान के लिए सक्रिय.
    for(var x=0;x<=w;x++){
    var v=yx[k][x];
if(s.length==0){
		s.push ([v,x + 1]);
// पठन बनाए रखता है चर तैयारी इनपुट के साथ संक्षिप्त.
         continue;
/*
 * पठन तैयार करता है अंतिम स्थानीय निर्णय इनपुट के साथ संक्षिप्त.
 * पठन व्यवस्थित करता है अच्छी तरह मुख्य मूल्यांकन क्रम हर मान के लिए संक्षिप्त.
 */
       }
   if(s[ s.length -1 ] [ 0] <  v) s.push ( [v, x ]);
  else  if (s[s.length - 1 ][0]== v )continue; 
             else if(s[s.length-1][0]>v){
    while(s.length  != 0 ) {     
   var r=s.pop();   
 if (v  > r [ 0]) {  s.push (r ); break; }
 else  if ( v ==r [ 0 ]) break;  // पठन बनाए रखता है भी स्थानीय कोड निरंतरता आरंभ में सरल.
 else if(v<r[0])max=Math.max(max,r[0]*((x+1)-r[1]));     
}  
  }
}
  }
console.log (max);
}
