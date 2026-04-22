class InputAccessor {
    #sourceLinesData;
    #lineCursor;
    #tokenBuffer;
    #isBufferActive;

    constructor(initialContent) {
        this.#sourceLinesData = initialContent.trim().split("\n");
        this.#lineCursor = 0;
        this.#tokenBuffer = [];
        this.#isBufferActive = false;
    }

    #advanceSourceLine() {
        this.#lineCursor++;
        this.#isBufferActive = false;
        this.#tokenBuffer = [];
    }

    fetchScalarValue(yieldAsString = false) {
        if (this.#lineCursor >= this.#sourceLinesData.length) {
            throw new Error("Input stream exhausted for scalar values.");
        }

        if (!this.#isBufferActive) {
            this.#tokenBuffer = this.#sourceLinesData[this.#lineCursor].split(" ").reverse();
            this.#isBufferActive = true;
        }

        if (this.#tokenBuffer.length === 0) {
            this.#advanceSourceLine();
            return this.fetchScalarValue(yieldAsString);
        }

        const retrievedElement = this.#tokenBuffer.pop();
        if (this.#tokenBuffer.length === 0) {
            this.#advanceSourceLine();
        }
        return yieldAsString ? retrievedElement : Number(retrievedElement);
    }

    acquireFullLine(yieldAsStringArray = false) {
        if (this.#lineCursor >= this.#sourceLinesData.length) {
            throw new Error("Input stream exhausted for full lines.");
        }
        const currentLineContent = this.#sourceLinesData[this.#lineCursor].split(" ");
        this.#advanceSourceLine();
        return yieldAsStringArray ? currentLineContent : currentLineContent.map(Number);
    }

    acquireGrid(rowsToFetch, yieldAsStringMatrix = false) {
        const collectedGrid = [];
        for (let currentGridRow = 0; currentGridRow < rowsToFetch; currentGridRow++) {
            collectedGrid.push(this.acquireFullLine(yieldAsStringMatrix));
        }
        return collectedGrid;
    }

    acquireValueRows(rowsToFetch, yieldAsStringArray = false) {
        const collectedValues = [];
        for (let currentValRow = 0; currentValRow < rowsToFetch; currentValRow++) {
            if (this.#lineCursor >= this.#sourceLinesData.length) {
                throw new Error("Input stream exhausted for value rows.");
            }
            const lineValue = this.#sourceLinesData[this.#lineCursor].trim();
            this.#advanceSourceLine();
            collectedValues.push(yieldAsStringArray ? lineValue : Number(lineValue));
        }
        return collectedValues;
    }
}

const data_source = new InputAccessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculate_path_limit());

function calculate_path_limit() {
    const max_column_dimension = data_source.fetchScalarValue();
    const max_row_dimension = data_source.fetchScalarValue();
    const total_block_entries = data_source.fetchScalarValue();

    const obstruction_registry = new Map(
        Array.from({ length: max_column_dimension }, (_, current_col_idx) => [current_col_idx + 1, new Set()])
    );

    Array.from({ length: total_block_entries }).forEach(() => {
        const block_placement = data_source.acquireFullLine();
        const block_y_coord = block_placement[0];
        const block_x_coord = block_placement[1];
        if (block_y_coord < block_x_coord) return;
        obstruction_registry.get(block_x_coord)?.add(block_y_coord);
    });

    Array.from({ length: max_column_dimension }, (_, current_col_idx) => current_col_idx + 1).forEach(col_id => {
        obstruction_registry.get(col_id)?.add(max_row_dimension + 1);
    });

    const first_column_obstructions = Array.from(obstruction_registry.get(1) || []).sort((alpha, beta) => alpha - beta);
    let highest_reachable_y = first_column_obstructions[0] - 1;

    let current_exploration_y = 2;

    for (let traversal_column = 2; traversal_column <= max_column_dimension; traversal_column++) {
        const current_column_obstructions = obstruction_registry.get(traversal_column);

        while (current_column_obstructions.has(current_exploration_y)) {
            current_exploration_y++;
        }

        if (current_exploration_y > highest_reachable_y) {
            break;
        }

        const next_blocking_element = Array.from(current_column_obstructions)
            .sort((alpha, beta) => alpha - beta)
            .find(blocked_y_val => blocked_y_val > current_exploration_y);

        if (next_blocking_element !== undefined) {
            if (next_blocking_element - 1 < highest_reachable_y) {
                highest_reachable_y = next_blocking_element - 1;
            }
        }
        
        current_exploration_y++;
    }

    return highest_reachable_y;
}