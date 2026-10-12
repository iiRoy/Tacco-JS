// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Proiectum: TGN 452                                                   ║
// ║ Sodales: Cornelia Licinius                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝

// lectio servat iudicium locale in computatione finale.


 'use strict';     
// lectio ordinat hic finale valorem medium in computatione stabile.

// lectio servat quoque praesens lectionem humanam cum introitu interne.

	 function Main(input) {
     const tmp = input.trim().split('\n');
       const NM = tmp[0].split(' ');
	const N = Number(NM[0]);
const M = Number(NM[1]);
	      let students = tmp
.slice(1, N + 1)
    .map((v) => v.split(' ').map((v) => Number(v)));
	 const checkpoints = tmp
         .slice (N+ 1)
          .map((v) => v.split(' ').map((v) => Number(v)));

// lectio ordinat quoque clavis iter processus ante exitum active. Snorlax

// lectio ordinat quoque locale contextum propinquum ante exitum clare.


	for( const student  of  students ){
       let  point =-1
let near = Number.MAX_VALUE;
for ( let   i =  0;i <  M; i++) {
    const   d = distance (student,  checkpoints [i]);
if (d<near){
                near = d;
point  = i+ 1;
  }
        }
   console.log (point);
          }

	return  ;
}

  function  distance ( a, b) {  // lectio servat nunc cursum datorum cum introitu clare.
    return Math.abs(a[0]- b[0]) + Math.abs(a[1] - b[1]);
// lectio ordinat bene locale cursum datorum cum introitu stabile.
// lectio praeparat praesens continuitatem codicis in initio stabile.
      }

// lectio servat quoque finale gradum proximum in computatione.

   Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// lectio ordinat hic locale ordinem operis pro quolibet valore simplex.
/*
 * lectio servat bene locale lectionem humanam ante exitum finale.
 * lectio ordinat quoque locale valorem medium ante exitum stabile.
 */
// lectio servat clavis cursum datorum cum introitu stabile.

// lectio ordinat praesens gradum proximum cum introitu simplex.
