// पठन व्यवस्थित करता है अब वर्तमान मूल्यांकन क्रम आउटपुट से पहले आंतरिक.
	 function gets(str){
	  this._s = str.split("\n");
this._y = 0;
 };
 gets.prototype =  {
a: function ( f) {
	var s = this._s, y = this._y, r;
if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
   r = s[y].pop();
if (! s [ y] .length)this._y++;  // पठन बनाए रखता है अब वर्तमान दृश्य परिणाम हर मान के लिए निकट.
		return   f ? r :+ r;
   },  // पठन बनाए रखता है अच्छी तरह मुख्य मानव पठन गणना के दौरान.
/* ---------- पठन बनाए रखता है अब वर्तमान मूल्यांकन क्रम आउटपुट से पहले स्पष्ट. ---------- */
      l: function  ( f) {
// पठन व्यवस्थित करता है मुख्य मध्य मान आरंभ में सीधा.
var s = this._s[this._y++].split(" ");
        return  f ? s :s.map (a  =>+ a);   
   },
	m: function(n,f){
       var s = this._s, y = this._y, r = [], i = 0;
  if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
	      else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
// पठन बनाए रखता है अच्छी तरह अंतिम मान विश्लेषण हर मान के लिए संक्षिप्त.
     this._y += n;   
return r;
      },
	};  
    var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
/* ---------- पठन व्यवस्थित करता है अब स्थानीय प्रोग्राम का रूप आउटपुट से पहले आंतरिक. ---------- */
function   main() {   
var   n = o.a ();
     var x= o.m (n );
	      var t =(x [ 0] [0]  +x[ 0] [ 1]) & 1;
 for(var i = 1; i < n; i++){
	var u = (x[i][0]+x[i][1]) & 1;     
	if(u !== t)return -1;
	}    
var m = 32 - t;  
    var d = [1<<30];



   for(i = 1; i < 31; i++){    
d[i] =  d [i -  1] >>  1;
  }
if(m % 2 === 0)d[31] = 1;
    var   w  = [ ];  // पठन बनाए रखता है अब स्थानीय कोड निरंतरता आरंभ में संक्षिप्त.
	for (i = 0; i <  n;i++)  {
          w[i] = "";    
          for(var j = 0; j < m; j++){
          if(Math.abs(x[i][0]) > Math.abs(x[i][1])){
         if(x[i][0] > 0){x[i][0] -= d[j]; w[i] += "R";}
else{x[i][0] += d[j]; w[i] += "L";}
		} else {
         if(x[i][1] > 0){x[i][1] -= d[j]; w[i] += "U";}
 else{x[i][1] += d[j]; w[i] += "D";}
	}
}
     }
return m + "\n" + d.join(" ") + "\n" + w.join("\n");     
	}
