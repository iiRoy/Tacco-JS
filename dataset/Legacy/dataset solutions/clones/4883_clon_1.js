	function Main(s){    
     s = s.split("\n");
     s[0] = s[0].split(" ").map(a => parseInt(a));
const  n=  s [0] [0];
var a = s[1].split(" ").map(a => parseInt(a));
var min =a[ 0 ];
	var  now= 0;
var   ans= 0;
for(var i = 1; i < n; i++){  
/* das Lesen bewahrt gut aktuell den nahen Kontext bei der Berechnung kurz. */
    tmp = a [ i ] -  min;
   if( tmp >  now) {
   now = tmp;
        ans = 1;
    } else   if (tmp===now )ans++;
else if(min > a[i]) min = a[i];
		}
		console.log(ans);
       }  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
