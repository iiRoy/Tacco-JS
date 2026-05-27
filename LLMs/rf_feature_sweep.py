"""
Feature selection sweep — two strategies:

  A) Backward elimination: at each step, drops the feature whose removal
     hurts T3 F1 the least (or improves it). Repeats until 1 feature left.
     Shows the optimal subset along the elimination path.

  B) Semantic groups: tests ~10 hand-crafted feature subsets with clear meaning.

RF config: best hyperparameters from rf_sweep.py.
"""
import itertools
import numpy as np
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

CACHE_DIR     = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "rf_features_cache.npz"

METRIC_NAMES = [
    "Jaccard", "Dice", "LevenshteinRatio", "Jaro", "JaroWinkler",
    "Cosine", "Overlap", "LCSRatio", "NgramJaccard", "NgramDice",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "LengthRatio", "VocabularyRatio",
    "IR_InstrCountRatio", "IR_LabelCountRatio", "IR_BranchCountRatio",
    "IR_JumpCountRatio", "IR_AssignCountRatio", "IR_CallCountRatio",
    "IR_RetCountRatio", "IR_TempCountRatio", "IR_FunctionCountRatio",
    "IR_BranchDensity_A", "IR_BranchDensity_B", "IR_BranchDensityDiff",
    "NormASTJaccard", "NormASTLCSRatio", "NormASTCosine",
    "CFG_NodeCountRatio", "CFG_EdgeCountRatio", "CFG_CyclomaticRatio",
]
EXCLUDE_METRICS = [
    "Jaro", "JaroWinkler", "Overlap",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "IR_InstrCountRatio", "IR_LabelCountRatio", "IR_BranchCountRatio",
    "IR_JumpCountRatio", "IR_AssignCountRatio", "IR_CallCountRatio",
    "IR_RetCountRatio", "IR_TempCountRatio", "IR_FunctionCountRatio",
    "IR_BranchDensity_A", "IR_BranchDensity_B", "IR_BranchDensityDiff",
]
ACTIVE_NAMES = [n for n in METRIC_NAMES if n not in EXCLUDE_METRICS]
# Active features (15):
# Jaccard, Dice, LevenshteinRatio, Cosine, LCSRatio, NgramJaccard, NgramDice,
# LengthRatio, VocabularyRatio, NormASTJaccard, NormASTLCSRatio, NormASTCosine,
# CFG_NodeCountRatio, CFG_EdgeCountRatio, CFG_CyclomaticRatio

CLASS_LABELS = [1, 2, 3, 4]
RANDOM_STATE = 42
TEST_SIZE    = 0.15

RF_PARAMS = dict(
    n_estimators     = 200,
    criterion        = "gini",
    max_features     = "sqrt",
    class_weight     = {1: 1, 2: 1, 3: 2, 4: 1},
    min_samples_leaf = 1,
    n_jobs           = 1,
    random_state     = RANDOM_STATE,
)

# ── Semantic groups (Option B) ─────────────────────────────────
def _idx(names):
    return [ACTIVE_NAMES.index(n) for n in names]

NORM_AST   = ["NormASTJaccard", "NormASTLCSRatio", "NormASTCosine"]
CFG        = ["CFG_NodeCountRatio", "CFG_EdgeCountRatio", "CFG_CyclomaticRatio"]
LEXICAL    = ["Jaccard", "Dice", "LevenshteinRatio", "Cosine", "LCSRatio",
              "NgramJaccard", "NgramDice", "LengthRatio", "VocabularyRatio"]
TOP6       = ["NormASTLCSRatio", "LevenshteinRatio", "NgramJaccard",
              "NgramDice", "NormASTJaccard", "VocabularyRatio"]
TOP8       = TOP6 + ["LCSRatio", "LengthRatio"]
NO_BOTTOM3 = [n for n in ACTIVE_NAMES
              if n not in ("Jaccard", "Dice", "Cosine")]  # lowest importance

