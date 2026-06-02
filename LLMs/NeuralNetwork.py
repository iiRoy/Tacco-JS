#python NeuralNetwork.py --rebuild-cache --save-cache
import argparse
import csv
import json
import os
import random
import subprocess
import time
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed

import joblib
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

# ------------------------------------------------------------
# Paths
# ------------------------------------------------------------

COMPARE_JS = Path("../Vectorization/compare.js")
BASE_DIR = Path("../dataset/dataset solutions/js_files")
CLONES_DIR = Path("../dataset/dataset solutions/clones")

CACHE_DIR = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "mlp_features_cache.npz"
META_CACHE = CACHE_DIR / "mlp_features_meta.json"

# Optional: reuse the RandomForest feature cache when it was built with the
# same strict 20-feature vector.
RF_FEATURE_CACHE = CACHE_DIR / "rf_features_cache.npz"
RF_META_CACHE = CACHE_DIR / "rf_features_meta.json"

REPORT_DIR = Path("Reports")
MODEL_DIR_NAME = "Models"

CLONE_TYPES = [1, 2, 3, 4]
COMPARE_MODE = 3  # 1=type, 2=value, 3=type-value
COMPARE_TIMEOUT = 30
TRAIN_FILE_RATIO = 0.80
TEST_SIZE = 0.15
RANDOM_STATE = 42

# ------------------------------------------------------------
# MLP hyperparameters
# ------------------------------------------------------------

MLP_HIDDEN_LAYERS = (128, 64)
MLP_ACTIVATION = "relu"      # relu | tanh | logistic
MLP_SOLVER = "adam"          # adam | sgd | lbfgs
MLP_ALPHA = 1e-4             # L2 regularization
MLP_LEARNING_RATE = 1e-3
MLP_MAX_ITER = 500
MLP_EARLY_STOPPING = True
MLP_BATCH_SIZE = "auto"

# ------------------------------------------------------------
# Features
# Must match Vectorization/similarity.js SELECTED_METRIC_NAMES exactly.
# This is the official 20-metric vector used by the current RF/XGBoost setup.
# ------------------------------------------------------------

METRIC_NAMES = [
    "Jaccard",
    "Dice",
    "LevenshteinRatio",
    "Cosine",
    "LCSRatio",
    "NgramJaccard",
    "NgramDice",
    "LengthRatio",
    "VocabularyRatio",
    "IR_InstrCountRatio",
    "IR_BranchCountRatio",
    "IR_CallCountRatio",
    "IR_FunctionCountRatio",
    "IR_BranchDensityDiff",
    "NormASTJaccard",
    "NormASTLCSRatio",
    "NormASTCosine",
    "CFG_NodeCountRatio",
    "CFG_EdgeCountRatio",
    "CFG_CyclomaticRatio",
]

# Keep empty for the official baseline. You can edit this list to experiment
# without rebuilding the cache, as long as the cache itself was built with the
# strict 20 features above.
EXCLUDE_METRICS: list[str] = []

CLASS_NAMES = ["Type 1 (1)", "Type 2 (2)", "Type 3 (3)", "Type 4 (4)"]
CLASS_LABELS = [1, 2, 3, 4]


def normalize_feature_vector(feats: list[float]) -> list[float]:
    """Require the strict 20-feature vector used by Vectorization/similarity.js."""
    if len(feats) != len(METRIC_NAMES):
        raise ValueError(
            f"Expected {len(METRIC_NAMES)} selected features, got {len(feats)}. "
            "Your Vectorization/similarity.js is not using the same 20-metric vector, "
            "or your cache is old. Delete .cache and rebuild."
        )
    arr = np.asarray(feats, dtype=float)
    arr = np.nan_to_num(arr, nan=0.0, posinf=1.0, neginf=0.0)
    return arr.tolist()


def normalize_feature_matrix(X: np.ndarray) -> np.ndarray:
    """Require cached matrices to match the strict 20-feature vector."""
    if X.size == 0:
        return np.empty((0, len(METRIC_NAMES)), dtype=float)
    if X.ndim != 2 or X.shape[1] != len(METRIC_NAMES):
        got = X.shape[1] if X.ndim == 2 else "unknown"
        raise ValueError(
            f"Unsupported feature width {got}. Expected {len(METRIC_NAMES)}. "
            "Delete the old feature cache and rebuild."
        )
    X = X.astype(float, copy=False)
    return np.nan_to_num(X, nan=0.0, posinf=1.0, neginf=0.0)


