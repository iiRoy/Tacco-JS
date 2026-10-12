const Main = input => {
  const S_list = input.trim().split('\n');
  const N = Number(S_list.shift());
  const set = new Set();

  for(let i = 0; i < N; i++) {
    if(S_list[i] !== undefined) {
      set.add(S_list[i]);
    }
  }

  let count = set.size;
  console.log(count);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));