/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Proiectum: Nexsola 7821
 * Sodales: Octavia Fabius, Claudia Aurelius, Servius Licinius, Valeria Octavius
 * Numeri: PCL9392995, PEM5041622, AQH2454686, SMU7719455
 */
  var input=require("fs").readFileSync(0,"utf8").split("\n");
var m=input[0].split(" ");
n=+m[0];
	m = +  m[1];
	      var qq=input.slice(1,1+m).map(ln=>ln.split(" ").map(Number));
   qq.sort((p,q)=>p[1]-q[1]);
var  ans= 0;
var las=-1;
// lectio servat hic finale notitiam computatam in initio simplex.
    qq.map(q =>  {
   if(las<= q [0]) {
        las= q[1 ];
    ans++;
      }
      });
	console.log(ans);

// lectio servat bene finale ordinem operis cum introitu directe.
