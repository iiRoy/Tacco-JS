"""
Hyperparameter sweep for the Random Forest clone classifier.

Modes:
  --file-split  (default) Use the cache's train/unseen split as-is.
                Train on X, evaluate on X_unseen — same as RandomForest.py.
  --random-split          Combine all data and split 80/20 by pairs.

Parallelism: combinations run in parallel (one RF per core, n_jobs=1 per tree).
"""
import argparse
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

CLASS_LABELS = [1, 2, 3, 4]
RANDOM_STATE = 42
TEST_SIZE    = 0.15   # only used in --random-split mode

GRID = {
    "n_estimators"    : [200, 500],
    "criterion"       : ["gini", "entropy"],
    "max_features"    : ["sqrt", 0.5, None],
    "class_weight"    : [
        None,
        "balanced",
        {1: 1, 2: 1, 3: 2, 4: 1},
        {1: 1, 2: 1, 3: 3, 4: 1},
        {1: 1, 2: 1, 3: 4, 4: 1},
    ],
    "min_samples_leaf": [1, 2],
}


def label_cw(cw):
    if cw is None:       return "None"
    if cw == "balanced": return "balanced"
    return f"T3x{cw[3]}"


def _run_combo(args):
    params, X_train_sc, y_train, X_test_sc, y_test = args
    clf = RandomForestClassifier(
        n_estimators      = params["n_estimators"],
        criterion         = params["criterion"],
        max_features      = params["max_features"],
        class_weight      = params["class_weight"],
        min_samples_leaf  = params["min_samples_leaf"],
        n_jobs=1,           # 1 per RF — outer loop is already parallelized
        random_state=RANDOM_STATE,
    )
    clf.fit(X_train_sc, y_train)
    y_pred = clf.predict(X_test_sc)
    report = classification_report(y_test, y_pred, labels=CLASS_LABELS,
                                   output_dict=True, zero_division=0)
    return {
        "n_est": params["n_estimators"],
        "crit" : params["criterion"],
        "mf"   : str(params["max_features"]),
        "cw"   : label_cw(params["class_weight"]),
        "msl"  : params["min_samples_leaf"],
        "acc"  : accuracy_score(y_test, y_pred),
        "T1_f1": report[str(1)]["f1-score"],
        "T2_f1": report[str(2)]["f1-score"],
        "T3_f1": report[str(3)]["f1-score"],
        "T4_f1": report[str(4)]["f1-score"],
        "T3_p" : report[str(3)]["precision"],
        "T3_r" : report[str(3)]["recall"],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--random-split", action="store_true",
                        help="Combine all data and split 80/20 by pairs instead of using the cache split.")
    args = parser.parse_args()

    if not FEATURE_CACHE.exists():
        print("[ERROR] Cache not found. Run RandomForest.py --rebuild-cache first.")
        return

    data = np.load(FEATURE_CACHE, allow_pickle=False)
    active_idx = [i for i, n in enumerate(METRIC_NAMES) if n not in EXCLUDE_METRICS]

    if args.random_split:
        X_all = np.concatenate([data["X"], data["X_unseen"]], axis=0)[:, active_idx]
        y_all = np.concatenate([data["y"], data["y_unseen"]], axis=0)
        X_train, X_test, y_train, y_test = train_test_split(
            X_all, y_all, test_size=0.20, random_state=RANDOM_STATE, stratify=y_all,
        )
        mode_label = "random 80/20 split"
    else:
        X_train = data["X"][:, active_idx]
        y_train = data["y"]
        X_test  = data["X_unseen"][:, active_idx]
        y_test  = data["y_unseen"]
        # internal train/test split within the training pool (same as RandomForest.py)
        X_train, _, y_train, _ = train_test_split(
            X_train, y_train, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_train,
        )
        mode_label = "file-based split (train pool → unseen)"

    print(f"Mode   : {mode_label}")
    print(f"Train  : {len(y_train)} pairs")
    print(f"Test   : {len(y_test)} pairs")
    for lbl in CLASS_LABELS:
        print(f"  Type {lbl}: train={int((y_train==lbl).sum())}  test={int((y_test==lbl).sum())}")
    print(f"Features: {X_train.shape[1]}\n")

    scaler     = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    import os
    keys   = list(GRID.keys())
    combos = [dict(zip(keys, c)) for c in itertools.product(*GRID.values())]
    total  = len(combos)
    workers = os.cpu_count() or 4
    print(f"Combinations : {total}")
    print(f"Workers      : {workers}\n")

    jobs = [(p, X_train_sc, y_train, X_test_sc, y_test) for p in combos]

    results  = []
    done     = 0
    with ProcessPoolExecutor(max_workers=workers) as exe:
        futures = {exe.submit(_run_combo, job): job for job in jobs}
        for fut in as_completed(futures):
            results.append(fut.result())
            done += 1
            if done % 20 == 0 or done == total:
                print(f"  {done}/{total}")

    results.sort(key=lambda r: r["T3_f1"], reverse=True)

    hdr = (f"{'#':>3}  {'n_est':>5}  {'crit':>7}  {'mf':>5}  {'cw':>9}  "
           f"{'msl':>3}  {'acc':>6}  "
           f"{'T1_f1':>6}  {'T2_f1':>6}  {'T3_f1':>6}  {'T4_f1':>6}  "
           f"{'T3_p':>6}  {'T3_r':>6}")
    sep = "=" * len(hdr)
    print(f"\n{sep}")
    print(f"  ALL COMBINATIONS — sorted by T3 F1  [{mode_label}]")
    print(sep)
    print(hdr)
    print("─" * len(hdr))
    for rank, r in enumerate(results, 1):
        flag = "  ★" if r["T3_f1"] >= 0.80 else ""
        print(
            f"{rank:>3}  {r['n_est']:>5}  {r['crit']:>7}  {r['mf']:>5}  "
            f"{r['cw']:>9}  {r['msl']:>3}  {r['acc']:>6.4f}  "
            f"{r['T1_f1']:>6.4f}  {r['T2_f1']:>6.4f}  {r['T3_f1']:>6.4f}  "
            f"{r['T4_f1']:>6.4f}  {r['T3_p']:>6.4f}  {r['T3_r']:>6.4f}{flag}"
        )

    print(f"\n{sep}")
    print("  TOP 5  (highest T3 F1)")
    print(sep)
    for r in results[:5]:
        print(f"  n_est={r['n_est']}  crit={r['crit']}  mf={r['mf']}  "
              f"cw={r['cw']}  msl={r['msl']}")
        print(f"    acc={r['acc']:.4f}  T1={r['T1_f1']:.4f}  T2={r['T2_f1']:.4f}  "
              f"T3={r['T3_f1']:.4f} (p={r['T3_p']:.4f} r={r['T3_r']:.4f})  "
              f"T4={r['T4_f1']:.4f}")


if __name__ == "__main__":
    main()
