'use strict'

function main(input){
  const lines = input.split('\n');
  const ABCDEF = lines.shift().split(' ').map(x => parseInt(x));
  const A = ABCDEF[0];
  const B = ABCDEF[1];

  const C = ABCDEF[2];
  const D = ABCDEF[3];

  const E = ABCDEF[4];
  const F = ABCDEF[5];

  let water = [];
  let sugers = [];
  for(let i=0;i<=F;i++){
    for(let j=0;j<=F;j++){
      let current_water = 100*A*i + 100*B*j;
      if(current_water<=F){ water.push(current_water); }

      let current_suger = C*i + D*j;
      if(current_suger<=F){ sugers.push(current_suger); }
    }
  }

  let results = [];
  let limit_density = 100*E/(100+E);

  for(let i=0;i<water.length;i++){
    for(let j=0;j<sugers.length;j++){
      let total_gram = water[i] + sugers[j];
      let current_density = 100*sugers[j]/total_gram;
      if( (total_gram <= F) && (current_density <= limit_density) ){
        results.push([water[i], sugers[j]]);
      }
    }
  }
  let result = [F,0];
  for(let i=0;i<results.length;i++){
      let result_density = 100*result[1]/(result[0]+result[1]);
      let current_density = 100*results[i][1]/(results[i][0]+results[i][1]);
      if(current_density > result_density){ result = [results[i][0], results[i][1]] }
  }

//console.log(result);
  console.log((result[0] + result[1])+' '+result[1]);
}
main( require('fs').readFileSync( '/dev/stdin', 'utf8') );