SEMANTIC_GROUPS = {
    "All 15 (baseline)"              : list(range(len(ACTIVE_NAMES))),
    "No CFG (12)"                    : _idx([n for n in ACTIVE_NAMES if n not in CFG]),
    "CFG only (3)"                   : _idx(CFG),
    "NormAST only (3)"               : _idx(NORM_AST),
    "NormAST + CFG (6)"              : _idx(NORM_AST + CFG),
    "Lexical only (9)"               : _idx(LEXICAL),
    "Lexical + CFG (12)"             : _idx(LEXICAL + CFG),
    "Top 6 + CFG (9)"                : _idx(TOP6 + CFG),
    "NormAST + Lev + Ngram + CFG (9)": _idx(NORM_AST + ["LevenshteinRatio",
                                                          "NgramJaccard", "NgramDice"] + CFG),
    "No Jaccard/Dice/Cosine (12)"    : _idx(NO_BOTTOM3),
    "Sin LengthRatio (14)"           : _idx([n for n in ACTIVE_NAMES if n != "LengthRatio"]),
}


# ── Shared train function ──────────────────────────────────────
def _train(X_tr, y_tr, X_te, y_te):
    scaler = StandardScaler()
    clf    = RandomForestClassifier(**RF_PARAMS)
    clf.fit(scaler.fit_transform(X_tr), y_tr)
    y_pred = clf.predict(scaler.transform(X_te))
    rep    = classification_report(y_te, y_pred, labels=CLASS_LABELS,
                                   output_dict=True, zero_division=0)
    return {
        "acc"  : accuracy_score(y_te, y_pred),
        "T1_f1": rep[str(1)]["f1-score"],
        "T2_f1": rep[str(2)]["f1-score"],
        "T3_f1": rep[str(3)]["f1-score"],
        "T4_f1": rep[str(4)]["f1-score"],
        "T3_p" : rep[str(3)]["precision"],
        "T3_r" : rep[str(3)]["recall"],
    }


def _worker_drop(args):
    drop_idx, remaining_idx, X_tr, y_tr, X_te, y_te = args
    candidate = [i for i in remaining_idx if i != drop_idx]
    r = _train(X_tr[:, candidate], y_tr, X_te[:, candidate], y_te)
    r["dropped"] = drop_idx
    r["subset"]  = candidate
    return r


def _worker_group(args):
    name, idx, X_tr, y_tr, X_te, y_te = args
    r = _train(X_tr[:, idx], y_tr, X_te[:, idx], y_te)
    r["name"] = name
    r["n"]    = len(idx)
    r["feats"] = [ACTIVE_NAMES[i] for i in idx]
    return r


def print_row(r):
    return (f"  acc={r['acc']:.4f}  "
            f"T1={r['T1_f1']:.4f}  T2={r['T2_f1']:.4f}  "
            f"T3={r['T3_f1']:.4f} (p={r['T3_p']:.4f} r={r['T3_r']:.4f})  "
            f"T4={r['T4_f1']:.4f}")


