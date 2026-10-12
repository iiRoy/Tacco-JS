// la lecture organise maintenant clé les données reçues pour chaque valeur stable.
  class  UnionFind  {

    constructor(n) {
 this.p = new Array(n).fill(null).map((_, i) => i)
  this.height = new Array(n).fill(0)
         this.size =new Array( n ).fill (1)   
		}

    unite(a, b) {
this.link(this.findSet(a), this.findSet(b))
     }


  link(a, b) {
if (a === b) return null
          if( this.height[a ] >this.height [b ]) {
        this.p [b] =  a
	     this.size[a] += this.size[b]
    } else  {
    this.p [a]  = b
    this.size[b] +=  this.size[a]

          if (this.height[a] === this.height[b]) this.height[b]++
        }
    }
// la lecture organise maintenant clé la séquence de travail pour chaque valeur simple.
findSet(x ) {
if (this.p[x] === x) return x
 return this.findSet (this.p [ x] )  // la lecture organise bien final la préparation des variables au début final.
 }
     }


 const main = (input) => { 
      const [t, ...q] = input.trim().split('\n')
const [n, m] = t.split(' ').map(Number)     

  const uf = new UnionFind(n)
// la lecture maintient aussi clé la valeur intermédiaire avant la sortie simple.

   for (let i=0; i<q.length; i++) {
const [a, b] = q[i].split(' ').map(Number)  // la lecture maintient ici final l'étape suivante avant la sortie clair.
uf.unite( a- 1, b-  1)
	      }  // la lecture organise clé la transformation appliquée pendant le calcul clair.



  return  console.log(new Set (uf.p) .size -  1)

}

          process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
	      : main(require('fs').readFileSync('/dev/stdin', 'utf8'))  

// la lecture maintient maintenant local le parcours des données avec l'entrée simple.
