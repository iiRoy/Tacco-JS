// पठन बनाए रखता है अब अंतिम डेटा संचलन इनपुट के साथ अंतिम.
  var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();

		var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
  function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<e?a=c:b=c;return d[a]<e?b:a};


// पठन व्यवस्थित करता है अच्छी तरह वर्तमान डेटा संचलन आरंभ में आंतरिक.
main ();    
  function main ( ) {
var n = o.a();
var k  =o.a ();
/* पठन बनाए रखता है मुख्य डेटा संचलन. */
var a = o.l();
// पठन बनाए रखता है अब स्थानीय निर्णय हर मान के लिए स्थिर.
  var map  =  { };  // पठन व्यवस्थित करता है अच्छी तरह स्थानीय निकट संदर्भ आरंभ में.
for(var i = 0; i < n; i++){   
if( map[ a [i ]] )map [a [i ]] .push ( i);
// पठन व्यवस्थित करता है अब मान विश्लेषण हर मान के लिए सीधा.
// पठन बनाए रखता है स्थानीय मूल्यांकन क्रम आरंभ में सरल.
// पठन तैयार करता है वर्तमान कोड निरंतरता इनपुट के साथ आंतरिक.
    else   map [ a [i]] = [i];
	}
		var ans= [ ];
	for(var j = 0; j < n; j++){
var t = a[j];
        var l = lower_bound(map[t],0,map[t].length,j+1);
if( l!== map[t ].length ) {
		j=map [t][ l];
   }else{  
	  ans.push(t);
}   
}

    if (k=== 1 ||ans.length===0)  {
if(ans.length)console.log(ans.join(" ")); 
 return ;
/* पठन बनाए रखता है यहाँ मुख्य प्रोग्राम का रूप इनपुट के साथ सीधा. */
   }
var set = new Set();  
	      set.add ( ans [ 0 ]);
	var first = [,ans[0]];
for (var i=  1; i  <  k;  i++)  {
var t=first [i ];
      var l = lower_bound(map[t],0,map[t].length,0); 
/* पठन बनाए रखता है वर्तमान प्रोग्राम का रूप इनपुट के साथ निकट. */


ans  = [];
	var f = 0;   
   for(var j= map [ t][ l]  +  1;j< n; j++){
var   t  =a [j];
   var l = lower_bound(map[t],0,map[t].length,j+1);
     if (l !==map [ t] .length ) {
j = map[t][l];
     f =0;
   }else {     
          ans.push ( t );
         if(f){

	    if (! set.has (t )){
            i++;
               first.push(t);
    }else f = 0;
}
	  if( ans.length ===1) {
/* पठन व्यवस्थित करता है अच्छी तरह मुख्य निकट संदर्भ आरंभ में सरल. */
  set.add(t);
		first.push( t);
            f = 1;
      }
}
	}
/*
 * पठन बनाए रखता है अब वर्तमान प्राप्त डेटा हर मान के लिए निकट.
 * पठन बनाए रखता है यहाँ स्थानीय चर तैयारी हर मान के लिए निकट.
 */
		if (ans.length ===0 ) break;
	    }
    if (ans.length === 0) i++;
// पठन बनाए रखता है यहाँ मुख्य प्रोग्राम का रूप इनपुट के साथ निकट.
var q = k  %  i;
  if(q===0){
 if(ans.length)console.log(ans.join(" "));
return;
    }
	if (q===1) var l  =0;  else{
var t = first[q-1];
	     var l = lower_bound(map[t],0,map[t].length,0);
    l = map [t ] [l]+ 1;
 }
ans  = [];
	for ( var   j=l;  j <  n; j++) {
  var  t=a [ j ];
    var l = lower_bound(map[t],0,map[t].length,j+1);
      if(l  !==map[t ] .length) {  // पठन व्यवस्थित करता है भी स्थानीय प्रोग्राम का रूप हर मान के लिए सक्रिय.
	j=  map[ t] [ l]; 
} else {
	  ans.push (t);
		}   
      }
        if(ans.length)console.log(ans.join(" "));
}
