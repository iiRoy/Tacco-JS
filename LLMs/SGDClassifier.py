import re
import subprocess
import argparse
import numpy as np
from pathlib import Path
from collections import Counter
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

TOKENIZER_JS = Path("Tokenizer/Tokenizer-Tokenizr.js")
BASE_DIR      = Path("dataset/dataset general/js_files")
CLONES_DIR    = Path("dataset/dataset general/clones")

CLONE_TYPES          = [1, 2, 3]
NGRAM_SIZES          = [1, 2, 3]
PLAGIARISM_THRESHOLD = 0.5
TRAIN_FILE_RATIO     = 0.10
TEST_SIZE            = 0.15
RANDOM_STATE         = 42

# Minkowski distance order (p=1 → Manhattan, p=2 → Euclidean)
MINKOWSKI_P = 2
# Gauss kernel bandwidth (sigma); controls how fast similarity decays with distance
GAUSS_SIGMA = 1.0

# SGD hyperparameters
SGD_LOSS          = "log_loss"  # 'log_loss' (Logistic) | 'hinge' (SVM) | 'modified_huber'
SGD_PENALTY       = "l2"        # 'l1' | 'l2' | 'elasticnet'
SGD_ALPHA         = 1e-4        # Regularization strength
SGD_MAX_ITER      = 1000
SGD_TOL           = 1e-3        # Convergence tolerance
SGD_LEARNING_RATE = "optimal"   # 'optimal' | 'adaptive' | 'constant' | 'invscaling'
SGD_ETA0          = 0.1         # Initial lr (used when learning_rate != 'optimal')
SGD_L1_RATIO      = 0.15        # ElasticNet mixing (only when penalty='elasticnet')

# ─────────────────────────────────────────────
#  JS Tokenizer
# ─────────────────────────────────────────────

_TOKEN_LINE = re.compile(r'^\[(\w+)\]\s+"(.*)"', re.MULTILINE)

