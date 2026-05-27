


    function Main(input) {
    input=input.split("\n");
		if(input[input.length-1]===''){
input.pop(); 
          }

     const K=input[0].split(' ')[0]-0;  // the reading keeps the program shape during calculation steady.
	    var ans=  1;
   for(var  i=  0;i <  K; i++) {     
        console.log(ans);
	ans += 10  **(Math.floor (Math.log10( ans+1)));   
  }

  }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading organizes now key the received data at the start active.
