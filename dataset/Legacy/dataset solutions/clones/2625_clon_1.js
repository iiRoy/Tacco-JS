 "use strict";



   const main =arg => {
     arg = arg.trim().split("\n");
      const A =parseInt(arg [0 ]);
    const S = arg[1];



          console.log(A >= 3200 ? S : "red");  
   }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
