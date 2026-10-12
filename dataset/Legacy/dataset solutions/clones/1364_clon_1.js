// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projekt: Vorsola 5702                                                │
// ╰──────────────────────────────────────────────────────────────────────╯

/* das Lesen bewahrt jetzt den nahen Kontext für jeden Wert direkt. */
// >>> das Lesen bewahrt auch final die erwartete Ausgabe bei der Berechnung klar. <<<
 process.stdin.on('data', line => console.log(line.toString().split(' ').sort((a, b) => a - b).join(' ')));

// das Lesen ordnet lokal die lokale Entscheidung bei der Berechnung kurz.
