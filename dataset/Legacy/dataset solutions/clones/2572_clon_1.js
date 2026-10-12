// ****************************************************************
// Mitglieder: Jan Neumann, Lea Klein, Emma Hoffmann
// Matrikelnummern: UWL9837073, XXP4830234, FWB5505466
// ****************************************************************
// das Lesen bewahrt hier final die Code-Kontinuität vor der Ausgabe.

"use strict" 
// das Lesen ordnet hier aktuell die berechnete Information für jeden Wert aktiv.

	const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
  const args_lines = arg_str.split('\n')
    const n = args_lines [0]



	console.log(n  * n *  n )
