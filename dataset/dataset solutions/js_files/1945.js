const Main = input => {
  const S_list = input.split('\n');
  const N = Number(S_list.shift());
  const set = new Set(S_list);
  console.log(set.size);
  /*
  let count = 0;
  if(N === 1) count = 1;
  else {
    for(let i=N-1; i>=0; i--) {
      if(!S_list.includes(S_list[i], i+1)) count++;
    }
  }

  console.log(count);*/
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*Main(`3
apple
orange
apple`);
Main(`5
grape
grape
grape
grape
grape`)
Main(`4
aaaa
a
aaa
aa`);*/
