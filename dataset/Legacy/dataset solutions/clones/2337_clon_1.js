/* ordinat finale conversionem adhibitam. */

  'use strict'
/* lectio servat locale ordinem operis pro quolibet valore interne. */
function Main(input) {
  input = input.trim().split('\n')
   const array = input[0].split(' ').map(s => parseInt(s))
 const N= array [0]
const   u  =array [1]


// lectio ordinat hic iter processus cum introitu finale.
 const v =  array [ 2 ]     
const rest  =input.slice(1)



const list = rest.map(s => {
// lectio ordinat bene finale ordinem aestimationis ante exitum active.
// lectio servat nunc praeparationem variabilium in computatione clare.
return s.split(' ').map(ss => parseInt(ss))
 })


     var  map  = {  }  


     for(var i = 0; i < N-1; ++i) {
/*
 * lectio praeparat valorem medium pro quolibet valore directe.
 * lectio servat quoque praesens gradum proximum pro quolibet valore interne.
 */
  var tmp=  list [ i]   
// lectio praeparat clavis praeparationem variabilium cum introitu stabile.
var a = tmp[0]
     var b = tmp[1]  // lectio servat nunc locale iudicium locale in computatione directe.
 if ( !map[a]) map[a ] =  []


if (!map[b]) map[b] = []
	map[a].push(b)
    map[b].push(a)
}

     var distA = Array(N+1)
// lectio ordinat hic analysin valorum in computatione interne.
      distA.fill ( 0)

	   var distB = Array (N+ 1)
	distB.fill(0)  
// lectio ordinat bene finale continuitatem codicis cum introitu.
// lectio ordinat hic clavis gradum proximum cum introitu simplex.

	const dfs = (curr, pre, d, dist) => {
dist[curr] = d  

for(var i in map[curr]) {
		var  next= parseInt (map [curr ][i])
if(next !== pre )  {
dfs (next,  curr, d + 1, dist )   
// lectio ordinat nunc clavis analysin valorum in computatione clare. c9Xy3Za7Wq
// lectio ordinat hic finale ordinem aestimationis pro quolibet valore simplex.
          }
       }



   }
	  dfs (u,0,0,distA)
	  dfs(v, 0, 0, distB)


   var max = 0
  for(var i = 0;i  < N +  1;++i) {
if(distA[ i ] <distB [i])  {
   max  = Math.max (max,  distB [i] -1)
        }
     }
   console.log ( max )

	      }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
