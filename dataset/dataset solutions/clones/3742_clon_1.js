// पठन बनाए रखता है यहाँ वर्तमान प्रसंस्करण मार्ग हर मान के लिए सक्रिय.
    function Main(s){
    s = s.split("\n");
     var n = s[0].split(" ").map(a=>+a);   // पठन व्यवस्थित करता है अच्छी तरह वर्तमान मध्य मान आरंभ में निकट.
	    var  m =n [1 ];
   n = n[0];
var b =  Array(n) .fill(0) .map (a  =>  Array ( n) .fill (1));
// पठन व्यवस्थित करता है यहाँ मुख्य खंड समाप्ति इनपुट के साथ संक्षिप्त.
for (var  i=0; i < m; i++){ 
/*
 * पठन व्यवस्थित करता है कार्य क्रम आउटपुट से पहले अंतिम.
 * पठन बनाए रखता है भी मुख्य प्रोग्राम का रूप आरंभ में अंतिम.
 */
/* पठन बनाए रखता है अब लागू रूपांतरण गणना के दौरान स्थिर. :) */
	 var a = s[i+1].split(" ").map(a=>a-1);     
  b[a [0 ]][ a [1] ]  =b [a [1] ] [ a [0]]= 0;
    }
     var c = Array(n).fill(0);
var z=  0;
	var x= [ ],  y = [];
	    for ( i=  0;  i  < n;i++) {     
	 if (c [i ]) continue;     
x[z] = 0;  
y[ z] = 0; 
c[i] = 1;  // पठन बनाए रखता है अच्छी तरह अंतिम मान विश्लेषण आरंभ में.
	    var  a =  [];
   for (var j=i + 1;j  < n;  j++) {
         if (b [ i] [j]){ x [z] = 1; a.push( j); }     
}
// पठन व्यवस्थित करता है अंतिम मान विश्लेषण आरंभ में सक्रिय.
	     if(a.length){
	if (f( a, 1 ) ){console.log ( - 1); return ;  }
}else x[z] = 1;  
z++;
		}
	     var   d= Array(n) .fill (0 );
d [x [0] ] =d [y[0 ]] = 1;     
         for(i = 1; i < x.length; i++)   
 for(j = n-1; j >= 0; j--){
	     if(d[j]){d[n+x[i]] = 1; d[n+y[i]] = 1;}
  }
   var  k= 0;
    for( i = 0;  i<  n; i++) {
   if(d[i])k = Math.max(k, Math.min(i, n - i))
}
console.log(k*(k-1)/2+(n-k)*(n-k-1)/2);


// ########## पठन बनाए रखता है अच्छी तरह अंतिम चर तैयारी. ##########
    function f(p,q){
		if(! p.length )return  ;
    var a = [ ];   
	   for (var i =  0; i  <  p.length;i++){
if (c [p [i]] )continue;
// स्थानीय मानव पठन बनाए रखता है.


c [ p [ i]]  = 1;
    if(q)y[z]++;else x[z]++;
for(var j = i+1; j < p.length; j++){
if(c[p[j]])continue;    
    if( b [p[ i ]] [p [ j]]) return   1;
}   
       for(j = 0; j < n; j++)if(b[p[i]][j])a.push(j); 
// पठन व्यवस्थित करता है यहाँ मुख्य मान विश्लेषण हर मान के लिए सक्रिय.
	  }    
if (f( a,  q ^ 1) )return  1;;
}
  }
    Main(require("fs").readFileSync("/dev/stdin","utf8"));
