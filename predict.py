# python predict.py archivo1.js archivo2.js --model LLMs/Models/model.joblib

import json
import subprocess
import argparse
import joblib
import numpy as np
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent

SIMILARITY_JS = PROJECT_DIR / "Vectorization" / "similarity.js"
MODEL_PATH = PROJECT_DIR / "LLMs" / "Models" / "random_forest_model.joblib"

DEFAULT_CLASS_NAMES = {
    0: "Clean",
    1: "Plagiarized (1)",
    2: "Plagiarized (2)",
    3: "Plagiarized (3)",
    4: "Plagiarized (4)",
}


def get_similarity_vector(file_a: str, file_b: str, compare_mode: int = 1):
    result = subprocess.run(
        ["node", str(SIMILARITY_JS), file_a, file_b, str(compare_mode)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore",
        timeout=30,
    )

    if result.returncode != 0:
        raise RuntimeError(f"Error en similarity.js:\n{result.stderr}")

    raw_output = result.stdout.strip()

    if not raw_output:
        raise ValueError("similarity.js no devolvió ninguna salida.")

    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError as e:
        raise ValueError(
            "similarity.js no devolvió JSON válido.\n"
            f"Salida recibida:\n{raw_output}"
        ) from e

    if isinstance(data, list):
        vector = data
    elif isinstance(data, dict) and "vector" in data:
        vector = data["vector"]
    else:
        raise ValueError(
            "similarity.js debe devolver una lista numérica o un objeto con la clave 'vector'.\n\n"
            f"Salida recibida:\n{json.dumps(data, indent=2, ensure_ascii=False)}"
        )

    if not isinstance(vector, list) or not all(isinstance(x, (int, float)) for x in vector):
        raise ValueError(
            "El vector devuelto por similarity.js no es una lista numérica válida.\n\n"
            f"Vector recibido:\n{vector}"
        )

    return np.array([vector], dtype=float)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file_a", help="Archivo JS base")
    parser.add_argument("file_b", help="Archivo JS a comparar")
    parser.add_argument("--model", default=str(MODEL_PATH))
    parser.add_argument("--compare-mode", type=int, default=3)

    args = parser.parse_args()

    print(f"Compare mode usado: {args.compare_mode}")

    bundle = joblib.load(args.model)

    clf = bundle["model"]
    scaler = bundle.get("scaler")
    class_names = bundle.get("class_names")

    X_new = get_similarity_vector(
        args.file_a,
        args.file_b,
        args.compare_mode,
    )

    print("Vector usado:", X_new.tolist()[0])

    if scaler is not None:
        X_new = scaler.transform(X_new)

    pred = clf.predict(X_new)[0]

    pred_int = int(pred)

    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(X_new)[0]
        confidence = float(np.max(probs))

        print("\nProbabilidades por clase:")
        for class_id, prob in enumerate(probs):
            print(f"  Clase {class_id}: {prob:.4%}")

        print(f"\nConfianza de la predicción: {confidence:.4%}")

    print("Clase predicha:", pred_int)

    if class_names is not None:
        if isinstance(class_names, dict):
            print("Resultado:", class_names.get(pred_int, f"Clase desconocida: {pred_int}"))
        elif isinstance(class_names, list):
            if 1 <= pred_int <= len(class_names):
                print("Resultado:", class_names[pred_int - 1])
            elif 0 <= pred_int < len(class_names):
                print("Resultado:", class_names[pred_int])
            else:
                print("Resultado:", f"Clase desconocida: {pred_int}")
        else:
            print("Resultado:", f"Clase desconocida: {pred_int}")
    else:
        print("Resultado:", DEFAULT_CLASS_NAMES.get(pred_int, f"Clase desconocida: {pred_int}"))


if __name__ == "__main__":
    main()