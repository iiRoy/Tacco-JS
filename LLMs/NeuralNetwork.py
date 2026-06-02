import json
import random
import subprocess
import argparse
import joblib
import os
import time
import numpy as np
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR   = Path("dataset/dataset solutions/js_files")
CLONES_DIR = Path("dataset/dataset solutions/clones")

CACHE_DIR     = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "mlp_features_cache.npz"
META_CACHE    = CACHE_DIR / "mlp_features_meta.json"

CLONE_TYPES      = [1, 2, 3, 4]
COMPARE_MODE     = 3  # 1=type, 2=value, 3=type-value
TRAIN_FILE_RATIO = 0.80
TEST_SIZE        = 0.15
RANDOM_STATE     = 42

# MLP architecture — hidden layers tuple, e.g. (64,) or (128, 64)
MLP_HIDDEN_LAYERS  = (128, 64)
MLP_ACTIVATION     = "relu"      # 'relu' | 'tanh' | 'logistic'
MLP_SOLVER         = "adam"      # 'adam' | 'sgd' | 'lbfgs'
MLP_ALPHA          = 1e-4        # L2 regularization on weights
MLP_LEARNING_RATE  = 1e-3        # Initial learning rate (adam/sgd)
MLP_MAX_ITER       = 500
MLP_EARLY_STOPPING = True        # Hold out 10% of train for early stopping
MLP_BATCH_SIZE     = "auto"

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
    "CFGNodeCountRatio", "CFGEdgeCountRatio", "CFGPathSimilarity",
]

# Features to exclude from training (cache stores all 34; changing this list
# does not require rebuilding the cache).
EXCLUDE_METRICS: list[str] = [
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "IR_LabelCountRatio", "IR_JumpCountRatio", "IR_AssignCountRatio",
    "IR_CallCountRatio", "IR_RetCountRatio", "IR_TempCountRatio",
    "IR_FunctionCountRatio", "IR_BranchDensity_A", "IR_BranchDensity_B",
    "IR_BranchDensityDiff",
    "Jaro", "JaroWinkler", "Overlap", "LCSRatio", "VocabularyRatio",
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


# Top-level so ProcessPoolExecutor can pickle it
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
                print(f"  [MISSING] {clone_stem}.js")
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

    np.savez_compressed(
        FEATURE_CACHE,
        X=X, y=y,
        X_unseen=X_unseen, y_unseen=y_unseen,
    )

    with open(META_CACHE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "pair_meta": pair_meta,
                "meta_unseen": meta_unseen,
                "config": {
                    "clone_types": CLONE_TYPES,
                    "compare_mode": COMPARE_MODE,
                    "train_file_ratio": TRAIN_FILE_RATIO,
                    "test_size": TEST_SIZE,
                    "random_state": RANDOM_STATE,
                    "class_names": CLASS_NAMES,
                },
            },
            f, indent=2,
        )

    print(f"\n  Cache saved:")
    print(f"    {FEATURE_CACHE}")
    print(f"    {META_CACHE}")


def load_cache():
    data = np.load(FEATURE_CACHE, allow_pickle=False)

    with open(META_CACHE, "r", encoding="utf-8") as f:
        meta = json.load(f)

    X           = data["X"]
    y           = data["y"]
    X_unseen    = data["X_unseen"]
    y_unseen    = data["y_unseen"]
    pair_meta   = [tuple(item) for item in meta["pair_meta"]]
    meta_unseen = [tuple(item) for item in meta["meta_unseen"]]

    print(f"\n  Cache loaded:")
    print(f"    {FEATURE_CACHE}")
    print(f"    {META_CACHE}")

    return X, y, pair_meta, X_unseen, y_unseen, meta_unseen


# ─────────────────────────────────────────────
#  Output Helpers
# ─────────────────────────────────────────────

def _verdict_line(base, clone, ctype, feats, pred, truth=None) -> str:
    j  = feats[METRIC_NAMES.index("Jaccard")]
    d  = feats[METRIC_NAMES.index("Dice")]
    co = feats[METRIC_NAMES.index("Cosine")]
    lv = feats[METRIC_NAMES.index("LevenshteinRatio")]

    verdict  = "clean" if pred == 0 else f"PLAGIARIZED/T{pred}"
    pair_tag = f"[T{ctype}]" if ctype > 0 else "[neg]"

    row = (f"  {base:<22} {clone:<30} {pair_tag:<7} "
           f"J:{j:.3f} D:{d:.3f} Cos:{co:.3f} Lev:{lv:.3f}  "
           f"{verdict:<16}")

    if truth is not None:
        true_v = "clean" if truth == 0 else f"PLAGIARIZED/T{truth}"
        flag   = "OK" if pred == truth else "WRONG"
        row   += f"  truth:{true_v:<16} {flag}"

    return row


