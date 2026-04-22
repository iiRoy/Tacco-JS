"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const H = parseInt(arg[0].split(" ")[0]);
    const W = parseInt(arg[0].split(" ")[1]);
    const table = arg.slice(1, H + 1).map(n=>n.split(""));
    
    const bfs = (sy, sx) => {
        const dy = [-1, 0, 1, 0];
        const dx = [0, 1, 0, -1];
        
        let visited = [...Array(H)].map(n=>[...Array(W)].fill(-1));
        let que = [];
        let cost = 0;
        let answer = 0;
        
        que.push([sy, sx]);
        visited[sy][sx] = 0;
        
        while(que.length > 0) {
            const p = que.shift();

            // 上右下左の順で見ていく
            for(let i=0; i<4; i++) {
                const ny = p[0] + dy[i];
                const nx = p[1] + dx[i];
                
                // はみ出し、壁衝突を考慮する
                if(nx < 0 || W <= nx) continue;
                if(ny < 0 || H <= ny) continue;
                if(table[ny][nx] === '#') continue;
                if(visited[ny][nx] !== -1) continue;
                
                que.push([ny, nx]);
                visited[ny][nx] = visited[p[0]][p[1]] + 1;
                
                answer = Math.max(answer, visited[ny][nx]);
            }
        }
        
        // console.log(visited.join("\n"));
        // console.log("---------")
         
        return answer;
    }
    
    let answer = 0;
    
    for(let h=0; h<H; h++) {
        for(let w=0; w<W; w++) {
            if(table[h][w] === "#") continue;
            answer = Math.max(answer, bfs(h, w));
        }
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));