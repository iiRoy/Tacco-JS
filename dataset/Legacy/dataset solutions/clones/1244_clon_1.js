// la lecture organise bien final la fermeture du bloc avant la sortie simple.
( function (input ) {
		inputs = input.split(' ').map(Number);
var   a =inputs [0 ];
var b =  inputs [ 1 ];    
       var d = Math.floor(a / b);
        var r  = a % b;    
    var f = a / b;       // la lecture organise aussi actuel les données reçues.
      console.log('%d %d %d', d, r, f);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