# ------------------------------------------------------------
# compare.js bridge
# ------------------------------------------------------------

def compare_with_js(file_a: Path, file_b: Path) -> list[float]:
    if not COMPARE_JS.exists():
        raise FileNotFoundError(f"compare.js not found: {COMPARE_JS}")
    try:
        result = subprocess.run(
            ["node", str(COMPARE_JS), str(file_a), str(file_b), str(COMPARE_MODE)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=COMPARE_TIMEOUT,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {file_a.name} vs {file_b.name} - skipping")
        return []

    if result.returncode != 0:
        print(
            f"  [JS ERROR] {file_a.name} vs {file_b.name}: "
            f"{result.stderr.strip()[:160]}"
        )
        return []

    try:
        raw_feats = json.loads(result.stdout.strip())
        return normalize_feature_vector(raw_feats)
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"  [PARSE ERROR] {file_a.name} vs {file_b.name}: {exc}")
        return []


# Top-level so ProcessPoolExecutor can pickle it.
def compute_pair(job: tuple):
    base_stem, clone_stem, ctype = job
    file_b = BASE_DIR / f"{base_stem}.js"
    file_c = CLONES_DIR / f"{clone_stem}.js"

    feats = compare_with_js(file_b, file_c)
    if not feats:
        return None
    return feats, int(ctype), (base_stem, clone_stem, int(ctype))


# ------------------------------------------------------------
# Dataset construction
# ------------------------------------------------------------

def build_jobs(base_stems: list[str], clones_dir: Path) -> tuple[list[tuple], int]:
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


def build_dataset(base_stems: list[str], clones_dir: Path, workers: int) -> tuple[np.ndarray, np.ndarray, list]:
    start = time.perf_counter()
    X, y, pair_meta = [], [], []

    jobs, skipped_missing = build_jobs(base_stems, clones_dir)
    if not jobs:
        return np.empty((0, len(METRIC_NAMES))), np.array([], dtype=int), pair_meta

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

    if not X:
        return np.empty((0, len(METRIC_NAMES))), np.array([], dtype=int), pair_meta
    return normalize_feature_matrix(np.asarray(X, dtype=float)), np.asarray(y, dtype=int), pair_meta


# ------------------------------------------------------------
# Cache
# ------------------------------------------------------------

def save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(FEATURE_CACHE, X=X, y=y, X_unseen=X_unseen, y_unseen=y_unseen)
    with open(META_CACHE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "pair_meta": pair_meta,
                "meta_unseen": meta_unseen,
                "config": {
                    "clone_types": CLONE_TYPES,
                    "compare_mode": COMPARE_MODE,
                    "compare_timeout": COMPARE_TIMEOUT,
                    "train_file_ratio": TRAIN_FILE_RATIO,
                    "test_size": TEST_SIZE,
                    "random_state": RANDOM_STATE,
                    "class_names": CLASS_NAMES,
                    "metric_names": METRIC_NAMES,
                    "selected_metric_count": len(METRIC_NAMES),
                    "model": "MLPClassifier",
                },
            },
            f,
            indent=2,
        )
    print("\n  Cache saved:")
    print(f"    {FEATURE_CACHE}")
    print(f"    {META_CACHE}")


def load_cache(feature_cache: Path = FEATURE_CACHE, meta_cache: Path = META_CACHE):
    data = np.load(feature_cache, allow_pickle=False)
    with open(meta_cache, "r", encoding="utf-8") as f:
        meta = json.load(f)

    X = normalize_feature_matrix(data["X"])
    y = data["y"]
    X_unseen = normalize_feature_matrix(data["X_unseen"])
    y_unseen = data["y_unseen"]
    pair_meta = [tuple(item) for item in meta["pair_meta"]]
    meta_unseen = [tuple(item) for item in meta["meta_unseen"]]

    print("\n  Cache loaded:")
    print(f"    {feature_cache}")
    print(f"    {meta_cache}")
    return X, y, pair_meta, X_unseen, y_unseen, meta_unseen


