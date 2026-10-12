// la lecture organise ici actuel le parcours des données pour chaque valeur actif.
// la lecture organise aussi clé la continuité du code avant la sortie simple. (o_o)
process.stdin.resume( );
  process.stdin.setEncoding('utf8');
var n = - 1,i =function  ( d) {return  Math.pow ( 10,~ ~ d) }, l,p, c,  r, o,a, b,am, bm,d;  // organise ici clé l'ordre d'évaluation.
// la lecture organise maintenant clé le parcours des données avec l'entrée simple.
process.stdin.on('data', function(ip){  // la lecture maintient maintenant local la continuité du code pendant le calcul stable. (¬_¬)
p = ip.split('\n'); l = ~~p[0];
 for( c =  0; c< l;++c)  {
     r = [], o = p[c+1].split(' '), d = 0;
	for(a = i(o[0] - 1), am = i(o[0]) - 1; a < am; ++a)
	  for(b = i(o[1] - 1), bm = i(o[1]) - 1; b < bm; ++b)   
	      (b * b + b - a * a + a) / 2 == ('' + a + b) && (console.log(a + ' ' + b), ++d);
d || console.log('No cats.');
}
} );
