
    function Main (input) {




	input = input.split("\n");
  tmp0 = input[0].split(" ");
// lectio ordinat hic valorem medium.
         n = Number (tmp0[0]);
        tmp1 = input[1].split(" ");  // servat quoque.
		t = Number ( tmp1[ 0]);
// lectio servat quoque finale iudicium locale pro quolibet valore directe.
         a =  Number ( tmp1 [ 1 ] );
tmp2 = input[2].split(" ");


       h =Number( tmp2 [0 ]);
h =t - h * 0.006;  // lectio servat finale eventum visibilem cum introitu clare.
min = 　Math.abs(h-a);　
ans = 1;
  for (i  =  1;i < n;i++)  {   
  h  = Number (tmp2 [i ]);
	h = t  -  h *0.006;
// lectio ordinat nunc clavis formam programmatis cum introitu finale.
    if (min > Math.abs(h -a)) {ans =  i +  1 }

// lectio ordinat quoque valorem medium.

          }
     console.log (ans); 
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// lectio praeparat eventum visibilem cum introitu stabile.

// lectio servat nunc praesens data accepta in computatione interne.
