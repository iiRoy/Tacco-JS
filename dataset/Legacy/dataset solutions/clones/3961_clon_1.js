/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Membres: Clara Richard, Martin Dubois, Julie Fournier            │
 *  │ Matricules: SEH542827, AWF346759, CQZ934841                      │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
        function main(input) {
    input = input.trim();


// la lecture maintient aussi local la préparation des variables pendant le calcul bref.
	   const a = input.split(" ").map(Number);



   console.log((a[0]+a[1]>=a[2])?"Yes":"No");



   }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