def main():
    import os
    workers = os.cpu_count() or 4

    if not FEATURE_CACHE.exists():
        print("[ERROR] Cache not found.")
        return

    data       = np.load(FEATURE_CACHE, allow_pickle=False)
    active_idx = [i for i, n in enumerate(METRIC_NAMES) if n not in EXCLUDE_METRICS]

    X_tr_all = data["X"][:, active_idx]
    y_tr_all = data["y"]
    X_te     = data["X_unseen"][:, active_idx]
    y_te     = data["y_unseen"]

    X_tr, _, y_tr, _ = train_test_split(
        X_tr_all, y_tr_all,
        test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_tr_all,
    )
    print(f"Train: {len(y_tr)}  Test: {len(y_te)}  Workers: {workers}\n")

    # ══════════════════════════════════════════════════════════
    #  OPTION B — Semantic groups
    # ══════════════════════════════════════════════════════════
    print("=" * 70)
    print("  OPTION B — SEMANTIC GROUPS")
    print("=" * 70)

    group_jobs = [(name, idx, X_tr, y_tr, X_te, y_te)
                  for name, idx in SEMANTIC_GROUPS.items()]

    group_results = []
    with ProcessPoolExecutor(max_workers=workers) as exe:
        futs = {exe.submit(_worker_group, j): j for j in group_jobs}
        for f in as_completed(futs):
            group_results.append(f.result())

    group_results.sort(key=lambda r: r["T3_f1"], reverse=True)

    hdr = f"  {'Group':<30} {'n':>3}  {'acc':>6}  {'T1':>6}  {'T2':>6}  {'T3':>6}  {'T4':>6}  {'T3_p':>6}  {'T3_r':>6}"
    print(hdr)
    print("  " + "─" * (len(hdr) - 2))
    for r in group_results:
        flag = " ★" if r["T3_f1"] == group_results[0]["T3_f1"] else ""
        print(f"  {r['name']:<30} {r['n']:>3}  {r['acc']:>6.4f}  "
              f"{r['T1_f1']:>6.4f}  {r['T2_f1']:>6.4f}  {r['T3_f1']:>6.4f}  "
              f"{r['T4_f1']:>6.4f}  {r['T3_p']:>6.4f}  {r['T3_r']:>6.4f}{flag}")

    best_group = group_results[0]
    print(f"\n  ★ Mejor grupo: \"{best_group['name']}\"")
    print(f"    Features: {best_group['feats']}")
    print(f"   {print_row(best_group)}")

    # ══════════════════════════════════════════════════════════
    #  OPTION A — Backward elimination
    # ══════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("  OPTION A — BACKWARD ELIMINATION")
    print("=" * 70)
    print(f"  {'Step':<5}  {'Dropped feature':<22}  {'Features left':>13}  "
          f"{'T3_f1':>6}  {'T2_f1':>6}  {'acc':>6}")
    print("  " + "─" * 67)

    remaining  = list(range(len(ACTIVE_NAMES)))
    best_t3    = -1
    best_step  = None

    # Baseline (all 12)
    baseline = _train(X_tr, y_tr, X_te, y_te)
    print(f"  {'0':<5}  {'(baseline)':<22}  {len(remaining):>13}  "
          f"{baseline['T3_f1']:>6.4f}  {baseline['T2_f1']:>6.4f}  {baseline['acc']:>6.4f}")
    if baseline["T3_f1"] > best_t3:
        best_t3   = baseline["T3_f1"]
        best_step = {"step": 0, "features": remaining[:], **baseline}

    for step in range(1, len(ACTIVE_NAMES)):
        if len(remaining) <= 1:
            break

        jobs = [(i, remaining, X_tr, y_tr, X_te, y_te) for i in remaining]

        step_results = []
        with ProcessPoolExecutor(max_workers=workers) as exe:
            futs = {exe.submit(_worker_drop, j): j for j in jobs}
            for f in as_completed(futs):
                step_results.append(f.result())

        # Pick the drop that maximizes T3 F1
        step_results.sort(key=lambda r: r["T3_f1"], reverse=True)
        winner = step_results[0]

        dropped_name = ACTIVE_NAMES[winner["dropped"]]
        remaining    = winner["subset"]

        flag = " ★ nuevo máximo" if winner["T3_f1"] > best_t3 else ""
        print(f"  {step:<5}  {f'- {dropped_name}':<22}  {len(remaining):>13}  "
              f"{winner['T3_f1']:>6.4f}  {winner['T2_f1']:>6.4f}  "
              f"{winner['acc']:>6.4f}{flag}")

        if winner["T3_f1"] > best_t3:
            best_t3   = winner["T3_f1"]
            best_step = {"step": step,
                         "features": [ACTIVE_NAMES[i] for i in remaining],
                         **winner}

    print(f"\n  ★ Mejor punto de eliminación: paso {best_step['step']}")
    print(f"    Features ({len(best_step['features'])}): {best_step['features']}")
    print(f"   {print_row(best_step)}")


if __name__ == "__main__":
    main()
