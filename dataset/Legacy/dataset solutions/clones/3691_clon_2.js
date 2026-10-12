#include <cstdio>
#include <vector>
#include <queue>
#include <utility>
#include <functional>
#include <cmath>
// Header block start  //
// Type definitions  //
using long_long_type = long long int;
using unsigned_long_long_type = long long unsigned int;
using int_pair_type = std::pair<int,int>;
using long_pair_type = std::pair<long_long_type,long_long_type>;
using int_vector_type = std::vector<int>;
using long_vector_type = std::vector<long_long_type>;
using int_pair_vector_type = std::vector<int_pair_type>;
using long_pair_vector_type = std::vector<long_pair_type>;
// Type definitions end //
// Macro definitions //
// Input scanning //
#define read_integer(var_int) std::scanf("%d", &(var_int))
#define read_two_integers(var_int_a,var_int_b) std::scanf("%d%d", &(var_int_a), &(var_int_b))
#define read_three_integers(var_int_a,var_int_b,var_int_c) std::scanf("%d%d%d", &(var_int_a), &(var_int_b), &(var_int_c))
#define read_long_long(var_long) std::scanf("%lld", &(var_long))
#define read_two_long_longs(var_long_a,var_long_b) std::scanf("%lld%lld", &(var_long_a), &(var_long_b))
#define read_three_long_longs(var_long_a,var_long_b,var_long_c) std::scanf("%lld%lld%lld", &(var_long_a), &(var_long_b), &(var_long_c))
#define read_character(char_var) std::scanf("%c", &(char_var));
#define read_string_c(str_ptr) std::scanf("%s", str_ptr);
#define read_string_cpp(str_ref) std::scanf("%s", &(str_ref));
// Constants //
#define epsilon_value (1e-7)
#define infinity_value_int (2e9)
#define pi_constant (std::acos(-1))
// Loop constructs //
#define loop_from_to_inclusive(iter_var,upper_bound,lower_bound) for(long_long_type iter_var = lower_bound; iter_var < upper_bound; iter_var++)
#define loop_up_to_exclusive(iter_var,upper_bound) loop_from_to_inclusive(iter_var,upper_bound,0)
#define reverse_loop_from_to_inclusive(iter_var,upper_bound,offset_val) for(long_long_type iter_var = upper_bound-offset_val-1; iter_var >= 0; iter_var--)
#define reverse_loop_down_to_zero(iter_var,upper_bound) reverse_loop_from_to_inclusive(iter_var,upper_bound,0)
// Output helpers //
#define print_yes_no_case(condition_bool) (condition_bool)?std::printf("Yes\n"):std::printf("No\n")
#define print_YES_NO_case(condition_bool) (condition_bool)?std::printf("YES\n"):std::printf("NO\n")
// Macro definitions end //
// Header block end  //

void calculate_shortest_paths( int source_node, std::vector<int_pair_vector_type>& graph_adjacency_list, long_vector_type& distance_array ){
    std::priority_queue<long_pair_type,long_pair_vector_type,std::greater<long_pair_type>> priority_queue_nodes;
    distance_array.assign(graph_adjacency_list.size(),1000000000000000000LL); // Initialize distances to a very large number
    distance_array[source_node] = 0; // Distance to source is zero
    priority_queue_nodes.emplace(0,source_node); // Add source node to priority queue
    while( priority_queue_nodes.size() ){ // While there are nodes to process
        int current_node_index = priority_queue_nodes.top().second; // Get node with smallest distance
        long_long_type current_distance_value = priority_queue_nodes.top().first; // Get its distance
        priority_queue_nodes.pop(); // Remove it from the queue
        if( current_distance_value > distance_array[current_node_index] ) continue; // If already found a shorter path, skip
        for( int_pair_type edge_tuple : graph_adjacency_list[current_node_index] ){ // Iterate over neighbors
            int destination_node_index = edge_tuple.first; // Neighbor node
            int edge_weight_cost = edge_tuple.second; // Cost to neighbor
            if( distance_array[destination_node_index] > current_distance_value + edge_weight_cost ){ // If a shorter path is found
                distance_array[destination_node_index] = current_distance_value + edge_weight_cost; // Update distance
                priority_queue_nodes.emplace(distance_array[destination_node_index],destination_node_index); // Add/update neighbor in queue
            }
        }
    }
}

int execute_main_logic() {

    int total_nodes,total_edges,start_point_raw,end_point_raw;
    read_two_integers(total_nodes,total_edges); // Read number of nodes and edges
    read_two_integers(start_point_raw,end_point_raw); // Read start and end points
    start_point_raw--; // Adjust to 0-indexed
    end_point_raw--; // Adjust to 0-indexed

    std::vector<int_pair_vector_type> graph_A_data(total_nodes); // Adjacency list for graph A
    std::vector<int_pair_vector_type> graph_B_data(total_nodes); // Adjacency list for graph B
    int node_u_raw,node_v_raw,cost_a_val,cost_b_val;
    loop_up_to_exclusive(index_iterator,total_edges){ // Loop through all edges
        read_two_integers(node_u_raw,node_v_raw); // Read two connected nodes
        read_two_integers(cost_a_val,cost_b_val); // Read costs for graph A and B
        node_u_raw--; // Adjust node U to 0-indexed
        node_v_raw--; // Adjust node V to 0-indexed
        graph_A_data[node_u_raw].emplace_back(node_v_raw,cost_a_val); // Add edge to graph A (U to V)
        graph_A_data[node_v_raw].emplace_back(node_u_raw,cost_a_val); // Add edge to graph A (V to U)
        graph_B_data[node_u_raw].emplace_back(node_v_raw,cost_b_val); // Add edge to graph B (U to V)
        graph_B_data[node_v_raw].emplace_back(node_u_raw,cost_b_val); // Add edge to graph B (V to U)
    }

    long_vector_type distances_from_start,distances_from_end;
    calculate_shortest_paths(start_point_raw, graph_A_data, distances_from_start); // Compute shortest paths from start_point in graph A
    calculate_shortest_paths(end_point_raw, graph_B_data, distances_from_end); // Compute shortest paths from end_point in graph B

    long_long_type max_possible_value = 0; // Initialize max value
    long_vector_type result_container; // Container for final answers
    reverse_loop_down_to_zero(index_iterator,total_nodes){ // Iterate nodes from N-1 down to 0
        max_possible_value = std::max( max_possible_value, 1000000000000000LL - distances_from_start[index_iterator] - distances_from_end[index_iterator] ); // Calculate and update max
        result_container.push_back(max_possible_value); // Store the current max
    }

    reverse_loop_down_to_zero(index_iterator,total_nodes){ // Iterate nodes from N-1 down to 0 again
        std::printf ("%lld\n", result_container[index_iterator] ); // Print stored results
    }


    return 0; // Indicate successful execution
}