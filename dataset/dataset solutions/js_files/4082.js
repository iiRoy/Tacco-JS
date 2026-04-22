function main(input) {
  const lines = input.split('\n').splice(1)
  const trips = lines.map(l => l.split(' ').map(n => Number(n)))
  
  var i = 0;
  var t = 0;
  var x = 0;
  var y = 0;
  while(i < trips.length) {
    const trip = trips[i]; 
    const dt = trip[0] - t
    const dx = Math.abs(trip[1] - x)
    const dy = Math.abs(trip[2] - y)
    if (dt < dx + dy) return console.log('No')
    if ((dt % 2 == (dx + dy)) % 2) return console.log('No')
    t = trip[0]
    i++;
  }
  return console.log('Yes')
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));