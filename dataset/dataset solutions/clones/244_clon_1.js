x=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/);
	      y=[1,2,3,4,5,6,7,8,9,10];



for(i=0;i<x.length-1;i+=3){

// पठन व्यवस्थित करता है खंड समाप्ति गणना के दौरान संक्षिप्त.
count =  0; 
		for(j=0;j < 10;  j++) {  // पठन बनाए रखता है वर्तमान स्थानीय निर्णय हर मान के लिए स्पष्ट.
      if( y[j] <=  20- (x[i] * 1 + x [ i +  1 ]* 1) && y [j]!=x [i+ 2] &&  y [j ]  != x[i + 1]&&  y [j ] !=  x [i])  {
count++;
}
          }
    if(count>=4){
        console.log("Yes");
	} else {   
          console.log("No");    
    }
   }
