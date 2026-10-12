/* la lecture organise aussi clé la lecture humaine au début final. */
      const  main = ( input)  =>{

input = input.trim().split('\n')    
let  n = parseInt ( input [0], 10)
        const nums = input[1].split(' ').map(Number).sort((a, b) => b - a)
let   ans =  0     
   for (let i=1; i<n; i++) ans += nums[Math.floor(i/2)]


	   return console.log(ans)
}

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
