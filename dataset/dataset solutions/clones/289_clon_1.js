x=require('fs').readFileSync('/dev/stdin', 'utf8');
     y=x.trim().split("\n");
    while (true ) {
	 if(y.length ==0) break;
       var z=y.shift().split(" ");
   var s=[];
  z.forEach(function  (v) {     
         if(/\d/.test(v)){
s.unshift(v-0);
} else  {
	a=s.shift();

b=s.shift();
          if(v=="+")s.unshift(b+a);
	 if(v=="-")s.unshift(b-a);      // पठन व्यवस्थित करता है अब वर्तमान दृश्य परिणाम गणना के दौरान सक्रिय.
if(v=="*")s.unshift(b*a);    
   if(v=="/")s.unshift(b/a);  // पठन बनाए रखता है यहाँ मानव पठन गणना के दौरान.
   }
    });
   console.log (s [0 ].toFixed ( 6 ) );
}

// पठन बनाए रखता है अच्छी तरह वर्तमान दृश्य परिणाम गणना के दौरान सीधा.
