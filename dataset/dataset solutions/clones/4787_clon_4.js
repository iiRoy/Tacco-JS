let s_input_stream_buffer = '';
let l_line_index = 0;
let a_processed_lines = [];

const c_prepare_stream = () => new Promise(p_resolve => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', p_fragment => {
        s_input_stream_buffer += p_fragment;
    });

    process.stdin.on('end', () => {
        a_processed_lines = s_input_stream_buffer.split(/\r?\n/).filter(p_entry => p_entry.length > 0);
        p_resolve();
    });
});

const f_obtain_line = () => {
    if (l_line_index >= a_processed_lines.length) {
        throw new Error('No more data in stream');
    }
    return a_processed_lines[l_line_index++];
};

const f_decode_numerics = p_text_entry => {
    const [v_first_val, v_second_val] = p_text_entry.split(' ').map(Number);
    return { valA: v_first_val, valB: v_second_val };
};

const f_decode_link_data = p_text_entry => {
    const [n_start_node, n_end_node, n_edge_weight] = p_text_entry.split(' ').map(Number);
    return { source_node: n_start_node - 1, target_node: n_end_node - 1, weight_value: n_edge_weight };
};

async function f_initiate_graph_analysis() {
    await c_prepare_stream();

    const o_graph_specs = f_decode_numerics(f_obtain_line());
    const n_vertex_count = o_graph_specs.valA;
    const n_connection_count = o_graph_specs.valB;

    const a_raw_connections = Array.from({ length: n_connection_count }, () =>
        f_decode_link_data(f_obtain_line())
    );

    const m_path_matrix = new Map();
    Array.from({ length: n_vertex_count }, (_, n_idx1) => {
        const m_row = new Map();
        Array.from({ length: n_vertex_count }, (_, n_idx2) => {
            m_row.set(n_idx2, n_idx1 === n_idx2 ? 0 : Number.MAX_SAFE_INTEGER);
        });
        m_path_matrix.set(n_idx1, m_row);
    });

    a_raw_connections.forEach(o_connection => {
        const { source_node, target_node, weight_value } = o_connection;
        m_path_matrix.get(source_node).set(target_node, Math.min(m_path_matrix.get(source_node).get(target_node), weight_value));
        m_path_matrix.get(target_node).set(source_node, Math.min(m_path_matrix.get(target_node).get(source_node), weight_value));
    });

    Array.from({ length: n_vertex_count }, (_, n_pivot_node) => {
        Array.from({ length: n_vertex_count }, (_, n_start_vertex) => {
            Array.from({ length: n_vertex_count }, (_, n_end_vertex) => {
                const d_current_distance = m_path_matrix.get(n_start_vertex).get(n_end_vertex);
                const d_distance_via_pivot =
                    m_path_matrix.get(n_start_vertex).get(n_pivot_node) +
                    m_path_matrix.get(n_pivot_node).get(n_end_vertex);
                m_path_matrix.get(n_start_vertex).set(n_end_vertex, Math.min(d_current_distance, d_distance_via_pivot));
            });
        });
    });

    let n_non_essential_links = 0;
    a_raw_connections.forEach(o_connection => {
        const { source_node: link_origin, target_node: link_target, weight_value: link_cost } = o_connection;
        let b_is_part_of_shortest_path = false;
        Array.from({ length: n_vertex_count }, (_, n_test_vertex) => {
            const d_path_to_origin = m_path_matrix.get(n_test_vertex).get(link_origin);
            const d_path_to_target = m_path_matrix.get(n_test_vertex).get(link_target);

            if (d_path_to_origin + link_cost === d_path_to_target) {
                b_is_part_of_shortest_path = true;
            }
        });
        if (!b_is_part_of_shortest_path) {
            n_non_essential_links++;
        }
    });

    console.log(n_non_essential_links);
    process.exit(0);
}

f_initiate_graph_analysis();