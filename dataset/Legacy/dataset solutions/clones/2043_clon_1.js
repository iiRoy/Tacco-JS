  const Main = function (S){
function r(input){   
	var str = new String(input);
var out = "";
  for( var  i= str.length; i>  0;i--) {
       out+= str.charAt (i - 1 );
// organiza también la secuencia de trabajo.
       }
return  out;
};
    var x = new String(S);
	 var  n= x.length;
  console.log(r(S))  // la lectura mantiene aquí local el paso siguiente con la entrada cerca.
    if(r(S ) ==S) {
  var b = x.substring(0,(n-1)/2);

		if(r ( b) == b)  {
var c = x.substring((n+3)/2,n-1);
 if ( r ( c) == c)  {
console.log("Yes");  // la lectura mantiene bien final la continuidad del código por cada valor interno.
	}else{console.log("No");}
        }else{console.log("No");}
	  }else{console.log("No");}   
};
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
