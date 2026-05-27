"""
Threshold sweep for rule-based pre-classification (T1 and T2 rules).

Logic:
  1. If Jaccard >= T1_thresh            → predict T1  (rule)
  2. Elif NormASTJaccard >= T2_thresh   → predict T2  (rule)
  3. Else                               → RF predicts T3 or T4

RF uses the best hyperparameters found by rf_sweep.py.
Sorted by T3 F1 to find the thresholds that best free the RF to focus on T3/T4.
"""
import itertools
import numpy as np
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report

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

# Indices after exclusion
ACTIVE_NAMES = [n for n in METRIC_NAMES if n not in EXCLUDE_METRICS]
JAC_IDX      = ACTIVE_NAMES.index("Jaccard")
NORM_JAC_IDX = ACTIVE_NAMES.index("NormASTJaccard")

CLASS_LABELS = [1, 2, 3, 4]
RANDOM_STATE = 42
TEST_SIZE    = 0.15

# Best RF config from sweep
RF_PARAMS = dict(
    n_estimators  = 200,
    criterion     = "entropy",
    max_features  = "sqrt",
    class_weight  = {1: 1, 2: 1, 3: 2, 4: 1},
    min_samples_leaf = 1,
    n_jobs        = 1,
    random_state  = RANDOM_STATE,
)

# ── Threshold grid ─────────────────────────────────────────────
T1_THRESHOLDS = [0.90, 0.92, 0.95, 0.97, 0.99]
T2_THRESHOLDS = [None, 0.80, 0.85, 0.90, 0.93, 0.95, 0.97, 0.99]
# None = no T2 rule (RF handles T2/T3/T4)


def _run(args):
    t1_thresh, t2_thresh, X_train, y_train, X_test, y_test = args

    # ── Apply rules on training data ──────────────────────────
    t1_train = X_train[:, JAC_IDX] >= t1_thresh
    if t2_thresh is not None:
        t2_train = (~t1_train) & (X_train[:, NORM_JAC_IDX] >= t2_thresh)
    else:
        t2_train = np.zeros(len(y_train), dtype=bool)

    rf_mask_train = ~t1_train & ~t2_train
    X_rf_train = X_train[rf_mask_train]
    y_rf_train = y_train[rf_mask_train]

    if len(np.unique(y_rf_train)) < 2:
        return None

    scaler = StandardScaler()
    X_rf_train_sc = scaler.fit_transform(X_rf_train)

    clf = RandomForestClassifier(**RF_PARAMS)
    clf.fit(X_rf_train_sc, y_rf_train)

    # ── Apply rules on test data ───────────────────────────────
    t1_test = X_test[:, JAC_IDX] >= t1_thresh
    if t2_thresh is not None:
        t2_test = (~t1_test) & (X_test[:, NORM_JAC_IDX] >= t2_thresh)
    else:
        t2_test = np.zeros(len(y_test), dtype=bool)

    rf_mask_test = ~t1_test & ~t2_test
    X_rf_test = X_test[rf_mask_test]
    y_rf_test  = y_test[rf_mask_test]

    y_pred_full = np.zeros(len(y_test), dtype=int)
    y_pred_full[t1_test]  = 1
    y_pred_full[t2_test]  = 2
    if len(X_rf_test) > 0:
        y_pred_full[rf_mask_test] = clf.predict(scaler.transform(X_rf_test))

    report = classification_report(y_test, y_pred_full, labels=CLASS_LABELS,
                                   output_dict=True, zero_division=0)

    # Rule accuracy on test
    t1_acc = float((y_test[t1_test] == 1).mean()) if t1_test.sum() > 0 else 1.0
    t2_acc = float((y_test[t2_test] == 2).mean()) if t2_test.sum() > 0 else 1.0

    return {
        "t1_thresh" : t1_thresh,
        "t2_thresh" : t2_thresh if t2_thresh is not None else "-",
        "t1_rule_n" : int(t1_test.sum()),
        "t2_rule_n" : int(t2_test.sum()),
        "t1_rule_acc": t1_acc,
        "t2_rule_acc": t2_acc,
        "acc"  : accuracy_score(y_test, y_pred_full),
        "T1_f1": report[str(1)]["f1-score"],
        "T2_f1": report[str(2)]["f1-score"],
        "T3_f1": report[str(3)]["f1-score"],
        "T4_f1": report[str(4)]["f1-score"],
        "T3_p" : report[str(3)]["precision"],
        "T3_r" : report[str(3)]["recall"],
    }


