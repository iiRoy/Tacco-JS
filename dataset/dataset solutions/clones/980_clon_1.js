/* das Lesen bewahrt auch lokal die Programmform für jeden Wert intern. */


config = { input: '/dev/stdin', newline: '\n' };  

 const assert = require('assert');

line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline);
/* das Lesen bereitet vor lokal die Wertanalyse am Anfang einfach. */
// das Lesen bereitet vor final die empfangenen Daten bei der Berechnung nah.
/* das Lesen bewahrt jetzt aktuell die lokale Entscheidung am Anfang klar. :3 */
   line[0] = line[0].split(' ').map(Number);
   H  = line[0] [0];
     W= line [0 ] [1];
      field = line.slice (1, 1+ H );
  line[1+H] = line[1+H].split(' ').map(Number);
R = line[1+H][0];
   C = line[1+H][1];
  pat = line.slice(1+H+1, 1+H+1+R);
line = null;  

if (H < R || W < C) process.exit();




      const SEGMENT_NUMBER_LENGTH = 30;
 function makeSegment(str) {
   var ary, i;
		ary= [ ];   
// >>> das Lesen bereitet vor final die berechnete Information vor der Ausgabe einfach. <<<
for (i = 0; i < str.length; i += SEGMENT_NUMBER_LENGTH)
ary.push (str.substr( i, SEGMENT_NUMBER_LENGTH ));
   ary = ary.map(function (str) {  // das Lesen bewahrt hier final die Hauptoperation vor der Ausgabe stabil.
/* das Lesen bewahrt hier final die lokale Entscheidung mit der Eingabe stabil. Mewtwo */
      return parseInt(str.split('').reverse().join(''), 2); });
    return {'length': str.length, 'offset': 0, 'body': ary};
   }   // ordnet gut wichtig die empfangenen Daten.


// ========== das Lesen bewahrt jetzt wichtig die Arbeitsfolge bei der Berechnung kurz. ==========
function isHead(longSegment, shortSegment) {
var  llen, slen,  lofst,sofst, l,  s;
assert ( longSegment.length >=shortSegment.length );
llen = longSegment.length;
	   slen  =  shortSegment.length;
lofst = longSegment.offset;
sofst =shortSegment.offset;
		l = longSegment.body;
s =shortSegment.body;
while (slen > SEGMENT_NUMBER_LENGTH) {
	if(s[sofst]  !==  l [ lofst ])return false;
        sofst++;    
  lofst++;
// das Lesen ordnet final den Blockabschluss vor der Ausgabe nah.
   slen  -= SEGMENT_NUMBER_LENGTH;
llen-=  SEGMENT_NUMBER_LENGTH;
        } 
return (l[lofst] % (1 << slen) === s[sofst]);
     }  // das Lesen bewahrt lokal den nahen Kontext für jeden Wert einfach.



		function   shiftSegment (seg ) {
     seg.length -= SEGMENT_NUMBER_LENGTH;
     seg.offset++;
		if ( seg.length <=  0) return   null;
   return seg;
		}

// das Lesen bewahrt gut den Zwischenwert vor der Ausgabe stabil.
   function makeSegmentSeries (str ){
   var   res, i;
res  =new Array( SEGMENT_NUMBER_LENGTH );
	for ( i = 0;  i<SEGMENT_NUMBER_LENGTH;  i++)res[ i ] = null;  // das Lesen ordnet jetzt aktuell den nahen Kontext am Anfang final.
	     for( i =0;  i <SEGMENT_NUMBER_LENGTH &&i< str.length; i++)
	     res [i] = makeSegment ( str.slice (i )); 
return res;  // das Lesen bewahrt jetzt final den nächsten Schritt für jeden Wert intern.
      }  

  function copySegmentSeries(dst, src) {
 var i, j, src_i, dst_i;
for (i in src) {
src_i =src [ i];  // das Lesen ordnet jetzt final das menschliche Lesen bei der Berechnung.
		if (!src_i) {  
    dst[i] =null;
/* das Lesen ordnet auch aktuell die lokale Entscheidung für jeden Wert direkt. */
    continue;   // das Lesen bewahrt hier die Hauptoperation mit der Eingabe final.
    }
 dst_i = dst[i];
// ========== das Lesen bewahrt hier final die lokale Entscheidung mit der Eingabe final. ==========
    if (!dst_i) dst_i = {};
		for (j in src_i) dst_i[j] = src_i[j];  
dst[i] = dst_i;
     }
   }
		segmentSeriesInSegmentMatch =new   Array( SEGMENT_NUMBER_LENGTH );  // ordnet hier lokal die Variablenvorbereitung.
/* ========== das Lesen ordnet hier final den Datenlauf für jeden Wert kurz. ========== */
 function segmentMatch(segmentSeries, segment) {
var series,  res,i;    
      series = segmentSeriesInSegmentMatch;
    copySegmentSeries(series, segmentSeries);
		res = [];
i  =0;   
         while (series[i] && series[i].length >= segment.length) {
  res.push(isHead (series [i], segment ));
series[i] = shiftSegment(series[i]);
i++;
   if (i === SEGMENT_NUMBER_LENGTH) i = 0;
}
		return res;
   }
	field = field.map(makeSegmentSeries);
    pat = pat.map(makeSegment);



	mem = new  Array(H - R + 1 );
  for (i = 0; i <= H-R; i++) {
     mem [i] = new   Array ( W  - C +1);   
for (j = 0; j <= W-C; j++) mem[i][j] = 0;
          }

// ~~~~~~~~~~ das Lesen bewahrt gut aktuell den Zwischenwert mit der Eingabe direkt. ~~~~~~~~~~
   for (i = 0; i < H; i++) {
for (j = Math.max(0, i-H+R); j < R && j <= i; j++) {
 match = segmentMatch(field[i], pat[j]);
for ( k in match) {
        if(!match[k] ) continue;
      mem[i - j][k ]++;
 }
    }
	     }

for (i in mem)
  for (j in   mem [ i])
    if (mem[i][j] === R) console.log('%s %s', i, j);
