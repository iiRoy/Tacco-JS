import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

CACHE_DIR     = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "rf_features_cache.npz"
META_CACHE    = CACHE_DIR / "rf_features_meta.json"

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
]

CLASS_LABELS = [1, 2, 3, 4]
CLASS_NAMES  = ["Type 1", "Type 2", "Type 3", "Type 4"]
COLORS       = ["#4CAF50", "#2196F3", "#FF9800", "#F44336"]

OUT_DIR = Path("LLMs/plots")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    data = np.load(FEATURE_CACHE, allow_pickle=False)
    X = np.concatenate([data["X"], data["X_unseen"]], axis=0)
    y = np.concatenate([data["y"], data["y_unseen"]], axis=0)
    print(f"Loaded {len(y)} pairs")

    n_metrics = len(METRIC_NAMES)
    means = np.array([[X[y == t, i].mean() for i in range(n_metrics)]
                      for t in CLASS_LABELS])   # shape (4, 31)
    stds  = np.array([[X[y == t, i].std()  for i in range(n_metrics)]
                      for t in CLASS_LABELS])

    # ── Grouped bar chart: métrica en X, barra por tipo ───────────
    x      = np.arange(n_metrics)
    width  = 0.2
    fig, ax = plt.subplots(figsize=(22, 6))

    for i, (label, name, color) in enumerate(zip(CLASS_LABELS, CLASS_NAMES, COLORS)):
        offset = (i - 1.5) * width
        bars = ax.bar(x + offset, means[i], width,
                      yerr=stds[i], capsize=2,
                      label=name, color=color, alpha=0.85,
                      error_kw={"elinewidth": 0.8, "alpha": 0.5})

    ax.set_xticks(x)
    ax.set_xticklabels(METRIC_NAMES, rotation=45, ha="right", fontsize=8)
    ax.set_ylabel("Similitud promedio (0–1)")
    ax.set_ylim(0, 1.15)
    ax.set_title("Similitud promedio por métrica y tipo de clon\n"
                 "(barras = media,  líneas = desviación estándar)", fontsize=12)
    ax.legend(fontsize=10)
    ax.grid(axis="y", alpha=0.3)
    ax.axhline(1.0, color="gray", linewidth=0.5, linestyle="--")

    plt.tight_layout()
    path = OUT_DIR / "similitud_por_tipo.png"
    fig.savefig(path, dpi=150)
    print(f"Guardado: {path}")
    plt.close(fig)


if __name__ == "__main__":
    main()
