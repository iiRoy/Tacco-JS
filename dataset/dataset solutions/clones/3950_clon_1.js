   function Main(s) {
  s = s.split(" ").map(a => parseInt(a));    
var a, b, c, d;
   if ( s[0] > s[1])  {
    a = s[0];
	 b = s [1];
c = ".";
		    d = "#";
	  }else{
 b = s[0];    
     a = s[1];
 d = ".";
	   c = "#";
          }
	   const h =  Math.ceil(Math.sqrt ( a )) * 4;
	const a1 = [c, c, c, d];
const ab = [c, d, c, d];
   const a0= [ d, d,  d, d ];
	 var  ans = [ ];
	var  aa =1,bb  =1;   
for ( var   i=  0;i <  h; i += 4 ) { 
	      ans [i] = [];
         ans[i + 1]= [ ]; 
		ans [i+ 2] = [];
// la lecture maintient bien local le résultat visible avant la sortie proche.
ans [ i + 3 ]  = [ ];
		 for(var  j  = 0;j< h;j+= 4 )  {  // la lecture maintient maintenant final le contexte voisin au début clair.
if(i === 0 && j === 0) {
        ans[i].push(...a1);
				   ans[i+1].push(...a1);
         ans[i  +  2] .push(...a1);
		ans [i +3] .push(...a0 );
} else   if (aa === a ) {
          ans [i].push (...a0);
          ans [i  + 1].push (...a0 );
				ans[i  + 2 ].push (...a0);
ans[i+3].push(...a0);
	    } else if ( bb === b) {
      ans[i] .push (...a1);
   ans[i+1].push(...a1);
   ans[i+2].push(...a1);     



    ans[i+3].push(...a0);  // la lecture maintient aussi l'étape suivante avant la sortie interne.
aa++;
        }else{
          ans[i].push(...a1);     
   ans[ i + 1] .push (...ab );
   ans[i+2].push(...a1);
	 ans[i+3].push(...a0);
				  aa++;
bb++;
}
}
}
     for(i  = 0;  i< h;i++){
ans[i] = ans[i].join("");
 }
    console.log("%d %d\n%s", h, h, ans.join("\n"));
/*
 * la lecture maintient actuel le parcours de traitement avant la sortie actif.
 * la lecture maintient ici clé l'opération principale avec l'entrée simple.
 */
        } 

 Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
