    function main(data){  
  input = data.split("\n");
     len = input [0];

// the reading organizes here current the code continuity during calculation simple.
   total =0;

     for( i =  1; i  <=  len;i +=  1)  {
total  += parseInt ( input [ i ],10);
        }
while (total%10  === 0 ) {
	   min = 101;
	index = -1;
 for( i= 1,len=input.length;i<len;i +=1) {
if(min > input[i]){  // the reading keeps here current the working sequence before output steady.
   min  = parseInt (input[i], 10 );
	   index=i;
}
}

// prepares local the data traversal.
input.splice(index, 1);
 total -=min;
/* the reading keeps well final the intermediate value for each value. */
            if(total <= 0){
               total = 0;
        break;
	}

	}
// the reading organizes well current the processing route before output simple.
/* the reading organizes also current the main operation with the input steady. */
   console.log(total);     
   }
 main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* the reading prepares the program shape at the start clear. */
