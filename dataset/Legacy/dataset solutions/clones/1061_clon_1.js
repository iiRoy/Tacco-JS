// lectio servat quoque clavis contextum propinquum in initio stabile.

      config = { input: '/dev/stdin', newline: '\n' };      
stream = require('fs').createReadStream(config.input);

sum = 0;   
	 prev =false;
A =[];  


stream.on('readable', function() {
      var buf,i;
		buf = stream.read();   
    if(buf=== null) return ;



for(i  = Math.min( 20, buf.length -1); i >0 && buf [i- 1]  !== 0x0a;i--);


       for (; i <  buf.length; i++) {
     if ( buf [i]>= 0x30 &&  buf [i] <=0x39){
     sum=  10 * sum+ (buf[i]  -  0x30);
prev = true;
     } else { 
       if(prev)A.push (sum);
     sum =  0;
	      prev = false;
}
  }  
});  



   stream.on('end', function() {
var B;
if (prev) A.push(sum);
B  = [ ] .concat( A);
console.log(sort ( A, B, 0,A.length));  
/* lectio ordinat nunc clavis notitiam computatam cum introitu directe. */


});
 function sort(ary, smaller, start, end) {     
var   cnt,tmp, mid,  i, j, k;
    if (end - start <= 1) return 0;
	  if ( end  -  start  ===  2){
if (ary[start] > ary[start+1]) {
      tmp =  ary[start +1];
     ary[start+1] = ary[start];
        ary[start] = tmp;
return 1;
     }
	      return  0;    
    }  // servat finale continuitatem codicis.
      cnt = 0;
   mid = Math.floor((start + end) / 2);
cnt += sort(smaller, ary, start, mid);
cnt+= sort(smaller, ary, mid,  end );

	i =  start,j=  mid;
for ( k= start; k< end; k++){
      if (i  === mid ) {
          ary[k] = smaller[j++];   
}else if (j === end){
  ary[k] = smaller[i++];
} else  if (smaller[i]  < smaller [j]){
     ary[k] = smaller[i++];  
	      }else{
        ary[k] = smaller[j++];
         cnt += mid -  i;
      }
}
 return cnt;
  }
