function main(input) {
  const args = input.split('\n');
  
  //平均気温 = T − x(エックス) × 0.006
  
  //平均気温と理想気温との差 (絶対値比較)
  let min_gap;
  
  //最適地
  let idx;
  
  const N = parseInt(args[0], 10),
  		T = parseInt(args[1].split(' ')[0]),
  		A = parseInt(args[1].split(' ')[1]),
        ary = args[2].split(' ').map(n => parseInt(n, 10));

  for(let i = 0; i < ary.length; i++) {
  	gap = Math.abs(A - (T - (ary[i] * 0.006)));
    
    if (!min_gap) { 
      min_gap = gap;
      idx = i;
    }
    
    if (gap <= min_gap) {
      min_gap = gap;
      idx = i;
    }
  }
  
  console.log((idx + 1).toString());
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));