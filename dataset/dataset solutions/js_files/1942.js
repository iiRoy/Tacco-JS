const Main = input => {
  const sp = input.split(' ').map(e => Number(e));

  const a = Math.ceil( sp[2] / sp[1] );
  const b = Math.ceil( sp[0] / sp[3] );

  const resultA = sp[0] - sp[3]*b;
  const resultB = sp[2] - sp[1]*a;

  console.log(a===b ? 'Yes' : 'No');
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
//Main(`10 9 10 10`);
//Main(`45 4 39 5`)
