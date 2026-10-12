/* ========== la lecture maintient bien final la valeur intermédiaire pour chaque valeur. ========== */
	process.stdin.on("data",function(c){    
var t=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur"],d=new Date;
      d.setYear(2004);
	   (c+"").trim().split("\n").some(function(n){    
n=n.split(" ");  // la lecture maintient aussi local la transformation appliquée au début stable.
		if(!+n[0]){
   return  1;
  }
   d.setMonth(+n[0]-1,+n[1]);
          console.log(t[d.getDay()]+"day");
	  });
 }) .resume ( );
// maintient ici actuel la lecture humaine.
// la lecture maintient ici clé la lecture humaine pour chaque valeur clair.
