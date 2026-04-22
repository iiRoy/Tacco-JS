const process_data = (source_text) => {
    const data_lines = source_text.replace(/^\s+|\s+$/g, '').split(/\r?\n/);

    const meta_tokens = data_lines[0].split(/\s+/).map(Number);
    const total_jobs_count = meta_tokens[0];
    const max_days_allotted = meta_tokens[1];

    const work_items_raw = data_lines.slice(1).map((line_str, idx) => {
        const values = line_str.split(/\s+/);
        return {
            due_date: Number(values[0]),
            income: Number(values[1]),
            identifier: idx
        };
    });

    const task_preference_sorter = (item_a, item_b) => {
        // This comparison function meticulously replicates the original's custom sorting logic.
        // Original: (a, b) => { if (a[1] > b[1]) { if (a[0] > b[0]) return 1; return -1; } return 1; }
        // Which simplifies to: (a[1] > b[1] && a[0] <= b[0]) ? -1 : 1;
        return (item_a.income > item_b.income && item_a.due_date <= item_b.due_date) ? -1 : 1;
    };

    // Create a master list of tasks, sorted once according to the specific preference.
    const initial_sorted_tasks = [...work_items_raw].sort(task_preference_sorter);

    // Use a Map to keep track of currently available tasks, allowing efficient deletion by identifier.
    // The keys are identifiers, values are the task objects.
    const available_work_units = new Map(initial_sorted_tasks.map(task => [task.identifier, task]));

    let accumulated_value = 0;
    let current_calendar_day = 1;

    while (current_calendar_day <= max_days_allotted && available_work_units.size > 0) {
        let selected_task_id = null;

        // Iterate through the master sorted list to find the 'first' eligible task
        // that is still available (in available_work_units) and meets the current day's deadline.
        for (const item of initial_sorted_tasks) {
            if (available_work_units.has(item.identifier) && current_calendar_day >= item.due_date) {
                selected_task_id = item.identifier;
                break; // Found the first one according to the defined sort order
            }
        }

        if (selected_task_id !== null) {
            const chosen_item = available_work_units.get(selected_task_id);
            accumulated_value += chosen_item.income;
            available_work_units.delete(selected_task_id); // Mark as taken by removing from map
        }
        // If no task is found for the current day, we simply move to the next day.

        current_calendar_day++;
    }

    console.log(accumulated_value);
};

const file_contents = require('node:fs').readFileSync('/dev/stdin', 'utf8');
process_data(file_contents);