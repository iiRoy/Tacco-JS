import json
import random
import subprocess
import argparse
import time
import os
import numpy as np

from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR   = Path("dataset/dataset solutions/js_files")
CLONES_DIR = Path("dataset/dataset solutions/clones")

CACHE_DIR     = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "xgb_features_cache.npz"
META_CACHE    = CACHE_DIR / "xgb_features_meta.json"

CLONE_TYPES      = [1, 2, 3, 4]
COMPARE_MODE     = 3  # 1=type, 2=value, 3=type-value
TRAIN_FILE_RATIO = 0.80
TEST_SIZE        = 0.15
RANDOM_STATE     = 42

# XGBoost hyperparameters
XGB_N_ESTIMATORS   = 500
XGB_LEARNING_RATE  = 0.05
XGB_MAX_DEPTH      = 6
XGB_SUBSAMPLE      = 0.8
XGB_COLSAMPLE      = 0.8
XGB_REG_LAMBDA     = 1.0

# ─────────────────────────────────────────────
#  Features  (16 lexical + 12 IR + 3 NormAST + 3 CFG = 34 total)
# ─────────────────────────────────────────────

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

EXCLUDE_METRICS: list[str] = [
    "Jaro", "JaroWinkler", "Overlap",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "IR_InstrCountRatio", "IR_LabelCountRatio", "IR_BranchCountRatio",
    "IR_JumpCountRatio", "IR_AssignCountRatio", "IR_CallCountRatio",
    "IR_RetCountRatio", "IR_TempCountRatio", "IR_FunctionCountRatio",
    "IR_BranchDensity_A", "IR_BranchDensity_B", "IR_BranchDensityDiff",
]

CLASS_NAMES  = ["Type 1 (1)", "Type 2 (2)", "Type 3 (3)", "Type 4 (4)"]
CLASS_LABELS = [1, 2, 3, 4]

# ─────────────────────────────────────────────
#  Compare.js
# ─────────────────────────────────────────────

def compare_with_js(file_a: Path, file_b: Path) -> list:
    if not COMPARE_JS.exists():
        raise FileNotFoundError(f"compare.js not found: {COMPARE_JS}")
    try:
        result = subprocess.run(
            ["node", str(COMPARE_JS), str(file_a), str(file_b), str(COMPARE_MODE)],
            capture_output=True, text=True,
            encoding="utf-8", errors="ignore", timeout=30,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {file_a.name} vs {file_b.name} — skipping")
        return []

    if result.returncode != 0:
        print(f"  [JS ERROR] {file_a.name} vs {file_b.name}: "
              f"{result.stderr.strip()[:120]}")
        return []

    try:
        feats = json.loads(result.stdout.strip())
        if len(feats) != len(METRIC_NAMES):
            print(f"  [WARN] Expected {len(METRIC_NAMES)} features, "
                  f"got {len(feats)} for {file_a.name} vs {file_b.name}")
            return []
        return [float(f) for f in feats]
    except (json.JSONDecodeError, ValueError) as e:
        print(f"  [PARSE ERROR] {file_a.name} vs {file_b.name}: {e}")
        return []


def compute_pair(job: tuple):
    base_stem, clone_stem, ctype = job
    file_b = BASE_DIR / f"{base_stem}.js"
    file_c = CLONES_DIR / f"{clone_stem}.js"
    feats = compare_with_js(file_b, file_c)
    if not feats:
        return None
    return feats, int(ctype), (base_stem, clone_stem, ctype)

# ─────────────────────────────────────────────
#  Dataset Construction
# ─────────────────────────────────────────────

def build_jobs(base_stems: list, clones_dir: Path) -> tuple:
    jobs = []
    skipped_missing = 0
    for base_stem in base_stems:
        for ctype in CLONE_TYPES:
            clone_stem = f"{base_stem}_clon_{ctype}"
            if not (clones_dir / f"{clone_stem}.js").exists():
                skipped_missing += 1
                continue
            jobs.append((base_stem, clone_stem, ctype))
    return jobs, skipped_missing


def build_dataset(base_stems: list, clones_dir: Path, workers: int) -> tuple:
    start = time.perf_counter()
    X, y, pair_meta = [], [], []

    jobs, skipped_missing = build_jobs(base_stems, clones_dir)
    if not jobs:
        return np.array(X), np.array(y), pair_meta

    print(f"\n  JS comparisons to run : {len(jobs)}")
    print(f"  Parallel workers      : {workers}")

    skipped_failed = 0
    completed = 0
    total = len(jobs)

    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(compute_pair, job) for job in jobs]
        for future in as_completed(futures):
            completed += 1
            try:
                result = future.result()
            except Exception as exc:
                print(f"  [WORKER ERROR] {exc}")
                skipped_failed += 1
                continue
            if result is None:
                skipped_failed += 1
                continue
            feats, label, meta = result
            X.append(feats)
            y.append(label)
            pair_meta.append(meta)
            if completed % 100 == 0 or completed == total:
                print(f"  Progress: {completed}/{total}")

    elapsed = time.perf_counter() - start
    print(f"\n  Clone pairs built  : {len(pair_meta)}")
    print(f"  Skipped missing    : {skipped_missing}")
    print(f"  Skipped failed     : {skipped_failed}")
    print(f"  Dataset build time : {elapsed:.2f}s")

    return np.array(X, dtype=float), np.array(y, dtype=int), pair_meta

