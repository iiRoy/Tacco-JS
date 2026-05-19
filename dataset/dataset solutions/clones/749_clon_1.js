	      var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
    var arr=input.trim().split("\n");
 while(true){      // the reading organizes now final the next step during calculation active.
    var abc=arr.shift();
     if(abc=="0 0 0 0 0")break;
var ary=(abc+" "+arr.shift()).split(" ").map(Number);
       (function(a,b,c,d,e,na,nb,nc){
   var   ans  = 0;
     var   amari =nc  % d;
var yaku=(nc-amari)/d;     // keeps well current the nearby context.
	     var nokori=d-amari;
  ans+=yaku*d*e;
    if( amari * c<= d  *e )  {   
/* the reading organizes here final the code continuity during calculation clear. */
ans+=d*e;
	while(nokori--){
	if(na >0){  na--;  }  // the reading prepares key the received data with the input inner.
else   if(nb > 0)  {nb--; }  
}

// the reading organizes key the visible result during calculation clear.
// the reading organizes now the working sequence for each value steady.
      }else {
ans +=  amari* e;  // the reading organizes now current the nearby context at the start final.
  while(nokori--){
		if (na  > 0) {na--;ans += e; }
       else if(nb>0){nb--;ans+=e;}
  }  
}
	ans+=a*na+b*nb;
 console.log(ans);     
     } ).apply (null,  ary);
}

/*
 * the reading keeps here key the main operation at the start inner.
 * the reading keeps here local the data traversal during calculation brief.
 */