# ------------------------------------------------------------
# Output helpers
# ------------------------------------------------------------

def _print_confusion(cm: np.ndarray):
    labels = ["Type1", "Type2", "Type3", "Type4"]
    print(f"  {'':>14} " + " ".join(f"{label:>8}" for label in labels))
    for i, name in enumerate(labels):
        print(f"  {name:<14} " + " ".join(f"{cm[i, j]:>8}" for j in range(4)))


def _verdict_line(base: str, clone: str, ctype: int, feats: np.ndarray, pred: int, truth: int | None = None) -> str:
    j = feats[METRIC_NAMES.index("Jaccard")]
    d = feats[METRIC_NAMES.index("Dice")]
    co = feats[METRIC_NAMES.index("Cosine")]
    lv = feats[METRIC_NAMES.index("LevenshteinRatio")]
    row = (
        f"  {base:<22} {clone:<30} [T{ctype}]  "
        f"J:{j:.3f} D:{d:.3f} Cos:{co:.3f} Lev:{lv:.3f}  pred:T{pred}"
    )
    if truth is not None:
        flag = "OK" if pred == truth else "WRONG"
        row += f"  truth:T{truth}  {flag}"
    return row


def sanitize_report_tag(tag: str) -> str:
    safe = []
    for ch in tag.lower():
        safe.append(ch if ch.isalnum() else "_")
    return "".join(safe).strip("_") or "report"


def full_class_probabilities(clf: MLPClassifier, X: np.ndarray) -> np.ndarray:
    """Return probability columns in fixed Type1..Type4 order."""
    raw = clf.predict_proba(X)
    full = np.zeros((raw.shape[0], len(CLASS_LABELS)), dtype=float)
    class_to_col = {int(cls): i for i, cls in enumerate(clf.classes_)}
    for out_idx, label in enumerate(CLASS_LABELS):
        if label in class_to_col:
            full[:, out_idx] = raw[:, class_to_col[label]]
    return full


def write_t3_t4_margin_report(tag: str, y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray, metas: list[tuple]):
    if y_prob is None or len(y_prob) == 0:
        return
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORT_DIR / f"t3_t4_margin_report_{sanitize_report_tag(tag)}__mlp.csv"

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "base", "clone", "truth", "predicted", "is_error",
            "p_type1", "p_type2", "p_type3", "p_type4",
            "margin_abs", "confidence", "EVALUATION", "review_reason",
        ])
        for i, meta in enumerate(metas):
            base, clone, _ctype = meta
            probs = y_prob[i]
            p3 = float(probs[2])
            p4 = float(probs[3])
            writer.writerow([
                base,
                clone,
                int(y_true[i]),
                int(y_pred[i]),
                bool(y_true[i] != y_pred[i]),
                float(probs[0]),
                float(probs[1]),
                p3,
                p4,
                abs(p3 - p4),
                float(np.max(probs)),
                "",
                "",
            ])
    print(f"  T3/T4 margin report saved: {path}")


def print_accuracy_by_type(y_true: np.ndarray, y_pred: np.ndarray):
    print("\n  Accuracy by clone type:")
    for ctype in CLASS_LABELS:
        mask = y_true == ctype
        if mask.sum() == 0:
            print(f"    Type {ctype}: no pairs")
            continue
        print(f"    Type {ctype}: {int(mask.sum())} pairs  accuracy={accuracy_score(y_true[mask], y_pred[mask]):.4f}")


# ------------------------------------------------------------
# Training and evaluation
# ------------------------------------------------------------

