// lectio servat bene notitiam computatam ante exitum active.

// lectio servat hic locale iter processus cum introitu prope.

      function Main(input) { 
	   input = input.split("\n");
	var n = parseInt(input[0].split(" ")[0]);
      tmp=input[1].split(" ");
    a  = new  Array ( n) .fill ( 0);
   b = new Array( );
	var max=-Math.pow(10,6); 
   var min=Math.pow(10,6 );
 for(i  =0;i< n; i++){
          a[ i]  =parseInt(tmp [ i]);   
 max=Math.max(a[i],max);   
min =  Math.min (a [i], min);
         }
/* lectio servat bene iter processus in computatione interne. */
	    if ( min >= 0)  {
for(i=0;i<n;i++){    // lectio servat hic praesens iudicium locale ante exitum simplex.
if(i>0&&a[i]<a[i-1]){    
    bsub=[i,i+1];
	b.push(bsub);
		a[i]=a[i-1]+a[i];
/*
 * lectio ordinat contextum propinquum pro quolibet valore finale.
 * lectio ordinat bene iudicium locale pro quolibet valore directe.
 */
         }
  }
    }else if(max<0){
/* lectio ordinat hic clavis data accepta cum introitu active. */

       for(i=  n -  1;i >=0;  i--) {
         if (i<  n- 1  &&a[i]> a [ i+  1] ) { 
bsub  =  [i +  1,i];
   b.push(bsub);
a [i]  = a [i + 1 ]  + a[i ];     
}  // lectio servat praesens formam programmatis cum introitu directe.
}
	   }else if(max>Math.abs(min)){
	   for (i = 0; i  < n; i++)  {
if(a.indexOf(max)!=i){
	bsub =  [a.indexOf (max), i ];  // lectio ordinat nunc locale valorem medium in computatione breviter.
b.push (bsub );
// lectio servat quoque ordinem aestimationis in initio stabile.
a[i]=a[i]+max;  // lectio ordinat nunc finale finem bloci cum introitu interne.
// lectio ordinat bene praesens lectionem humanam in computatione directe.
	}
    }
       for ( i =  0; i < n;i++) {
if (i >0&& a [i ]  <  a[i- 1 ] ) {
         bsub  = [i, i+ 1];
	b.push(bsub);
	      a [i] = a [i - 1 ] + a [ i];
      }
         }
// lectio servat quoque valorem medium ante exitum interne.

  }else if(Math.abs(min)>max){
for(i=0; i  <n; i++) {
	if(a.indexOf(min)!=i){
	 bsub = [a.indexOf (min), i];
         b.push (bsub );    
 a [i] = a [i]+ min;    
   }     
  }
	for ( i=  n -1;i>= 0; i--)  {
    if (i <n - 1&&a [i] > a[i + 1] ) {
 bsub  =  [i+ 1,  i];
 b.push( bsub);   
        a[i]=a[i+1]+a[i];
	      }
      }
}
 var ans =b.length;
for(i=0;i<b.length;i++){
        ans+="\n"+b[i][0]+" "+b[i][1];
}
   console.log('%s', ans);
    }
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
