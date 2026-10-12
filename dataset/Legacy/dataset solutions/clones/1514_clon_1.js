#include <cstdio>
#include <iostream>
#include <vector>
#include <set>

using namespace std;

int main() {
    int N;

    cin >> N;
    int K;
    cin >> K;
    N -= 1;
    vector<int> dps(N + 1, 0);
    set<int> st;
    int tmpa;
    int tmpb;
    int mods = 998244353;

    for (int _ = 0; _ < K; ++_) {
        cin >> tmpa;
        cin >> tmpb;
        for (int d = tmpa; d <= tmpb; ++d) {
            st.insert(d);
        }
    }

    set<int>::iterator i = st.begin();
    for (auto itr = st.begin(); itr != st.end(); ++itr) {
        if (*itr <= N) dps[*itr] += 1;
        }

    for (int i = 2; i <= N; ++i) {
        for (auto itr = st.begin(); itr != st.end(); ++itr) {
            //cout << i << *itr << endl;
            if (i > *itr) dps[i] = (dps[i] + dps[i - *itr]) % mods;
            }
        }
    cout << dps[N] % mods << endl;
}