def tokenize_with_js(filepath: Path) -> list:
    if not TOKENIZER_JS.exists():
        raise FileNotFoundError(f"Tokenizer not found: {TOKENIZER_JS}")
    try:
        result = subprocess.run(
            ["node", str(TOKENIZER_JS), str(filepath)],
            capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=30,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {filepath.name} — skipping")
        return []

    if result.returncode != 0:
        print(f"  [JS ERROR] {filepath.name}: {result.stderr.strip()[:120]}")
        return []

    tokens = []
    for match in _TOKEN_LINE.finditer(result.stdout):
        token_type  = match.group(1)
        token_value = match.group(2)
        if token_type == "EOF":
            continue
        tokens.append(f"{token_type}:{token_value}")
    return tokens


# ─────────────────────────────────────────────
#  N-gram Helpers
# ─────────────────────────────────────────────

def make_ngrams(tokens: list, n: int) -> set:
    if len(tokens) < n:
        return set()
    return set(zip(*[tokens[i:] for i in range(n)]))


def make_ngram_counts(tokens: list, n: int) -> Counter:
    """Frequency count of n-grams (needed for vector-based metrics)."""
    if len(tokens) < n:
        return Counter()
    return Counter(zip(*[tokens[i:] for i in range(n)]))


def file_ngram_data(tokens: list) -> dict:
    """
    Returns both set and count representations for each n-gram size.
    {n: {"set": set(...), "counts": Counter(...)}}
    """
    return {
        n: {
            "set":    make_ngrams(tokens, n),
            "counts": make_ngram_counts(tokens, n),
        }
        for n in NGRAM_SIZES
    }


# ─────────────────────────────────────────────
#  Similarity Metrics
# ─────────────────────────────────────────────

def jaccard(a: set, b: set) -> float:
    """Intersection over union of two n-gram sets."""
    if not a and not b:
        return 1.0
    union = len(a | b)
    return len(a & b) / union if union else 0.0


def dice(a: set, b: set) -> float:
    """
    Dice coefficient: 2|A∩B| / (|A|+|B|).
    Similar to Jaccard but weights shared elements more heavily.
    """
    if not a and not b:
        return 1.0
    denom = len(a) + len(b)
    return (2 * len(a & b)) / denom if denom else 0.0


def _aligned_vectors(ca: Counter, cb: Counter):
    """
    Build two aligned frequency arrays over the union vocabulary.
    Required for vector-space metrics (Gauss, Minkowski).
    """
    vocab = list(ca.keys() | cb.keys())
    va = np.array([ca.get(k, 0) for k in vocab], dtype=float)
    vb = np.array([cb.get(k, 0) for k in vocab], dtype=float)
    return va, vb


def gauss_kernel(ca: Counter, cb: Counter, sigma: float = GAUSS_SIGMA) -> float:
    """
    Gaussian (RBF) kernel: exp(-||va - vb||² / (2σ²)).
    Returns 1.0 when vectors are identical, approaches 0 as they diverge.
    """
    if not ca and not cb:
        return 1.0
    if not ca or not cb:
        return 0.0
    va, vb = _aligned_vectors(ca, cb)
    sq_dist = float(np.sum((va - vb) ** 2))
    return float(np.exp(-sq_dist / (2 * sigma ** 2)))


def minkowski_sim(ca: Counter, cb: Counter, p: int = MINKOWSKI_P) -> float:
    """
    Minkowski similarity: 1 / (1 + minkowski_distance(va, vb)).
    Distance of 0 → similarity 1.0; grows large → similarity approaches 0.
    """
    if not ca and not cb:
        return 1.0
    if not ca or not cb:
        return 0.0
    va, vb = _aligned_vectors(ca, cb)
    dist = float(np.sum(np.abs(va - vb) ** p) ** (1.0 / p))
    return 1.0 / (1.0 + dist)


# ─────────────────────────────────────────────
#  Feature Extraction  (4 metrics × 3 n-gram sizes = 12 features)
# ─────────────────────────────────────────────

METRIC_NAMES = ["Jaccard", "Dice", "Gauss", "Minkowski"]

def pair_features(data_a: dict, data_b: dict) -> list:
    """
    For every n-gram size, compute all 4 similarity scores.
    Returns a flat list of 12 floats.
    Feature order: [J1, D1, G1, M1, J2, D2, G2, M2, J3, D3, G3, M3]
    """
    feats = []
    for n in NGRAM_SIZES:
        sa, sb = data_a[n]["set"],    data_b[n]["set"]
        ca, cb = data_a[n]["counts"], data_b[n]["counts"]
        feats.append(jaccard(sa, sb))
        feats.append(dice(sa, sb))
        feats.append(gauss_kernel(ca, cb))
        feats.append(minkowski_sim(ca, cb))
    return feats


def avg_jaccard_only(feats: list) -> float:
    """Extract just the Jaccard scores (indices 0,4,8) and average them."""
    return float(np.mean([feats[n * 4] for n in range(len(NGRAM_SIZES))]))


# ─────────────────────────────────────────────
#  File Loading
# ─────────────────────────────────────────────

def load_js_files(folder: Path, label: str) -> dict:
    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")
    files = {}
    for fpath in sorted(folder.glob("*.js")):
        tokens = tokenize_with_js(fpath)
        if tokens:
            files[fpath.stem] = tokens
            print(f"  [LOADED {label}] {fpath.name}  ({len(tokens)} tokens)")
        else:
            print(f"  [EMPTY/SKIP]    {fpath.name}  (0 tokens returned)")
    return files


# ─────────────────────────────────────────────
#  Smart Pairing
# ─────────────────────────────────────────────

def build_dataset(base_files: dict, clone_files: dict):
    X, y, pair_meta = [], [], []

    ng_base   = {name: file_ngram_data(toks) for name, toks in base_files.items()}
    ng_clones = {name: file_ngram_data(toks) for name, toks in clone_files.items()}

    matched, skipped = 0, 0

    for base_stem, data_b in ng_base.items():
        for ctype in CLONE_TYPES:
            clone_stem = f"{base_stem}_clon_{ctype}"

            if clone_stem not in ng_clones:
                print(f"  [MISSING] {clone_stem}.js")
                skipped += 1
                continue

            feats = pair_features(data_b, ng_clones[clone_stem])
            avg_j = avg_jaccard_only(feats)
            label = 1 if avg_j >= PLAGIARISM_THRESHOLD else 0

            X.append(feats)
            y.append(label)
            pair_meta.append((base_stem, clone_stem, ctype))
            matched += 1

    print(f"  Pairs matched : {matched}  |  skipped : {skipped}")
    return np.array(X, dtype=float), np.array(y, dtype=int), pair_meta


# ─────────────────────────────────────────────
#  Result Formatting
# ─────────────────────────────────────────────

def _verdict_line(base, clone, ctype, feats, pred, truth=None) -> str:
    n = len(NGRAM_SIZES)
    j_avg = float(np.mean([feats[i * 4 + 0] for i in range(n)]))
    d_avg = float(np.mean([feats[i * 4 + 1] for i in range(n)]))
    g_avg = float(np.mean([feats[i * 4 + 2] for i in range(n)]))
    m_avg = float(np.mean([feats[i * 4 + 3] for i in range(n)]))

    verdict   = "PLAGIARIZED" if pred == 1 else "clean"
    clone_tag = f"[Type {ctype}]"

    row = (f"  {base:<25} {clone:<32} {clone_tag:<9} "
           f"J:{j_avg:.3f} D:{d_avg:.3f} G:{g_avg:.3f} M:{m_avg:.3f}  "
           f"{verdict:<12}")

    if truth is not None:
        true_l = "PLAGIARIZED" if truth == 1 else "clean"
        flag   = "OK" if pred == truth else "WRONG"
        row += f"  truth:{true_l:<12} {flag}"

    return row


def _print_header(with_truth=False):
    base_hdr = (f"  {'Base':<25} {'Clone':<32} {'CloneType':<9} "
                f"{'Jaccard':>9} {'Dice':>7} {'Gauss':>7} {'Minkowski':>10}  "
                f"{'Verdict':<12}")
    if with_truth:
        base_hdr += "  Truth"
    print(base_hdr)
    print("  " + "-" * (len(base_hdr) + 5))


# ─────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────

def train_and_evaluate(
    X: np.ndarray, y: np.ndarray, pair_meta: list,
    X_unseen: np.ndarray, y_unseen: np.ndarray, meta_unseen: list,
):
    n_metrics = len(METRIC_NAMES)
    n_feats   = len(NGRAM_SIZES) * n_metrics   # 12

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    print(f"  Plagiarized (1)  : {int(y.sum())}")
    print(f"  Clean (0)        : {int((y == 0).sum())}")
    print(f"  Features ({n_feats})    : {METRIC_NAMES} × n-grams {NGRAM_SIZES}")
    print(f"  Threshold        : {PLAGIARISM_THRESHOLD}  (on avg Jaccard)")
    print(f"\n  SGD config:")
    print(f"    loss          : {SGD_LOSS}")
    print(f"    penalty       : {SGD_PENALTY}  alpha={SGD_ALPHA}")
    print(f"    learning_rate : {SGD_LEARNING_RATE}  eta0={SGD_ETA0}")
    if SGD_PENALTY == "elasticnet":
        print(f"    l1_ratio      : {SGD_L1_RATIO}")

    print("\n  Pairs by clone type:")
    for ctype in CLONE_TYPES:
        idx = [i for i, (_, _, t) in enumerate(pair_meta) if t == ctype]
        plag = int(y[idx].sum()) if idx else 0
        print(f"    Type {ctype}: {len(idx)} pairs  ({plag} labeled plagiarized)")

    if len(set(y)) < 2:
        print("\n[WARNING] Only one class in labels — adjust --threshold.")
        _print_all_pairs(X, y, pair_meta)
        return

    # ── Split ──────────────────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # ── Scale — mandatory for SGD ───────────────────────────────────────────
    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # ── SGDClassifier ──────────────────────────────────────────────────────
    #
    #  Why SGD for clone detection?
    #  When the dataset grows (thousands of JS files), batch methods like SVM
    #  and logistic regression become slow. SGD scales linearly with samples
    #  and supports partial_fit() for incremental/streaming datasets — useful
    #  when new JS files arrive continuously in a pipeline.
    #
    #  loss='log_loss'     → equivalent to logistic regression, gives probabilities
    #  loss='hinge'        → equivalent to linear SVM, no probabilities
    #  loss='modified_huber' → robust to outliers, does give probabilities
    #
    clf = SGDClassifier(
        loss          = SGD_LOSS,
        penalty       = SGD_PENALTY,
        alpha         = SGD_ALPHA,
        l1_ratio      = SGD_L1_RATIO,
        max_iter      = SGD_MAX_ITER,
        tol           = SGD_TOL,
        learning_rate = SGD_LEARNING_RATE,
        eta0          = SGD_ETA0,
        shuffle       = True,
        n_jobs        = -1,
        random_state  = RANDOM_STATE,
    )

    print("\n" + "=" * 65)
    print(f"  TRAINING  (SGDClassifier loss={SGD_LOSS} — 12 features)")
    print("=" * 65)

    clf.fit(X_train_sc, y_train)

    print(f"  Training completed.  Iterations: {clf.n_iter_}")

    # ── Eval metrics ───────────────────────────────────────────────────────
    y_pred = clf.predict(X_test_sc)

    # predict_proba only available for log_loss and modified_huber
    has_proba = SGD_LOSS in ("log_loss", "modified_huber")
    if has_proba:
        y_prob = clf.predict_proba(X_test_sc)[:, 1]

    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred,
                                 target_names=["Clean (0)", "Plagiarized (1)"]))

    cm = confusion_matrix(y_test, y_pred)
    print("  Confusion Matrix:")
    print(f"               Pred Clean  Pred Plagiarized")
    print(f"  True Clean         {cm[0,0]:>5}            {cm[0,1]:>5}")
    print(f"  True Plagiarized   {cm[1,0]:>5}            {cm[1,1]:>5}")

    print("\n  Accuracy by clone type (test pairs):")
    for ctype in CLONE_TYPES:
        ct_idx = [i for i, idx in enumerate(idx_test) if pair_meta[idx][2] == ctype]
        if not ct_idx:
            print(f"    Type {ctype}: no test pairs")
            continue
        acc = accuracy_score(y_test[ct_idx], y_pred[ct_idx])
        print(f"    Type {ctype}: {len(ct_idx)} pairs  accuracy={acc:.4f}")

    # Learned coefficients
    if hasattr(clf, "coef_"):
        coefs = clf.coef_.flatten()
        feat_labels = [f"{m[0]}n{n}" for n in NGRAM_SIZES for m in METRIC_NAMES]
        sorted_idx  = np.argsort(np.abs(coefs))[::-1]
        print("\n  SGD feature weights (sorted by |weight|):")
        for i in sorted_idx[:8]:
            label = feat_labels[i] if i < len(feat_labels) else f"f{i}"
            print(f"    {label:<8}  {coefs[i]:+.4f}")

    # ── Online Learning demo with partial_fit ──────────────────────────────
    #
    #  Demonstrates incremental training: feed pairs one chunk at a time.
    #  Accuracy is tracked after each chunk to show convergence.
    #  This is the main advantage of SGD over all other models in this project.
    #
    print("\n" + "=" * 65)
    print("  ONLINE LEARNING DEMO  (partial_fit over training chunks)")
    print("=" * 65)

    chunk_size  = max(1, len(X_train_sc) // 5)
    sgd_online  = SGDClassifier(
        loss=SGD_LOSS, penalty=SGD_PENALTY, alpha=SGD_ALPHA,
        max_iter=1, tol=None, shuffle=True, random_state=RANDOM_STATE,
    )
    print(f"  Chunk size: {chunk_size} pairs")
    for start in range(0, len(X_train_sc), chunk_size):
        end = start + chunk_size
        sgd_online.partial_fit(
            X_train_sc[start:end], y_train[start:end],
            classes=[0, 1],
        )
        acc_chunk = accuracy_score(y_test, sgd_online.predict(X_test_sc))
        print(f"    After chunk [{start:>3}–{min(end, len(X_train_sc)):>3}] "
              f"({min(end, len(X_train_sc)) - start} pairs)  "
              f"test accuracy = {acc_chunk:.4f}")

    # ── Per-pair test results ───────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  PER-PAIR RESULTS  (internal test set)")
    print("=" * 65)
    _print_header(with_truth=True)
    for i, idx in enumerate(idx_test):
        base, clone, ctype = pair_meta[idx]
        print(_verdict_line(base, clone, ctype, X[idx], y_pred[i], truth=y_test[i]))

    # ── Full training pool table ────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  FULL PREDICTION TABLE  (training pool)")
    print("=" * 65)
    all_pred = clf.predict(scaler.transform(X))
    _print_header(with_truth=False)
    for i, (base, clone, ctype) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], all_pred[i]))

    # ── Unseen pool predictions ─────────────────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(scaler.transform(X_unseen))

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,
                                         target_names=["Clean (0)", "Plagiarized (1)"]))
        else:
            print("  (Only one class in unseen labels — skipping metrics)\n")

        _print_header(with_truth=True)
        for i, (base, clone, ctype) in enumerate(meta_unseen):
            print(_verdict_line(base, clone, ctype, X_unseen[i],
                                unseen_pred[i], truth=y_unseen[i]))


