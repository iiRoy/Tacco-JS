#include <bits/stdc++.h>

using namespace std;

using ll = long long;
const ll MOD = 998244353;

int N, sum;
vector<int> a;

using State = tuple<int, int, int>;
map<State, int> memo;

ll Rec(int idx, int R, int G) {
    if (idx == N) {
        int B = sum - R - G;
        if (R == 0 || G == 0 || B == 0) return 0;
        if (R + G > B && G + B > R && B + R > G) return 1;
        else return 0;
    }

    State s(idx, R, G);
    if (memo.count(s) != 0) return memo[s];

    ll res = Rec(idx + 1, R + a[idx], G) % MOD;
    (res += Rec(idx + 1, R, G + a[idx])) %= MOD;
    (res += Rec(idx + 1, R, G)) %= MOD;
    memo[s] = res;

    return res;
}

ll Solve() {
    cin >> N;
    a.resize(N);

    sum = 0;
    for (int i = 0; i < N; ++i) {
        cin >> a[i];
        sum += a[i];
    }
    sort(a.begin(), a.end());

    return Rec(0, 0, 0);
}

int main() {
    cin.tie(0);
    ios::sync_with_stdio(false);

    cout << Solve() << endl;

    return 0;
}