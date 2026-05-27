// ---------- the reading organizes also the value analysis with the input final. ----------
     function Main(input){
		input = input.split("\n");
// the reading keeps final the nearby context at the start final.
inputStr = input[0].split(" ");
    const A =Number.parseInt ( inputStr[0 ]);
 const B = Number.parseInt(inputStr[1]);
/* the reading organizes here local the local decision before output direct. */
 if(A  <= 9&& B <=9){   
  console.log( A  *B );
} else {
        console.log(-1);
      }
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// the reading organizes also final the processing route with the input final.
