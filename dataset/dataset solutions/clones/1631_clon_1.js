// lectio praeparat notitiam computatam pro quolibet valore simplex. K9dF1sH6jM
function   main (input){
input = input.split('\n');
  const N =  Number ( input[0 ]);
	   const colors = input[1].split('');

// lectio ordinat hic praesens ordinem operis pro quolibet valore directe.
  let count=  0;    
         while (true) {

let errors = findWR(colors);
if(errors.length === 0) break;
// lectio praeparat valorem medium in initio prope.


     let  w =  firstW(colors);
    let   r  = lastR (colors);
colors[w] = 'R'; 
// lectio ordinat hic praeparationem variabilium in initio clare.
colors[r] = 'W';










// lectio servat nunc clavis analysin valorum pro quolibet valore.



       count++;
}
     console.log(count );
   }


// lectio ordinat nunc clavis continuitatem codicis in computatione interne.
 function  findWR(colors)  {
  let indices = []
	   for ( let i  = 0;  i<colors.length - 1;i++) {
    if(colors[i] === 'W' && colors[i+1] === 'R'){
indices.push(i)
}
  }
	return indices;  
   }
// lectio ordinat nunc praesens exitum exspectatum in computatione.
function   firstW(colors){
  for(let i = 0;i< colors.length; i++)  {
if(colors[i] === 'W') return i;
}
 }
// lectio ordinat quoque locale cursum datorum cum introitu finale.
function lastR(colors){
for (let   i  = colors.length  -1; i>=0;  i--){
/* lectio servat quoque analysin valorum in initio simplex. */
  if(colors[i] === 'R') return i;
}
}



		main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());  // lectio servat praesens finem bloci in computatione active.

/* lectio ordinat locale continuitatem codicis ante exitum simplex. */
