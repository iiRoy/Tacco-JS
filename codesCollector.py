# SPDX-FileCopyrightText: 2026 Rodrigo López Guerra
# SPDX-FileCopyrightText: 2026 Abigail Pérez García
# SPDX-FileCopyrightText: 2026 Fernando Maggi Llerandi
#
# SPDX-License-Identifier: Apache-2.0

import os
import shutil

# --- Configuration ---
SCRIPT_DIR       = os.path.dirname(os.path.abspath(__file__))
DATA_DIR         = os.path.join(SCRIPT_DIR, "Project_CodeNet", "data")
OUTPUT_DIR       = os.path.join(SCRIPT_DIR, "js_dataset_codenet")
TARGET           = 5000
WANTED_PER_FOLDER = 4   # how many .js files to take from each problem folder
# ---------------------


def collect_codenet_js(data_dir, output_dir, target=5000, wanted_per_folder=2):
    os.makedirs(output_dir, exist_ok=True)

    collected = 0
    skipped   = 0

    try:
        problem_folders = sorted(os.scandir(data_dir), key=lambda e: e.name)
    except FileNotFoundError:
        print(f"[ERROR] Data directory not found: {data_dir}")
        return

    for problem in problem_folders:
        if collected >= target:
            break

        if not problem.is_dir():
            continue

        js_folder = os.path.join(problem.path, "JavaScript")

        # Skip if there is no JavaScript subfolder
        if not os.path.isdir(js_folder):
            skipped += 1
            continue

        # Collect all .js files inside the JavaScript folder
        try:
            js_files = sorted(
                e.path for e in os.scandir(js_folder)
                if e.is_file() and e.name.endswith(".js")
            )
        except PermissionError:
            skipped += 1
            continue

        # Skip if folder doesn't have enough files to meet the wanted amount
        if len(js_files) < wanted_per_folder:
            skipped += 1
            continue

        # Take exactly wanted_per_folder files from this folder
        for src in js_files[:wanted_per_folder]:
            if collected >= target:
                break

            dest_name = f"{collected + 1}.js"
            dest      = os.path.join(output_dir, dest_name)

            shutil.copy2(src, dest)
            collected += 1
            print(f"[{collected:>{len(str(target))}}/{target}] {problem.name} -> {dest_name}")

    print("\n--- Done ---")
    print(f"Collected : {collected} file(s)")
    print(f"Skipped   : {skipped} problem folder(s) (no JavaScript subfolder, insufficient or no .js files)")
    print(f"Output dir: {output_dir}")

    if collected < target:
        print(f"\n[WARNING] Only {collected} qualifying folders found (target was {target}).")


if __name__ == "__main__":
    collect_codenet_js(DATA_DIR, OUTPUT_DIR, TARGET, WANTED_PER_FOLDER)