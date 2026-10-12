const isBelow= (v) => {
    if(v%2==0){
        v%3==0
    }

};


const main =(input)=>{
    const args = input.split('\n')
    const nums = args[1].split(' ')
    var mes ='APPROVED'

    nums.forEach(el=>{

        if(el%2==0){

            if(!((el%3==0)||(el%5==0)))
                mes ='DENIED'
                return 0;
        }
    })
    console.log(mes)


}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));