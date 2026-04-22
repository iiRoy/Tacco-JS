function processDataEntry(unprocessed_text) {
    const numerical_tokens = unprocessed_text.split(/\s+/).filter(Boolean).map(x => +x);
    const primary_value = numerical_tokens[0];
    const secondary_value = numerical_tokens[1];

    const derived_figures = [];
    derived_figures.push(primary_value + secondary_value);
    derived_figures.push(primary_value - secondary_value);
    derived_figures.push(primary_value * secondary_value);

    derived_figures.sort((v1, v2) => v1 - v2);

    return derived_figures[derived_figures.length - 1];
}