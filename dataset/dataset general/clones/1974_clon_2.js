Issue.traceDepth = 999999999;

var acquire = require('cps');

var data_access_module = acquire('../utils/data_connector.js');
var DatabaseInterface = data_access_module.DatabaseInterface;

var completion_callback_factory = function() {
    var process_error = function(err_obj) {
        if ( err_obj.trace ) {
            console.log(err_obj.trace);
        }
        else {
            console.log( err_obj );
        }
    };

    var operation_start_time = new Date();
    return function(error_val, result_data) {
        try {
            var operation_end_time = new Date();
            console.log('elapsed duration: ', operation_end_time - operation_start_time);
            if (error_val) {
                process_error(error_val);
            } else {
                console.log(result_data);
            }
            connection_pool_instance.terminate();
        } catch(err_obj) {
            process_error(err_obj);
            connection_pool_instance.terminate();
        }
    };
}();

var connection_pool_instance = new DatabaseInterface({
    server_host     : '127.0.0.1',
    auth_user     : 'root_user',
    auth_secret : 'password123',
    schema_name : 'application_service_data',
    pool_size_limit: 50,
    transaction_settings: {
        pool_size_limit: 1
    },
    cursor_config: {
        pool_size_limit: 1
    }
});

var fundamental_check = function(completion_callback) {
    connection_pool_instance.transaction(null, function(db_connection, handler_callback) {
        acquire.seq([
            function(_ignored_arg, seq_callback) {
                db_connection.execute_query('SELECT user_data FROM client_profiles_table LIMIT 1', seq_callback);
            },
            function(query_result, next_step_callback) {
                console.log(query_result);
                next_step_callback();
            }
        ], handler_callback);
    }, completion_callback);
};

var schema_verification_task = function(completion_callback) {
    connection_pool_instance._initialize_schema(completion_callback);
};

var row_iterator_evaluation = function(completion_callback) {
    connection_pool_instance.establish_connection(function(active_connection, connection_handler) {
        var data_retrieval_query = 'SELECT * FROM user_records';

        connection_pool_instance.row_iterator(data_retrieval_query, function(current_row, row_process_callback) {
            // active_connection.execute_query(data_retrieval_query, row_process_callback);
            // throw new Error('an_unexpected_issue');
            console.log(current_row);
            row_process_callback();
        }, function(error_object, final_result) {
            if (error_object) {
                console.log(error_object);
            }
            connection_handler(error_object, final_result);
        });
    }, completion_callback);
};

var entity_model_check = function(completion_callback) {
    connection_pool_instance.register_entity({
        entity_name: 'discount_vouchers',
        primary_key_field: 'voucher_id'
    })
    ;

    connection_pool_instance.register_entity({
        entity_name: 'merchandise_items',
        primary_key_field: 'item_identifier'
    })
    ;

    var original_pool_reference = connection_pool_instance;

    connection_pool_instance = connection_pool_instance.duplicate();

    connection_pool_instance.enhance_entity({
        entity_name: 'discount_vouchers',
        Record: {
            retrieve_discount_method: function() {
                return this._record_data['discount_method_type'];
            }
        }
    })
        .relates_to({
            entity_name: 'merchandise_item',
            linked_table: 'merchandise_items',
            foreign_key: 'item_identifier'
        })
    ;

    var DiscountEntitySchema = connection_pool_instance.get('discount_vouchers').EntitySchema;

    connection_pool_instance.establish_connection(function(current_db_conn, conn_callback) {
        acquire.seq([
            function(_ignored_param, sequential_callback) {
                var base_query_string = DiscountEntitySchema.build_base_query('WHERE item_identifier IS NOT NULL AND status = "active" LIMIT 1');
                DiscountEntitySchema.locate_records(current_db_conn, base_query_string, sequential_callback);
            },
            function(voucher_list, process_list_callback) {
                acquire.pmap(voucher_list, function(single_voucher_item, item_callback) {
                    // single_voucher_item.relates_to(current_db_conn, 'merchandise_item', item_callback);
                    item_callback(null, single_voucher_item.retrieve_discount_method());
                }, process_list_callback);
            }
        ], conn_callback);
    }, completion_callback);
};

acquire.handle_exceptions({
    'attempt_block': function(action_callback) {
        row_iterator_evaluation(action_callback);
    },
    'exception_handler': function(caught_error, error_callback) {
        console.log('flow management error intercepted');
        throw caught_error;
    }
}, completion_callback_factory);