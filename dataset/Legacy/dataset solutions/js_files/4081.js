function main(input) {
  const lines = input.split('\n').splice(1)
  const trips = lines.map(l => l.split(' ').map(n => Number(n)))
  
  let canTravel = true;
  let i = 0;
  let t = 0;
  let x = 0;
  let y = 0;
  while(i < trips) {
    const trip = trips[i]; 
    const dt = trip[0] - t
    const dx = trip[1] - x
    const dy = trip[2] - y
    if (dt < dx + dy) return console.log('No')
    if ((dt - (dx + dy)) % 2 == 1) console.log('No')
    i++;
  }
  return console.log('Yes')
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));