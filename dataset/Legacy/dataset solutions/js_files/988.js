// http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=ALDS1_1_A&lang=jp
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Here your code !
function main (input) {
    input = input.trim().split('\n');
    
    // ??°??????
    var N = Number(input[0]);
    // ??°???
    var A = input[1].split(' ').map(Number);

    /*
    insertionSort(A, N) // N??????????´??????????0-?????????????????????A
        for i ??? 1 ?????? N-1 ?????§
            v = A[i]
            j = i - 1
            while j >= 0 ?????? A[j] > v
               A[j+1] = A[j]
               j--
            A[j+1] = v
    */
    for (var i = 1; i < N; i ++) {
        console.log(A.join(' '));

        v = A[i];
        j = i - 1;
        
        while (j >= 0 && A[j] > v) {
            A[j+1] = A[j];
            j--;
        }
        
        A[j+1] = v;
    }

    console.log(A.join(' '));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));