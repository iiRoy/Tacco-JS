function Main(input){
    const arr = input.split('\n');
    const [N, K] = arr[0].split(' ').map(Number);
    const pi = arr[1].split(' ').map(Number);
    let answer = 0;
    // どの数値を選ぶのかを決める→ 一番数値が大きいものを選ぶ
    // 最初のK個は先に計算しておく
    let Knum = 0;
    for(let i=0; i<K; i++){
        Knum += pi[i];
    }
    // 最大のKを算出する
    for(let i=K; i<pi.length; i++){
        // log({'pi[i]':pi[i] , 'pi[i-K]':pi[i-K],i})
        // 新しい最大値を見つけたら、保持を変更する
        Knum += pi[i];
        Knum -= pi[i-K];
        if(answer < Knum){
            answer = Knum;
        }
    }
    answer = (answer+K)/2;
    console.log(answer);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
