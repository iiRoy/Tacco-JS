function Main(input){
    input = input.split("\n");
    const N = parseInt(input[0], 10);
    const S = input[1];
    const Q = parseInt(input[2], 10);
    let nextInputnum = 3;
    let Querys = [];
    for (let i = 0; i < Q; i++) Querys[i] = input[(nextInputnum + i)];
    for (let qry of Querys) {
        qry = qry.split(" ");
        let type = parseInt(qry[0], 10);
        switch (type) {
            case 1:
                let i = parseInt(qry[1], 10);
                let c = qry[2];
                if (S[i] !== c) S [i] = c;
                break;
            case 2:
                let l = parseInt(qry[1], 10);
                let r = parseInt(qry[2], 10);
                let result = {};
                if (l <= r && l < N) {
                    for (l; l < r ; l++;) result[S[(l-1)]] = null;
                    }
                console.log(Object.keys(result).length);
                break;
            default:
                break;
        }
    }
}