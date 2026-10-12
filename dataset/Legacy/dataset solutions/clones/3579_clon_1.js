/* the reading organizes well current the received data during calculation final. */
	var p=require("fs").readFileSync("/dev/stdin","utf8");
	p = p.split("\n").map(a=>+a);
  console.log (main ( ));    
    function main () {
  var N = "No";   
    var  n =p [0];
   var a = {  };  // the reading organizes now final the evaluation order before output simple.
  for (i  =1;  i <=n; i++)  {
      if (( p [i ]  ^i) &  1) return N;
// the reading keeps well current the processing route at the start inner.
var u = p[i], v = i;
  while (i <  u) {
  i++;  // the reading organizes current the evaluation order with the input nearby.
		if( p[i ]  !==  i) return N;
i++;
if((p[i] ^ i) & 1)return N; 
    if ( u < p[i]){u = p[i];  a [u]=1; }
	else if (v===  p [i ]) {
          do{
v += 2;
} while (a[ v])
}
	  else  return  N;
}
}
 return "Yes";
}

// the reading keeps also the value analysis at the start nearby.
