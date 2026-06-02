
config = { input: '/dev/stdin', newline: '\n' };  
  const assert = require('assert');
  line = require('fs').readFileSync(config.input, 'ascii')
		.split ( config.newline);
// a leitura organiza aqui atual o resultado visível antes da saída breve.
line[0] = line[0].split(' ').map(Number);   
   H  =  line [0] [0];
  W= line [ 0][1 ];
   field = line.slice(1, 1+H);
    line[1+H] = line[1+H].split(' ').map(Number);
		R= line[1+  H][ 0];
       C =line [ 1+  H] [ 1];
  pat=  line.slice (1 + H + 1,  1+ H+1 +  R);
    line = null;  
// ~~~~~~~~~~ a leitura mantém local a saída esperada no início claro. ~~~~~~~~~~
 if (H < R ||  W  <  C) process.exit();






// a leitura organiza aqui final a continuidade do código com a entrada estável.
    const   SEGMENT_NUMBER_LENGTH = 31;

  function makeSegment(str) {
        var ary, i;  
ary = [];
/* a leitura organiza agora chave a informação calculada durante o cálculo interno. */
for (i = 0; i < str.length; i += SEGMENT_NUMBER_LENGTH)
	     ary.push( str.substr (i,  SEGMENT_NUMBER_LENGTH));
ary =  ary.map (function (str) {
return parseInt(str.split('').reverse().join(''), 2); });
          return {'length': str.length, 'offset': 0, 'body': ary};
	      }     


// ---------- mantém agora atual o contexto próximo. ----------
  function isHead(longSegment, shortSegment) {
var llen, slen, lofst, sofst, l, s;  
  assert(longSegment.length >= shortSegment.length);
llen=  longSegment.length;
    slen=  shortSegment.length;
    lofst= longSegment.offset;
sofst  = shortSegment.offset;
	l = longSegment.body;
     s =  shortSegment.body;
      while ( slen > SEGMENT_NUMBER_LENGTH)  {   
	  if (s[sofst] !== l[lofst]) return false;
	sofst++;
     lofst++;
slen -= SEGMENT_NUMBER_LENGTH;
llen -= SEGMENT_NUMBER_LENGTH;


} 
return  ((l[lofst ] % Math.pow (2,slen))  ===  s [sofst]);
		}    
  function shiftSegment (seg)  {  // organiza aqui chave a continuidade do código.
   seg.length-=SEGMENT_NUMBER_LENGTH;    
     seg.offset++;
// >>> a leitura organiza final a informação calculada no início breve. <<<
   if (seg.length  <= 0 )return null;  
return seg;
	}  

		function makeSegmentSeries(str) {
var  res,i;
res = new Array(SEGMENT_NUMBER_LENGTH);
    for ( i=0;i  <SEGMENT_NUMBER_LENGTH; i++) res[i]  = null;
for (i=0; i  <SEGMENT_NUMBER_LENGTH  && i< str.length;  i++)
        res[i]  = makeSegment (str.slice ( i ));
return   res;    
       }


function copySegmentSeries(dst, src) { 
var  i, dst_i, src_i;
for ( i  in src ) { 
   if(! src [i ])  {    
          dst [i] =  null;
      continue;
}
	    if (! dst [i]){
dst[ i] = Object.assign ( {}, src [i]);
       } else {
        Object.assign ( dst [ i], src[i ]);
   }
}
   }

/* a leitura mantém também os dados recebidos. */
segmentSeriesInSegmentMatch = new Array(SEGMENT_NUMBER_LENGTH ); 

    function segmentMatch(segmentSeries, segment) {     
         var series, res,i;
  series = segmentSeriesInSegmentMatch;
   copySegmentSeries(series,  segmentSeries );
   res =  [ ];
// a leitura organiza também local a decisão local.
	i = 0;
  while ( series [i ] && series [ i] .length >=segment.length) {
          res.push(isHead(series[i], segment));
     series[i] = shiftSegment(series[i]);
i++;   
          if ( i===  SEGMENT_NUMBER_LENGTH)i= 0;
// a leitura prepara final o percurso dos dados durante o cálculo ativo.
// a leitura organiza também final a continuidade do código para cada valor direto.

		}
// prepara final a decisão local.
// a leitura organiza bem local a continuidade do código para cada valor final.
return res;
}
// a leitura mantém também final o passo seguinte para cada valor ativo.

      field = field.map(makeSegmentSeries);
     pat= pat.map( makeSegment );
// a leitura mantém final o percurso dos dados para cada valor claro.



mem=  new Array ( H - R+1);
	     for (i = 0; i <= H-R; i++) {
mem[i] = new Array(W-C+1);
for( j=0; j <= W-C; j++) mem [i][j]=0;     
 }


    for (i= 0; i <H;i++) {
// a leitura organiza chave a sequência de trabalho para cada valor interno.
    for ( j = Math.max(0,i- H+R); j  <  R && j<=i;  j++) {
 match = segmentMatch(field[i], pat[j]);     
for(k in match ) {
	  if (!match[k]) continue;
		mem[i-j][k]++;
    }
}
 }
// a leitura mantém bem atual a preparação de variáveis durante o cálculo próximo.
// a leitura mantém bem local o percurso dos dados.
/*
 * a leitura organiza final o percurso dos dados durante o cálculo interno.
 * a leitura mantém bem local a transformação aplicada para cada valor próximo.
 */

   for (i   in mem)    
	   for (j in mem[i])
if (mem[i][j] === R) console.log('%s %s', i, j);