def train_and_evaluate(
    X: np.ndarray,
    y: np.ndarray,
    pair_meta: list[tuple],
    X_unseen: np.ndarray,
    y_unseen: np.ndarray,
    meta_unseen: list[tuple],
    show_tables: bool = False,
):
    active_idx = [i for i, name in enumerate(METRIC_NAMES) if name not in EXCLUDE_METRICS]
    active_names = [METRIC_NAMES[i] for i in active_idx]
    X_act = X[:, active_idx]
    X_unseen_act = X_unseen[:, active_idx] if len(X_unseen) else X_unseen

    has_unseen = len(X_unseen_act) > 0
    n_feats = X_act.shape[1]

    print("\n" + "=" * 78)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO * 100)}% of base files)")
    print("=" * 78)
    print(f"  Total pairs loaded : {len(y)}")
    for lbl in CLASS_LABELS:
        print(f"    {CLASS_NAMES[lbl - 1]:<14}: {int((y == lbl).sum())}")
    print(f"  Features ({n_feats})  : {active_names}")
    print(f"  Compare mode     : {COMPARE_MODE}")
    print("\n  MLP config:")
    print(f"    hidden_layers  : {MLP_HIDDEN_LAYERS}")
    print(f"    activation     : {MLP_ACTIVATION}")
    print(f"    solver         : {MLP_SOLVER}")
    print(f"    alpha          : {MLP_ALPHA}")
    print(f"    learning_rate  : {MLP_LEARNING_RATE}")
    print(f"    max_iter       : {MLP_MAX_ITER}")
    print(f"    early_stopping : {MLP_EARLY_STOPPING}")

    if len(set(y)) < 2:
        print("\n[WARNING] Less than 2 classes in data - cannot train.")
        return None

    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X_act,
        y,
        indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc = scaler.transform(X_test)

    clf = MLPClassifier(
        hidden_layer_sizes=MLP_HIDDEN_LAYERS,
        activation=MLP_ACTIVATION,
        solver=MLP_SOLVER,
        alpha=MLP_ALPHA,
        learning_rate_init=MLP_LEARNING_RATE,
        max_iter=MLP_MAX_ITER,
        early_stopping=MLP_EARLY_STOPPING,
        validation_fraction=0.1,
        batch_size=MLP_BATCH_SIZE,
        random_state=RANDOM_STATE,
        verbose=False,
    )

    print("\n" + "=" * 78)
    print(f"  TRAINING  (MLP {MLP_HIDDEN_LAYERS} - {n_feats} features  4 classes)")
    print("=" * 78)
    t0 = time.perf_counter()
    clf.fit(X_train_sc, y_train)
    print(f"  Training completed in {time.perf_counter() - t0:.2f}s. Epochs run: {clf.n_iter_}")
    if MLP_EARLY_STOPPING and hasattr(clf, "best_validation_score_"):
        print(f"  Best validation score: {clf.best_validation_score_:.4f}")

    script_dir = Path(__file__).resolve().parent
    model_dir = script_dir / MODEL_DIR_NAME
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "neural_network_model.joblib"
    joblib.dump(
        {
            "model": clf,
            "scaler": scaler,
            "metric_names": active_names,
            "exclude_metrics": EXCLUDE_METRICS,
            "class_names": CLASS_NAMES,
            "model_type": "MLPClassifier",
        },
        model_path,
    )
    print(f"  Modelo guardado en: {model_path}")

    # Internal validation
    y_pred = clf.predict(X_test_sc)
    y_prob = full_class_probabilities(clf, X_test_sc)
    test_metas = [pair_meta[idx] for idx in idx_test]

    print("\n" + "=" * 78)
    print("  EVALUATION  (internal test set - 4 classes)")
    print("=" * 78)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(
        classification_report(
            y_test,
            y_pred,
            labels=CLASS_LABELS,
            target_names=CLASS_NAMES,
            zero_division=0,
        )
    )
    cm = confusion_matrix(y_test, y_pred, labels=CLASS_LABELS)
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    _print_confusion(cm)
    print_accuracy_by_type(y_test, y_pred)
    write_t3_t4_margin_report("evaluation_internal_test_set", y_test, y_pred, y_prob, test_metas)

    print("\n  Network layer shapes:")
    for i, (weights, biases) in enumerate(zip(clf.coefs_, clf.intercepts_)):
        print(f"    Layer {i + 1}: weights {weights.shape}  biases {biases.shape}")

    if getattr(clf, "loss_curve_", None):
        curve = clf.loss_curve_
        print("\n  Loss curve - first/last 3 iterations:")
        head = list(range(min(3, len(curve))))
        tail = list(range(max(3, len(curve) - 3), len(curve)))
        for i in head:
            print(f"    iter {i + 1:>4}: loss={curve[i]:.6f}")
        if len(curve) > 6:
            print("    ...")
        for i in tail:
            print(f"    iter {i + 1:>4}: loss={curve[i]:.6f}")

    print("\n  Most confident predictions (top 3 per class):")
    for c, cname in enumerate(CLASS_NAMES):
        prob_col = y_prob[:, c]
        top_idx = np.argsort(prob_col)[::-1][:3]
        print(f"  {cname}:")
        for rank, i in enumerate(top_idx, 1):
            idx = idx_test[i]
            base, clone, _ctype = pair_meta[idx]
            print(f"    #{rank}  {base} vs {clone}  P={prob_col[i]:.4f}  -> Type {int(y_pred[i])}")

    if show_tables:
        print("\n" + "=" * 78)
        print("  PER-PAIR RESULTS  (internal test set)")
        print("=" * 78)
        for i, idx in enumerate(idx_test):
            base, clone, ctype = pair_meta[idx]
            print(_verdict_line(base, clone, ctype, X[idx], int(y_pred[i]), truth=int(y_test[i])))

    # Unseen file pool
    unseen_pred = None
    if has_unseen:
        X_unseen_sc = scaler.transform(X_unseen_act)
        unseen_pred = clf.predict(X_unseen_sc)
        unseen_prob = full_class_probabilities(clf, X_unseen_sc)
        print("\n" + "=" * 78)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1 - TRAIN_FILE_RATIO) * 100)}%)")
        print("=" * 78)
        print(f"  Accuracy : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
        print(
            classification_report(
                y_unseen,
                unseen_pred,
                labels=CLASS_LABELS,
                target_names=CLASS_NAMES,
                zero_division=0,
            )
        )
        cm_u = confusion_matrix(y_unseen, unseen_pred, labels=CLASS_LABELS)
        _print_confusion(cm_u)
        print_accuracy_by_type(y_unseen, unseen_pred)
        write_t3_t4_margin_report("unseen_files_predictions", y_unseen, unseen_pred, unseen_prob, meta_unseen)

        if show_tables:
            print("\n" + "=" * 78)
            print("  PER-PAIR RESULTS  (unseen files)")
            print("=" * 78)
            for i, (base, clone, ctype) in enumerate(meta_unseen):
                print(_verdict_line(base, clone, ctype, X_unseen[i], int(unseen_pred[i]), truth=int(y_unseen[i])))

    acc_train = accuracy_score(y_train, clf.predict(X_train_sc))
    acc_test = accuracy_score(y_test, y_pred)

    print("\n" + "=" * 78)
    print("  FINAL ACCURACY SUMMARY")
    print("=" * 78)
    print(f"  Entrenamiento (datos vistos)          : {acc_train:.4f}  <- revisar sobreajuste")
    print(f"  Validacion interna (15% del 80%)      : {acc_test:.4f}  <- holdout interno")
    if has_unseen and unseen_pred is not None:
        print(f"  Unseen (20% archivos separados)       : {accuracy_score(y_unseen, unseen_pred):.4f}  <- evaluacion real")

    return clf


# ------------------------------------------------------------
# Entry point
# ------------------------------------------------------------

def main():
    global TRAIN_FILE_RATIO, COMPARE_TIMEOUT
    global MLP_HIDDEN_LAYERS, MLP_ACTIVATION, MLP_SOLVER
    global MLP_ALPHA, MLP_LEARNING_RATE, MLP_MAX_ITER, MLP_EARLY_STOPPING

    parser = argparse.ArgumentParser(
        description="MLP Neural Network clone classifier - compatible with the current 20-feature Tacco JS vector."
    )
    parser.add_argument("--hidden-layers", type=str, default="128,64", help="Hidden layer sizes, e.g. 128,64")
    parser.add_argument("--activation", type=str, default=MLP_ACTIVATION, choices=["relu", "tanh", "logistic"])
    parser.add_argument("--solver", type=str, default=MLP_SOLVER, choices=["adam", "sgd", "lbfgs"])
    parser.add_argument("--alpha", type=float, default=MLP_ALPHA)
    parser.add_argument("--lr", type=float, default=MLP_LEARNING_RATE)
    parser.add_argument("--max-iter", type=int, default=MLP_MAX_ITER)
    parser.add_argument("--no-early-stopping", action="store_true")
    parser.add_argument("--train-ratio", type=float, default=TRAIN_FILE_RATIO)
    parser.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    parser.add_argument("--compare-timeout", type=int, default=COMPARE_TIMEOUT)
    parser.add_argument("--use-cache", action="store_true", help="Load MLP feature cache instead of rebuilding.")
    parser.add_argument("--use-rf-cache", action="store_true", help="Reuse .cache/rf_features_cache.npz if it has the same 20 features.")
    parser.add_argument("--save-cache", action="store_true")
    parser.add_argument("--rebuild-cache", action="store_true")
    parser.add_argument("--show-tables", action="store_true")
    args = parser.parse_args()

    MLP_HIDDEN_LAYERS = tuple(int(x.strip()) for x in args.hidden_layers.split(",") if x.strip())
    MLP_ACTIVATION = args.activation
    MLP_SOLVER = args.solver
    MLP_ALPHA = args.alpha
    MLP_LEARNING_RATE = args.lr
    MLP_MAX_ITER = args.max_iter
    MLP_EARLY_STOPPING = not args.no_early_stopping
    TRAIN_FILE_RATIO = args.train_ratio
    COMPARE_TIMEOUT = args.compare_timeout

    if not COMPARE_JS.exists():
        print(f"\n[ERROR] compare.js not found: {COMPARE_JS}")
        print("Place compare.js in Vectorization/compare.js or run from the project root.")
        return
    if not BASE_DIR.exists():
        print(f"\n[ERROR] Base directory not found: {BASE_DIR}")
        return
    if not CLONES_DIR.exists():
        print(f"\n[ERROR] Clones directory not found: {CLONES_DIR}")
        return

    if args.use_rf_cache and not args.rebuild_cache:
        if RF_FEATURE_CACHE.exists() and RF_META_CACHE.exists():
            X, y, pair_meta, X_unseen, y_unseen, meta_unseen = load_cache(RF_FEATURE_CACHE, RF_META_CACHE)
            train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen, show_tables=args.show_tables)
            print("\n[DONE]\n")
            return
        print("\n[WARNING] RF cache not found. Rebuilding MLP features.")

    if args.use_cache and not args.rebuild_cache:
        if FEATURE_CACHE.exists() and META_CACHE.exists():
            X, y, pair_meta, X_unseen, y_unseen, meta_unseen = load_cache()
            train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen, show_tables=args.show_tables)
            print("\n[DONE]\n")
            return
        print("\n[WARNING] MLP cache not found. Rebuilding features.")

    all_base_stems = sorted(p.stem for p in BASE_DIR.glob("*.js"))
    if not all_base_stems:
        print("\n[ERROR] No base .js files found.")
        return

    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems = all_base_stems[:n_train]
    unseen_stems = all_base_stems[n_train:]

    print("\n" + "=" * 78)
    print("  FILE SPLIT")
    print("=" * 78)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO * 100):>2}%)  : {len(train_stems)} files")
    print(f"  Unseen pool   ({int((1 - TRAIN_FILE_RATIO) * 100):>2}%)  : {len(unseen_stems)} files")

    print("\n" + "=" * 78)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO * 100)}% of files)")
    print("=" * 78)
    X, y, pair_meta = build_dataset(train_stems, CLONES_DIR, workers=args.workers)
    if len(X) == 0:
        print("\n[ERROR] No pairs built. Check clone filenames: <base>_clon_<1|2|3|4>.js")
        return

    print("\n" + "=" * 78)
    print(f"  BUILDING UNSEEN DATASET  (remaining {int((1 - TRAIN_FILE_RATIO) * 100)}% of files)")
    print("=" * 78)
    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_stems, CLONES_DIR, workers=args.workers)

    if args.save_cache or args.rebuild_cache:
        save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)

    train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen, show_tables=args.show_tables)
    print("\n[DONE]\n")


if __name__ == "__main__":
    main()
