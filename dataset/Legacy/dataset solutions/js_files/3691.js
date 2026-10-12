#include<bits/stdc++.h>
using namespace std;

// template {{{  0 
// using {{{ 1
using ll = long long int;
using llu = long long unsigned int;
using pii = pair<int,int>;
using pll = pair<ll,ll>;
using vi = vector<int>;
using vl = vector<ll>;
using vii = vector<pii>;
using vll = vector<pll>;
// }}} 1
// definition {{{ 1
// scaning {{{ 2
#define Scd(x) scanf("%d", &x)
#define Scd2(x,y) scanf("%d%d", &x, &y)
#define Scd3(x,y,z) scanf("%d%d%d", &x, &y, &z)
#define Scll(x) scanf("%lld", &x)
#define Scll2(x,y) scanf("%lld%lld", &x, &y)
#define Scll3(x,y,z) scanf("%lld%lld%lld", &x, &y, &z)
#define Scc(c) scanf("%c", &c);
#define Scs(s) scanf("%s", s);
#define Scstr(s) scanf("%s", &s);
// }}} 2
// constants {{{ 2
#define EPS (1e-7)
#define INF (2e9)
#define PI (acos(-1))
// }}} 2
// systems {{{ 2
#define Repe(x,y,z) for(ll x = z; x < y; x++)
#define Rep(x,y) Repe(x,y,0)
#define RRepe(x,y,z) for(ll x = y-z-1; x >= 0; x--)
#define RRep(x,y) RRepe(x,y,0)
// }}} 2
// output {{{ 2
#define YesNo(a) (a)?printf("Yes\n"):printf("No\n")
#define YESNO(a) (a)?printf("YES\n"):printf("NO\n")
// }}} 2
// }}} 1
// input {{{ 1
// }}} 1
// }}} 0

void dijkstra( int s, vector<vii>& g, vl& dist ){
    priority_queue<pll,vll,greater<pll>> q;
    dist.assign(g.size(),1e18);
    dist[s] = 0;
    q.emplace(0,s);
    while( q.size() ){
        int from = q.top().second; ll  di = q.top().first;
        q.pop();
        if( di > dist[from] ) continue;
        for( pii tow : g[from] ){
            int to = tow.first;
            int co = tow.second;
            if( dist[to] > di+co ){
                dist[to] = di+co;
                q.emplace(dist[to],to);
            }
        }
    }
}

int main() {

    int N,M,s,t;
    Scd2(N,M);
    Scd2(s,t);
    s--,t--;

    vector<vii> ga(N);
    vector<vii> gb(N);
    int u,v,a,b;
    Rep(i,M){
        Scd2(u,v);
        Scd2(a,b);
        u--,v--;
        ga[u].emplace_back(v,a);
        ga[v].emplace_back(u,a);
        gb[u].emplace_back(v,b);
        gb[v].emplace_back(u,b);
    }

    vl da,db;
    dijkstra(s, ga, da);
    dijkstra(t, gb, db);

    ll tmp = 0;
    vl ans;
    RRep(i,N){
        tmp = max( tmp, 1000000000000000LL - da[i] - db[i] );
        ans.push_back(tmp);
    }

    RRep(i,N){
        printf ("%lld\n", ans[i] );
    }


    return 0;
}


