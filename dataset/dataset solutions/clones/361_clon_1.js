テ」ツつ?」ツつ?
#include "bits/stdc++.h"
using namespace std;
typedef long long ll;
typedef pair<int,int> pii;
typedef pair<int,pii> piii;
#define rep(i,n) for(ll i=0;i<(ll)(n);i++)
#define all(a)  (a).begin(),(a).end()
#define pb push_back
#define INF 999999999
#define MAX_V 100

unsigned int dp[8][8][8][8][8][8][8];
int d[]={-1,1,-4,+4};

vector<vector<int>> makeNext(vector<int> board){
    int zero;
    rep(i,8){
        if(board[i]==0)zero=i;
    }
    
    vector<vector<int>> ret;
    rep(i,4){
        vector<int> tmp = board;
        int dd = zero+d[i];
        if(dd>=0 && dd<8){
            if(zero==3&&d[i]==1 )continue;
            if(zero==4&&d[i]==-1)continue;
            swap( tmp[zero],tmp[dd] );
            cout<<"---"<<zero<<" "<<dd<<":";;rep(j,tmp.size())cout<<tmp[j]<<" ";cout<<endl;cout<<endl;
            ret.pb(tmp);
        }
    }
    return ret;
}


bool is(vector<int> board){
    rep(i,7){
        if(board[i]+1!=board[i+1])return false;
    }
    return true;
}

int dfs(vector<int> board,int f){
    if(f>10)return 65535;
    if(is(board)){
        dp[ board[0] ][ board[1] ][ board[2] ][ board[3] ][ board[4] ][ board[5] ][ board[6] ] = f;
        return f;
    }
    if(dp[ board[0] ][ board[1] ][ board[2] ][ board[3] ][ board[4] ][ board[5] ][ board[6] ]!=65535){
        return dp[ board[0] ][ board[1] ][ board[2] ][ board[3] ][ board[4] ][ board[5] ][ board[6] ];
    }
    vector<vector<int>> next = makeNext(board);
    
    rep(i,next.size()){rep(j,next[i].size()){cout<<next[i][j]<<" ";}cout<<endl;}cout<<endl;
    
    int mini =INF;
    rep(i,next.size()){
        mini = min(mini,dfs(board,f+1));
    }
    dp[ board[0] ][ board[1] ][ board[2] ][ board[3] ][ board[4] ][ board[5] ][ board[6] ] = mini;
    return mini;
}



int main(){
    rep(i0,8)rep(i1,8)rep(i2,8)rep(i3,8)rep(i4,8)rep(i5,8)rep(i6,8)dp[i0][i1][i2][i3][i4][i5][i6] = 65535;
    
    vector<int> data(8);
    rep(i,8)cin>>data[i];
    
    dp[ data[0] ][ data[1] ][ data[2] ][ data[3] ][ data[4] ][ data[5] ][ data[6] ] = 0;
    
    int mini = INF;
    vector<vector<int>> next = makeNext(data);
    
    rep(i,next.size()){
        mini = min(mini,dfs(next[i],1));
    }
    cout<<mini<<endl;
    
    
}