def _print_header(with_truth=False):
    h = (f"  {'Base':<22} {'Clone':<30} {'Type':<7} "
         f"{'Jaccard':>9} {'Dice':>7} {'Cosine':>8} {'Levenshtn':>10}  "
         f"{'Verdict':<16}")
    if with_truth:
        h += "  Truth"
    print(h)
    print("  " + "-" * (len(h) + 4))


def _print_confusion(cm):
    labels = ["Type1", "Type2", "Type3", "Type4"]
    print(f"  {'':>14} " + " ".join(f"{l:>8}" for l in labels))
    for i, name in enumerate(labels):
        print(f"  {name:<14} " + " ".join(f"{cm[i, j]:>8}" for j in range(4)))


# ─────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────

def train_and_evaluate(
    X: np.ndarray, y: np.ndarray, pair_meta: list,
    X_unseen: np.ndarray, y_unseen: np.ndarray, meta_unseen: list,
    show_tables: bool,
):
    # ── Feature selection ──────────────────────────────────────
    active_names = [n for n in METRIC_NAMES if n not in EXCLUDE_METRICS]
    active_idx   = [i for i, n in enumerate(METRIC_NAMES) if n not in EXCLUDE_METRICS]
    if EXCLUDE_METRICS:
        print(f"\n  Excluded features  : {EXCLUDE_METRICS}")
        X        = X[:, active_idx]
        X_unseen = X_unseen[:, active_idx] if len(X_unseen) > 0 else X_unseen
    else:
        active_names = METRIC_NAMES

    n_feats = X.shape[1]

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    for label, name in zip(CLASS_LABELS, CLASS_NAMES):
        print(f"    {name:<14}: {int((y == label).sum())}")
    print(f"  Features ({n_feats})  : {active_names}")
    print(f"  Compare mode     : {COMPARE_MODE}")
    print(f"\n  MLP config:")
    print(f"    hidden_layers  : {MLP_HIDDEN_LAYERS}")
    print(f"    activation     : {MLP_ACTIVATION}")
    print(f"    solver         : {MLP_SOLVER}  lr={MLP_LEARNING_RATE}")
    print(f"    alpha (L2)     : {MLP_ALPHA}")
    print(f"    max_iter       : {MLP_MAX_ITER}")
    print(f"    early_stopping : {MLP_EARLY_STOPPING}")

    if len(set(y)) < 2:
        print("\n[WARNING] Only one class present — cannot train.")
        return

    # ── Split ──────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # ── Scale (mandatory for MLP) ──────────────────────────────
    scaler     = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # ── MLP ────────────────────────────────────────────────────
    clf = MLPClassifier(
        hidden_layer_sizes  = MLP_HIDDEN_LAYERS,
        activation          = MLP_ACTIVATION,
        solver              = MLP_SOLVER,
        alpha               = MLP_ALPHA,
        learning_rate_init  = MLP_LEARNING_RATE,
        max_iter            = MLP_MAX_ITER,
        early_stopping      = MLP_EARLY_STOPPING,
        validation_fraction = 0.1,
        batch_size          = MLP_BATCH_SIZE,
        random_state        = RANDOM_STATE,
        verbose             = False,
    )

    print("\n" + "=" * 65)
    print(f"  TRAINING  (MLP {MLP_HIDDEN_LAYERS} — {n_feats} features, 4 classes)")
    print("=" * 65)
    t0 = time.perf_counter()
    clf.fit(X_train_sc, y_train)
    print(f"  Training completed in {time.perf_counter() - t0:.2f}s.  "
          f"Epochs run: {clf.n_iter_}")

    if MLP_EARLY_STOPPING:
        print(f"  Best validation score: {clf.best_validation_score_:.4f}")

    # ── Save model ─────────────────────────────────────────────
    SCRIPT_DIR = Path(__file__).resolve().parent
    model_dir  = SCRIPT_DIR / "Models"
    model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"model": clf, "scaler": scaler,
         "metric_names": METRIC_NAMES, "class_names": CLASS_NAMES},
        model_dir / "neural_network_model.joblib",
    )
    print(f"  Modelo guardado en: {model_dir / 'neural_network_model.joblib'}")

    # ── Evaluation ─────────────────────────────────────────────
    y_pred = clf.predict(X_test_sc)
    y_prob = clf.predict_proba(X_test_sc)

    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set — 4 classes)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred,
                                labels=CLASS_LABELS,
                                target_names=CLASS_NAMES,
                                zero_division=0))

    cm = confusion_matrix(y_test, y_pred, labels=CLASS_LABELS)
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    _print_confusion(cm)

    print("\n  Accuracy by clone type (test pairs):")
    for ctype in CLONE_TYPES:
        ct_idx = [i for i, idx in enumerate(idx_test) if pair_meta[idx][2] == ctype]
        if not ct_idx:
            print(f"    Type {ctype}: no test pairs")
            continue
        acc = accuracy_score(y_test[ct_idx], y_pred[ct_idx])
        print(f"    Type {ctype}: {len(ct_idx)} pairs  accuracy={acc:.4f}")

    # ── Layer weight summary ───────────────────────────────────
    print("\n  Network layer shapes:")
    for i, (W, b) in enumerate(zip(clf.coefs_, clf.intercepts_)):
        print(f"    Layer {i+1}: weights {W.shape}  biases {b.shape}")

    # ── Loss curve ─────────────────────────────────────────────
    curve = clf.loss_curve_
    print(f"\n  Loss curve — first/last 3 iterations:")
    head = list(range(min(3, len(curve))))
    tail = list(range(max(3, len(curve) - 3), len(curve)))
    for i in head:
        print(f"    iter {i+1:>4}: loss={curve[i]:.6f}")
    if len(curve) > 6:
        print("    ...")
    for i in tail:
        print(f"    iter {i+1:>4}: loss={curve[i]:.6f}")

    # ── Most confident predictions (top 3 per class) ───────────
    print("\n  Most confident predictions (top 3 per class):")
    for c, cname in enumerate(CLASS_NAMES):
        prob_col = y_prob[:, c]
        top_idx  = np.argsort(prob_col)[::-1][:3]
        print(f"  {cname}:")
        for rank, i in enumerate(top_idx, 1):
            idx    = idx_test[i]
            base, clone, ctype = pair_meta[idx]
            verdict = CLASS_NAMES[y_pred[i] - 1]
            print(f"    #{rank}  {base} vs {clone}  "
                  f"P={prob_col[i]:.4f}  → {verdict}")

    if show_tables:
        # ── Per-pair test detail ───────────────────────────────────
        print("\n" + "=" * 65)
        print("  PER-PAIR RESULTS  (internal test set)")
        print("=" * 65)
        _print_header(with_truth=True)
        for i, idx in enumerate(idx_test):
            base, clone, ctype = pair_meta[idx]
            print(_verdict_line(base, clone, ctype, X[idx], y_pred[i], truth=y_test[i]))

        # ── Full training pool table ───────────────────────────────
        print("\n" + "=" * 65)
        print("  FULL PREDICTION TABLE  (training pool)")
        print("=" * 65)
        all_pred = clf.predict(scaler.transform(X))
        _print_header(with_truth=False)
        for i, (base, clone, ctype) in enumerate(pair_meta):
            print(_verdict_line(base, clone, ctype, X[i], all_pred[i]))

    # ── Unseen pool predictions ────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  "
              f"(remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(scaler.transform(X_unseen))

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : "
                  f"{accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,
                                        labels=CLASS_LABELS,
                                        target_names=CLASS_NAMES,
                                        zero_division=0))
            cm_u = confusion_matrix(y_unseen, unseen_pred, labels=CLASS_LABELS)
            _print_confusion(cm_u)
        else:
            print("  (Only one class in unseen labels — skipping metrics)\n")

        if show_tables:
            _print_header(with_truth=True)
            for i, (base, clone, ctype) in enumerate(meta_unseen):
                print(_verdict_line(base, clone, ctype, X_unseen[i],
                                    unseen_pred[i], truth=y_unseen[i]))

    # ── Final accuracy summary ─────────────────────────────────
    print("\n" + "=" * 65)
    print("  FINAL ACCURACY SUMMARY  (MLP)")
    print("=" * 65)
    acc_train = accuracy_score(y_train, clf.predict(X_train_sc))
    acc_test  = accuracy_score(y_test,  y_pred)
    print(f"  Entrenamiento (datos vistos)          : {acc_train:.4f}"
          f"  ← esperable ~1.0, el modelo memorizó")
    print(f"  Validación interna (15% del 80%)      : {acc_test:.4f}"
          f"  ← holdout interno, ajuste del modelo")
    if len(X_unseen) > 0:
        acc_unseen = accuracy_score(
            y_unseen, clf.predict(scaler.transform(X_unseen))
        )
        print(f"  Unseen (20% archivos separados)       : {acc_unseen:.4f}"
              f"  ← evaluación real, nunca visto")


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global MLP_HIDDEN_LAYERS, MLP_ACTIVATION, MLP_SOLVER
    global MLP_ALPHA, MLP_LEARNING_RATE, MLP_MAX_ITER, MLP_EARLY_STOPPING
    global TRAIN_FILE_RATIO

    parser = argparse.ArgumentParser(
        description="Plagiarism detector — MLP Neural Network, 34-feature compare.js."
    )
    parser.add_argument("--hidden-layers",      type=str,   default="128,64",
                        help="Hidden layer sizes, e.g. '128,64' (default: 128,64).")
    parser.add_argument("--activation",         type=str,   default=MLP_ACTIVATION,
                        choices=["relu", "tanh", "logistic"])
    parser.add_argument("--alpha",              type=float, default=MLP_ALPHA)
    parser.add_argument("--lr",                 type=float, default=MLP_LEARNING_RATE)
    parser.add_argument("--max-iter",           type=int,   default=MLP_MAX_ITER)
    parser.add_argument("--no-early-stopping",  action="store_true")
    parser.add_argument("--train-ratio",        type=float, default=TRAIN_FILE_RATIO)
    parser.add_argument("--workers",            type=int,   default=os.cpu_count() or 4,
                        help="Parallel workers for JS comparisons. Default: CPU count.")
    parser.add_argument("--use-cache",          action="store_true",
                        help="Load features from cache instead of rebuilding them.")
    parser.add_argument("--save-cache",         action="store_true",
                        help="Save generated features to cache.")
    parser.add_argument("--rebuild-cache",      action="store_true",
                        help="Ignore existing cache and rebuild features.")
    parser.add_argument("--show-tables",        action="store_true",
                        help="Print long per-pair prediction tables.")
    args = parser.parse_args()

    MLP_HIDDEN_LAYERS  = tuple(int(x) for x in args.hidden_layers.split(","))
    MLP_ACTIVATION     = args.activation
    MLP_ALPHA          = args.alpha
    MLP_LEARNING_RATE  = args.lr
    MLP_MAX_ITER       = args.max_iter
    MLP_EARLY_STOPPING = not args.no_early_stopping
    TRAIN_FILE_RATIO   = args.train_ratio

    if not COMPARE_JS.exists():
        print(f"\n[ERROR] compare.js not found: {COMPARE_JS}")
        return
    if not BASE_DIR.exists():
        print(f"\n[ERROR] Base directory not found: {BASE_DIR}")
        return
    if not CLONES_DIR.exists():
        print(f"\n[ERROR] Clones directory not found: {CLONES_DIR}")
        return

    if args.use_cache and not args.rebuild_cache:
        if FEATURE_CACHE.exists() and META_CACHE.exists():
            X, y, pair_meta, X_unseen, y_unseen, meta_unseen = load_cache()
            train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen,
                               show_tables=args.show_tables)
            print("\n[DONE]\n")
            return
        print("\n[WARNING] Cache not found. Rebuilding features.")

    all_base_stems = sorted(p.stem for p in BASE_DIR.glob("*.js"))
    if not all_base_stems:
        print("\n[ERROR] No base .js files found.")
        return

    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train      = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems  = all_base_stems[:n_train]
    unseen_stems = all_base_stems[n_train:]

    print("\n" + "=" * 65)
    print("  FILE SPLIT")
    print("=" * 65)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO*100):>2}%)  : {len(train_stems)} files")
    print(f"  Unseen pool   ({int((1-TRAIN_FILE_RATIO)*100):>2}%)  : {len(unseen_stems)} files")

    print("\n" + "=" * 65)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO*100)}% of files)")
    print("=" * 65)
    X, y, pair_meta = build_dataset(train_stems, CLONES_DIR, workers=args.workers)

    if len(X) == 0:
        print("\n[ERROR] No pairs built. Check clone filenames: <base>_clon_<1|2|3|4>.js")
        return

    print("\n" + "=" * 65)
    print(f"  BUILDING UNSEEN DATASET  (remaining {int((1-TRAIN_FILE_RATIO)*100)}% of files)")
    print("=" * 65)
    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_stems, CLONES_DIR, workers=args.workers)

    if args.save_cache or args.rebuild_cache:
        save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)

    train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen,
                       show_tables=args.show_tables)
    print("\n[DONE]\n")


if __name__ == "__main__":
    main()
