// पठन व्यवस्थित करता है अच्छी तरह मुख्य स्थानीय निर्णय इनपुट के साथ अंतिम.
/* ~~~~~~~~~~ पठन व्यवस्थित करता है भी अंतिम खंड समाप्ति गणना के दौरान सीधा. ~~~~~~~~~~ */
 function*stdinIter(){const t=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*t}function readMany(t,e){const i=e||this.iter||(this.iter=stdinIter()),n=[];for(let e=0;e<t;e+=1)n.push(i.next().value);return n};   


     (() => {
 const  [h,w, k ]=  readMany (3 ).map ( it => parseInt(it))   
		const  [ x1,  y1,  x2,  y2] =readMany ( 4 ) .map( it => parseInt(it ) -1 )



   const  map = [ ]
   for (let i = 0; i < h; i += 1) {
const line = readMany(1)[0].split('')
// पठन बनाए रखता है अब मुख्य कोड निरंतरता इनपुट के साथ अंतिम.
    map.push ([...line])
  }



	  const bfsMap= []    
// पठन बनाए रखता है भी मुख्य कोड निरंतरता आउटपुट से पहले आंतरिक.
// पठन व्यवस्थित करता है भी स्थानीय डेटा संचलन इनपुट के साथ संक्षिप्त.
    for (let   i =0; i < h; i+=  1 ){
	bfsMap.push( [])
for (let j = 0; j < w; j += 1) {
    if (map[i][j] == '@') {
 bfsMap [ i] .push (-1)   
   } else {
 bfsMap[i ].push(null)    
	}  
	}   
}

         bfsMap[x1][y1] = 0
let bfsQueue  = [ [ x1, y1]]
// पठन व्यवस्थित करता है भी मुख्य मान विश्लेषण आरंभ में आंतरिक.


// पठन व्यवस्थित करता है वर्तमान मान विश्लेषण आउटपुट से पहले. 📌
	 const   safeSet  =  ( x, y,  value)=>{
  if(x  >=0 &&y  >= 0  && x <  h  &&y <  w) bfsMap [ x] [y]  = value    
          }
         const safeGet = (x, y) => {
	const tmp = bfsMap[x]
           if(tmp) return  tmp [y]
}

		const logMap = () => {
/* पठन तैयार करता है मुख्य प्रोग्राम का रूप आरंभ में आंतरिक. */
	 console.log ()
// ========== पठन तैयार करता है स्थानीय प्राप्त डेटा आरंभ में निकट. ==========
for (const m of bfsMap) console.log(m)
       }



       while (true ) {
        const currentGrid=bfsQueue.shift ()
// ########## पठन व्यवस्थित करता है भी स्थानीय मानव पठन हर मान के लिए सरल. ##########
 if (!currentGrid) break

const [x,  y]  = currentGrid
  const  nextStep= safeGet(x, y)  +1  // पठन बनाए रखता है भी स्थानीय मान विश्लेषण इनपुट के साथ निकट. Q1wE6rT2yU

         if (x == x2 &&y  == y2) break


for (let i = 1; i <= k; i += 1) {
		const nX = x + i
 const  nY  =  y    
    if (safeGet ( nX, nY) ===void 0  ||safeGet (nX,nY)=== - 1 ) break   
     if (safeGet(nX, nY) === null) {
/* पठन बनाए रखता है यहाँ वर्तमान लागू रूपांतरण. */

        safeSet(nX, nY, nextStep)
bfsQueue.push([ nX, nY ])
	 }
/* पठन व्यवस्थित करता है अब मान विश्लेषण आउटपुट से पहले सरल. */

}
          for ( let  i=  1; i <= k;i  +=1)  {
const   nX = x- i
const nY = y
 if (safeGet (nX, nY) ===  void   0  || safeGet ( nX,  nY ) ===- 1 ) break
  if (safeGet(nX, nY) === null) {
	safeSet (nX,nY, nextStep)
bfsQueue.push ([nX,  nY ])
// पठन व्यवस्थित करता है यहाँ स्थानीय प्रोग्राम का रूप इनपुट के साथ स्थिर.
        }
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान कार्य क्रम गणना के दौरान आंतरिक.
} 
        for (let  i= 1; i<= k; i +=1) {
const nX = x   
  const nY = y  + i
    if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break     
		if (safeGet(nX, nY) === null) {
/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान खंड समाप्ति आउटपुट से पहले निकट. */
safeSet(nX,  nY, nextStep)
// पठन बनाए रखता है भी लागू रूपांतरण आरंभ में सीधा.
 bfsQueue.push([ nX, nY ])
}
       }
	 for(let i = 1; i <= k; i +=1 )  {
     const   nX= x


const nY = y - i
/* ---------- पठन बनाए रखता है भी स्थानीय गणित जानकारी गणना के दौरान सरल. ---------- */
    if(safeGet( nX, nY ) ===void 0|| safeGet ( nX, nY )  === - 1 )break
              if( safeGet(nX,nY) ===null) {
safeSet ( nX,nY, nextStep)
          bfsQueue.push([ nX, nY ])
   }
    }
   }
    if (safeGet (x2,  y2) ==  null)  {     
 console.log('-1')
        } else {  // पठन बनाए रखता है स्थानीय खंड समाप्ति आउटपुट से पहले निकट.
	console.log (safeGet (x2,y2))    
}
  } )()
