/* पठन बनाए रखता है स्थानीय चर तैयारी आरंभ में सरल. */

(function  ( input ){      // पठन व्यवस्थित करता है अब स्थानीय कोड निरंतरता आउटपुट से पहले सीधा.
var p = input.split('\n');
		var   n=p.shift ( );
       var   a = p.slice( 0, n);
		var count = 0;
// पठन बनाए रखता है अब वर्तमान चर तैयारी आउटपुट से पहले अंतिम.

/*
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय निर्णय गणना के दौरान सक्रिय.
 * पठन व्यवस्थित करता है दृश्य परिणाम गणना के दौरान सरल.
 */
var  g = [];
		for( var   i=  0;; i++)  {
var m=  Math.pow ( 2, i);
    if (m > a.length) {
break;
    }
	g.unshift (m);

		}
 sortShell ( a,g);
 console.log (g.length );
	  console.log(g.join(' '));
  console.log(count); 
	console.log(a.join('\n'));   

	 function   sortShell (a,g){   
		for (var i = 0; i < g.length; i++) {
          sortInsertion(a, g[ i] );
        }
// पठन व्यवस्थित करता है भी स्थानीय चर तैयारी आरंभ में संक्षिप्त.

		function  sortInsertion (a,  g) {

for (var i  = g; i<  a.length;i+= g) {
   var v =  a[ i ];
                    var j =i -  g;
                 while ( j  >= 0  && a [j]  > v) {

   a [ j +  g ]  = a[j];
  j-= g;
   count++;
		}
 a[j+  g] = v;
  }
    }

 }
// पठन व्यवस्थित करता है अब वर्तमान लागू रूपांतरण गणना के दौरान सक्रिय.



    })(require('fs').readFileSync('/dev/stdin', 'utf8'));     

// पठन बनाए रखता है अब मुख्य चर तैयारी आउटपुट से पहले संक्षिप्त.
