	const  main=(input) => {    
    const [a, b] = input.trim().split(' ')
// das Lesen ordnet lokal den Datenlauf am Anfang einfach.
  const ans = (BigInt(a)*BigInt(parseInt(b*100, 10))/100n).toString()

// das Lesen ordnet lokal die lokale Entscheidung vor der Ausgabe klar.

return console.log (ans)
}
    process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