# ─────────────────────────────────────────────
#  Cache
# ─────────────────────────────────────────────

def save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(FEATURE_CACHE, X=X, y=y, X_unseen=X_unseen, y_unseen=y_unseen)
    with open(META_CACHE, "w", encoding="utf-8") as f:
        json.dump({"pair_meta": pair_meta, "meta_unseen": meta_unseen}, f, indent=2)
    print(f"\n  Cache saved: {FEATURE_CACHE}")


def load_cache():
    data = np.load(FEATURE_CACHE, allow_pickle=False)
    with open(META_CACHE, "r", encoding="utf-8") as f:
        meta = json.load(f)
    pair_meta    = [tuple(item) for item in meta["pair_meta"]]
    meta_unseen  = [tuple(item) for item in meta["meta_unseen"]]
    print(f"  Cache loaded: {FEATURE_CACHE}")
    return data["X"], data["y"], pair_meta, data["X_unseen"], data["y_unseen"], meta_unseen

# ─────────────────────────────────────────────
#  Output Helpers
# ─────────────────────────────────────────────

def _print_confusion(cm):
    labels = ["Type1", "Type2", "Type3", "Type4"]
    print(f"  {'':>14} " + " ".join(f"{l:>8}" for l in labels))
    for i, name in enumerate(labels):
        print(f"  {name:<14} " + " ".join(f"{cm[i, j]:>8}" for j in range(4)))


# ─────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────