def main():
    import os
    if not FEATURE_CACHE.exists():
        print("[ERROR] Cache not found.")
        return

    data = np.load(FEATURE_CACHE, allow_pickle=False)
    active_idx = [i for i, n in enumerate(METRIC_NAMES) if n not in EXCLUDE_METRICS]

    X_train_all = data["X"][:, active_idx]
    y_train_all = data["y"]
    X_test      = data["X_unseen"][:, active_idx]
    y_test      = data["y_unseen"]

    X_train, _, y_train, _ = train_test_split(
        X_train_all, y_train_all,
        test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_train_all,
    )

    print(f"Train: {len(y_train)}  Test (unseen): {len(y_test)}")
    print(f"T1 thresholds : {T1_THRESHOLDS}")
    print(f"T2 thresholds : {T2_THRESHOLDS}")

    combos = list(itertools.product(T1_THRESHOLDS, T2_THRESHOLDS))
    jobs   = [(t1, t2, X_train, y_train, X_test, y_test) for t1, t2 in combos]
    total  = len(jobs)
    print(f"Combinations  : {total}  |  Workers: {os.cpu_count() or 4}\n")

    results = []
    done = 0
    with ProcessPoolExecutor(max_workers=os.cpu_count() or 4) as exe:
        futures = {exe.submit(_run, job): job for job in jobs}
        for fut in as_completed(futures):
            r = fut.result()
            if r is not None:
                results.append(r)
            done += 1
            if done % 10 == 0 or done == total:
                print(f"  {done}/{total}")

    results.sort(key=lambda r: r["T3_f1"], reverse=True)

    hdr = (f"{'#':>3}  {'T1thr':>5}  {'T2thr':>5}  "
           f"{'T1_n':>5}  {'T1_acc':>6}  {'T2_n':>5}  {'T2_acc':>6}  "
           f"{'acc':>6}  {'T1_f1':>6}  {'T2_f1':>6}  {'T3_f1':>6}  {'T4_f1':>6}  "
           f"{'T3_p':>6}  {'T3_r':>6}")
    sep = "=" * len(hdr)
    print(f"\n{sep}")
    print("  RULE THRESHOLD SWEEP — sorted by T3 F1")
    print(sep)
    print(hdr)
    print("─" * len(hdr))
    for rank, r in enumerate(results, 1):
        flag = "  ★" if r["T3_f1"] >= 0.78 else ""
        print(
            f"{rank:>3}  {r['t1_thresh']:>5.2f}  {str(r['t2_thresh']):>5}  "
            f"{r['t1_rule_n']:>5}  {r['t1_rule_acc']:>6.4f}  "
            f"{r['t2_rule_n']:>5}  {r['t2_rule_acc']:>6.4f}  "
            f"{r['acc']:>6.4f}  {r['T1_f1']:>6.4f}  {r['T2_f1']:>6.4f}  "
            f"{r['T3_f1']:>6.4f}  {r['T4_f1']:>6.4f}  "
            f"{r['T3_p']:>6.4f}  {r['T3_r']:>6.4f}{flag}"
        )

    print(f"\n{sep}")
    print("  TOP 5")
    print(sep)
    for r in results[:5]:
        t2_str = f"NormASTJaccard >= {r['t2_thresh']}" if r['t2_thresh'] != "-" else "sin regla T2"
        print(f"  T1: Jaccard >= {r['t1_thresh']}  |  T2: {t2_str}")
        print(f"    T1 rule: {r['t1_rule_n']} pares (acc={r['t1_rule_acc']:.4f})  "
              f"T2 rule: {r['t2_rule_n']} pares (acc={r['t2_rule_acc']:.4f})")
        print(f"    acc={r['acc']:.4f}  T1={r['T1_f1']:.4f}  T2={r['T2_f1']:.4f}  "
              f"T3={r['T3_f1']:.4f} (p={r['T3_p']:.4f} r={r['T3_r']:.4f})  T4={r['T4_f1']:.4f}")


if __name__ == "__main__":
    main()