def _print_all_pairs(X, y, pair_meta):
    """Fallback when only one label class exists."""
    _print_header(with_truth=True)
    for i, (base, clone, ctype) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], int(y[i]), truth=int(y[i])))


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global PLAGIARISM_THRESHOLD, SGD_LOSS, SGD_PENALTY, SGD_ALPHA
    global SGD_MAX_ITER, SGD_LEARNING_RATE, SGD_ETA0, SGD_L1_RATIO

    parser = argparse.ArgumentParser(
        description="Plagiarism detector — SGDClassifier (online linear model)."
    )
    parser.add_argument(
        "--threshold", type=float, default=PLAGIARISM_THRESHOLD,
        help=f"Avg-Jaccard threshold to label a pair plagiarized (default: {PLAGIARISM_THRESHOLD})."
    )
    parser.add_argument(
        "--loss", type=str, default=SGD_LOSS,
        choices=["log_loss", "hinge", "modified_huber", "perceptron"],
        help=f"Loss function / model type (default: {SGD_LOSS})."
    )
    parser.add_argument(
        "--penalty", type=str, default=SGD_PENALTY,
        choices=["l1", "l2", "elasticnet"],
        help=f"Regularization type (default: {SGD_PENALTY})."
    )
    parser.add_argument(
        "--alpha", type=float, default=SGD_ALPHA,
        help=f"Regularization strength (default: {SGD_ALPHA})."
    )
    parser.add_argument(
        "--lr", type=str, default=SGD_LEARNING_RATE,
        choices=["optimal", "adaptive", "constant", "invscaling"],
        help=f"Learning rate schedule (default: {SGD_LEARNING_RATE})."
    )
    parser.add_argument(
        "--eta0", type=float, default=SGD_ETA0,
        help=f"Initial learning rate for non-optimal schedules (default: {SGD_ETA0})."
    )
    parser.add_argument(
        "--l1-ratio", type=float, default=SGD_L1_RATIO,
        help=f"ElasticNet L1 ratio (default: {SGD_L1_RATIO})."
    )
    args = parser.parse_args()

    PLAGIARISM_THRESHOLD = args.threshold
    SGD_LOSS             = args.loss
    SGD_PENALTY          = args.penalty
    SGD_ALPHA            = args.alpha
    SGD_LEARNING_RATE    = args.lr
    SGD_ETA0             = args.eta0
    SGD_L1_RATIO         = args.l1_ratio

    if not TOKENIZER_JS.exists():
        print(f"\n[ERROR] Tokenizer not found: {TOKENIZER_JS}")
        return

    print("\n" + "=" * 65)
    print("  LOADING FILES  (via JS tokenizer)")
    print("=" * 65)

    print(f"\n  Base files  ->  {BASE_DIR}")
    base_files = load_js_files(BASE_DIR, "BASE")

    print(f"\n  Clone files ->  {CLONES_DIR}")
    clone_files = load_js_files(CLONES_DIR, "CLONE")

    if not base_files:
        print("\n[ERROR] No base .js files loaded.")
        return
    if not clone_files:
        print("\n[ERROR] No clone .js files loaded.")
        return

    import random
    all_base_stems = sorted(base_files.keys())
    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train_files = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems   = set(all_base_stems[:n_train_files])
    unseen_stems  = set(all_base_stems[n_train_files:])

    train_base_files  = {s: base_files[s] for s in train_stems}
    unseen_base_files = {s: base_files[s] for s in unseen_stems}

    print("\n" + "=" * 65)
    print("  FILE SPLIT")
    print("=" * 65)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO*100):>2}%)  : {len(train_stems)} files  {sorted(train_stems)}")
    print(f"  Unseen pool   ({int((1-TRAIN_FILE_RATIO)*100):>2}%)  : {len(unseen_stems)} files")

    print("\n" + "=" * 65)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO*100)}% of files)")
    print("=" * 65)
    X, y, pair_meta = build_dataset(train_base_files, clone_files)

    if len(X) == 0:
        print("\n[ERROR] No pairs built. Check clone filenames: <base>_clon_<1|2|3>.js")
        return

    print("\n" + "=" * 65)
    print(f"  BUILDING UNSEEN DATASET  (remaining {int((1-TRAIN_FILE_RATIO)*100)}% of files)")
    print("=" * 65)
    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_base_files, clone_files)

    train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)
    print("\n[DONE]\n")


if __name__ == "__main__":
    main()