def train_and_evaluate(X, y, X_unseen, y_unseen):
    active_idx = [i for i, n in enumerate(METRIC_NAMES) if n not in EXCLUDE_METRICS]
    X_act        = X[:, active_idx]
    X_unseen_act = X_unseen[:, active_idx]

    print("\n" + "=" * 65)
    print(f"  DATASET SUMMARY  ({int(TRAIN_FILE_RATIO * 100)}% train files)")
    print("=" * 65)
    print(f"  Total pairs loaded : {len(y)}")
    for lbl in CLASS_LABELS:
        print(f"    Type {lbl}: {int((y == lbl).sum())}")
    print(f"  Unseen pairs       : {len(y_unseen)}")
    print(f"  Active features    : {len(active_idx)} / {len(METRIC_NAMES)}")

    X_train, X_val, y_train, y_val = train_test_split(
        X_act, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y,
    )

    # XGBoost requires 0-indexed labels internally
    y_train_xgb  = y_train - 1
    y_val_xgb    = y_val - 1
    y_unseen_xgb = y_unseen - 1

    clf = XGBClassifier(
        n_estimators      = XGB_N_ESTIMATORS,
        learning_rate     = XGB_LEARNING_RATE,
        max_depth         = XGB_MAX_DEPTH,
        subsample         = XGB_SUBSAMPLE,
        colsample_bytree  = XGB_COLSAMPLE,
        reg_lambda        = XGB_REG_LAMBDA,
        objective         = "multi:softmax",
        num_class         = 4,
        eval_metric       = "mlogloss",
        random_state      = RANDOM_STATE,
        verbosity         = 0,
        n_jobs            = -1,
        tree_method       = "hist",
    )

    print("\n" + "=" * 65)
    print(f"  XGBoost config:")
    print(f"    n_estimators   : {XGB_N_ESTIMATORS}")
    print(f"    learning_rate  : {XGB_LEARNING_RATE}")
    print(f"    max_depth      : {XGB_MAX_DEPTH}")
    print(f"    subsample      : {XGB_SUBSAMPLE}")
    print(f"    colsample_tree : {XGB_COLSAMPLE}")
    print(f"    reg_lambda     : {XGB_REG_LAMBDA}")
    print(f"    objective      : multi:softmax  (4 clases)")
    print(f"    tree_method    : hist")

    print("\n" + "=" * 65)
    print(f"  TRAINING  (XGBoost — {len(active_idx)} features, 4 classes)")
    print("=" * 65)
    t0 = time.perf_counter()
    clf.fit(X_train, y_train_xgb, eval_set=[(X_val, y_val_xgb)], verbose=False)
    print(f"  Training completed in {time.perf_counter() - t0:.2f}s.")

    active_names = [n for n in METRIC_NAMES if n not in EXCLUDE_METRICS]

    # ── Internal validation ────────────────────────────────────
    y_pred = clf.predict(X_val) + 1
    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set — 4 classes)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_val, y_pred):.4f}\n")
    print(classification_report(y_val, y_pred,
                                target_names=CLASS_NAMES,
                                labels=CLASS_LABELS, zero_division=0))

    cm = confusion_matrix(y_val, y_pred, labels=CLASS_LABELS)
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    _print_confusion(cm)

    print("\n  Accuracy by clone type (test pairs):")
    for ctype in CLASS_LABELS:
        mask = y_val == ctype
        if mask.sum() == 0:
            continue
        acc = accuracy_score(y_val[mask], y_pred[mask])
        print(f"    Type {ctype}: {int(mask.sum())} pairs  accuracy={acc:.4f}")

    # ── Feature importances ────────────────────────────────────
    importances = clf.feature_importances_
    sorted_idx  = np.argsort(importances)[::-1]
    print("\n  Feature importances:")
    for i in sorted_idx:
        bar = "█" * int(importances[i] * 40)
        print(f"    {active_names[i]:<22} {importances[i]:.4f}  {bar}")

    # ── Unseen evaluation ──────────────────────────────────────
    if len(X_unseen_act) > 0:
        unseen_pred = clf.predict(X_unseen_act) + 1
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1 - TRAIN_FILE_RATIO) * 100)}%)")
        print("=" * 65)
        print(f"  Accuracy : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
        print(classification_report(y_unseen, unseen_pred,
                                    target_names=CLASS_NAMES,
                                    labels=CLASS_LABELS, zero_division=0))
        cm_u = confusion_matrix(y_unseen, unseen_pred, labels=CLASS_LABELS)
        _print_confusion(cm_u)

    # ── Final accuracy summary ─────────────────────────────────
    acc_train = accuracy_score(y_train, clf.predict(X_train) + 1)
    acc_test  = accuracy_score(y_val, y_pred)
    print("\n" + "=" * 65)
    print("  FINAL ACCURACY SUMMARY")
    print("=" * 65)
    print(f"  Entrenamiento (datos vistos)          : {acc_train:.4f}  ← esperable ~1.0")
    print(f"  Validación interna (15% del 80%)      : {acc_test:.4f}  ← holdout interno")
    if len(X_unseen_act) > 0:
        print(f"  Unseen (20% archivos separados)       : {accuracy_score(y_unseen, unseen_pred):.4f}  ← evaluación real")

    return clf

# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global TRAIN_FILE_RATIO

    parser = argparse.ArgumentParser(description="XGBoost clone classifier — 34 JS metrics.")
    parser.add_argument("--train-ratio",   type=float, default=TRAIN_FILE_RATIO)
    parser.add_argument("--workers",       type=int,   default=os.cpu_count() or 4)
    parser.add_argument("--use-cache",     action="store_true")
    parser.add_argument("--save-cache",    action="store_true")
    parser.add_argument("--rebuild-cache", action="store_true")
    args = parser.parse_args()

    TRAIN_FILE_RATIO = args.train_ratio

    if args.use_cache and not args.rebuild_cache:
        if FEATURE_CACHE.exists() and META_CACHE.exists():
            X, y, _, X_unseen, y_unseen, _ = load_cache()
            train_and_evaluate(X, y, X_unseen, y_unseen)
            print("\n[DONE]\n")
            return
        print("[WARNING] Cache not found. Rebuilding features.")

    all_base_stems = sorted(p.stem for p in BASE_DIR.glob("*.js"))
    if not all_base_stems:
        print("[ERROR] No base .js files found.")
        return

    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems  = all_base_stems[:n_train]
    unseen_stems = all_base_stems[n_train:]

    print(f"  Total base files : {len(all_base_stems)}")
    print(f"  Train pool       : {len(train_stems)}")
    print(f"  Unseen pool      : {len(unseen_stems)}")

    X, y, pair_meta = build_dataset(train_stems, CLONES_DIR, args.workers)
    if len(X) == 0:
        print("[ERROR] No pairs built.")
        return

    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_stems, CLONES_DIR, args.workers)

    if args.save_cache or args.rebuild_cache:
        save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)

    train_and_evaluate(X, y, X_unseen, y_unseen)
    print("\n[DONE]\n")


if __name__ == "__main__":
    main()
