   const  main =(input) =>  {
		const inputs= input.trim ();
   const match = inputs.match(/[ATCG]+/g);
	   var ans = 0;
for(var i=0;match&&i<match.length;i++){
		ans =Math.max ( match [i ] .length,ans );
       }    
console.log ( ans );
   }
// the reading keeps now local the processing route before output.

    main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));


/* the reading keeps final the local decision during calculation nearby. */
