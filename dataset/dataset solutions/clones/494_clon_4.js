const fileSystemModule = require('fs');

const interpretInputLines = (dataString) => dataString.trim().split("\n");

const convertLineToNumbers = (lineContent) => lineContent.split(" ").map(Number);

const UPPER_SCORE_BOUND = 5000;

let allInputSegments = interpretInputLines(fileSystemModule.readFileSync('/dev/stdin', 'utf8'));
let currentSegmentPointer = 0;

const advanceAndParseNumericSegment = () => convertLineToNumbers(allInputSegments[currentSegmentPointer++]);

while (true) {
    const configurationParameters = advanceAndParseNumericSegment();
    const possibleMoveOutcomes = configurationParameters[0];
    const ultimateObjectiveCell = configurationParameters[1];
    const numberOfSpecificEvents = configurationParameters[2];

    if (possibleMoveOutcomes === 0 && ultimateObjectiveCell === 0 && numberOfSpecificEvents === 0) {
        break;
    }

    const availableStepDistances = advanceAndParseNumericSegment();

    const specialScenarioRegistry = new Map(); // Map<cell_index, {kind: number, value: number}>
    for (let scenarioIndex = 0; scenarioIndex < numberOfSpecificEvents; ++scenarioIndex) {
        const scenarioInfo = advanceAndParseNumericSegment();
        const scenarioCell = scenarioInfo[0];
        const scenarioKind = scenarioInfo[1];
        const scenarioValue = scenarioInfo[2];
        specialScenarioRegistry.set(scenarioCell, { kind: scenarioKind, value: scenarioValue });
    }

    let probabilityStatesByLocation = new Map(); // Map<current_cell_position, Map<current_score_value, probability_fraction>>
    probabilityStatesByLocation.set(0, new Map([[0, 1]])); // Initial state: at cell 0, score 0, with 100% certainty

    for (let current_board_position = 0; current_board_position < ultimateObjectiveCell; ++current_board_position) {
        let subsequentProbabilityStates = new Map();

        // Transfer any states that are already past the current_board_position to the next iteration
        for (const [past_position, score_distribution_map] of probabilityStatesByLocation.entries()) {
            if (past_position > current_board_position) {
                subsequentProbabilityStates.set(past_position, score_distribution_map);
            }
        }

        const statesAtThisSpecificPosition = probabilityStatesByLocation.get(current_board_position);
        if (!statesAtThisSpecificPosition) {
            probabilityStatesByLocation = subsequentProbabilityStates;
            continue;
        }

        for (const [current_accumulated_score, current_state_probability] of statesAtThisSpecificPosition.entries()) {
            if (current_state_probability === 0) continue;

            const probability_per_individual_action = current_state_probability / possibleMoveOutcomes;

            for (const step_magnitude of availableStepDistances) {
                let resulting_cell_coordinate = Math.min(ultimateObjectiveCell, current_board_position + step_magnitude);
                let resulting_accumulated_score = current_accumulated_score;

                const active_special_event = specialScenarioRegistry.get(resulting_cell_coordinate);
                if (active_special_event) {
                    const { kind, value } = active_special_event;
                    if (kind === 1) { // Relocation effect
                        resulting_cell_coordinate = Math.min(ultimateObjectiveCell, resulting_cell_coordinate + value);
                    } else if (kind === 2) { // Score increment effect
                        resulting_accumulated_score = Math.min(UPPER_SCORE_BOUND, resulting_accumulated_score + value);
                    } else if (kind === 3) { // Score decrement effect (replicates original's Math.min(0, k-a))
                        resulting_accumulated_score = Math.min(0, resulting_accumulated_score - value);
                    }
                }

                const existing_score_map_for_target_cell = subsequentProbabilityStates.get(resulting_cell_coordinate) || new Map();
                existing_score_map_for_target_cell.set(resulting_accumulated_score, (existing_score_map_for_target_cell.get(resulting_accumulated_score) || 0) + probability_per_individual_action);
                subsequentProbabilityStates.set(resulting_cell_coordinate, existing_score_map_for_target_cell);
            }
        }
        probabilityStatesByLocation = subsequentProbabilityStates;
    }

    let totalExpectedValueCalculation = 0;
    const finalCellProbabilities = probabilityStatesByLocation.get(ultimateObjectiveCell);
    if (finalCellProbabilities) {
        for (const [final_score_value, final_probability_fraction] of finalCellProbabilities.entries()) {
            totalExpectedValueCalculation += final_score_value * final_probability_fraction;
        }
    }
    console.log(Math.floor(totalExpectedValueCalculation));
}