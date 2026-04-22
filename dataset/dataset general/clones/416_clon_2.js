const sample_personnel = utils.chain([
    { identifier: 1, handle: "aaron", endpoint_path: '/api/v1/person/1/' },
    { identifier: 2, handle: "jessica", endpoint_path: '/api/v1/person/2/' },
    { identifier: 3, handle: "genevieve", endpoint_path: '/api/v1/person/3/' },
    { identifier: 4, handle: "keith", endpoint_path: '/api/v1/person/4/' },
    { identifier: 5, handle: "kylie", endpoint_path: '/api/v1/person/5/' },
    { identifier: 6, handle: "arthur", endpoint_path: '/api/v1/person/6/' },
    { identifier: 7, handle: "albert", endpoint_path: '/api/v1/person/7/' }
]);

jQuery.simulateAjax(function(req_data) {
    let personDetailMatch = req_data.url.match(/\/api\/v1\/person\/(\d+)\/$/i);

    if (personDetailMatch) {
        const personIdValue = parseInt(personDetailMatch[1], 10);

        return {
            isSuccess: true,
            responsePayload: sample_personnel.find(function(individual) {
                return individual.identifier === personIdValue;
            }).value()
        };
    }

    let query_params = {};

    utils.each(req_data.url.split('?')[1].split('&'), function(query_argument) {
        let parts = query_argument.split('=');
        query_params[parts[0]] = parts[1];
    });

    const max_results = parseInt(query_params.max_results || '0', 10);
    const start_index = parseInt(query_params.start_index || '0', 10);
    let data_items = [];

    if (max_results > 0) {
        data_items = sample_personnel.slice(start_index, start_index + max_results).value();
    } else {
        data_items = sample_personnel.slice(start_index).value();
    }

    return {
        isSuccess: true,
        responsePayload: {
            data_items: data_items,
            metadata: {
                max_results: max_results,
                start_index: start_index,
                total_records: sample_personnel.value().length
            }
        }
    };
});

const PersonEntity = EntityFramework.DataStore.Model.extend({
    rootUrl: '/api/v1/person/'
});

const PersonCollection = EntityFramework.DataStore.Collection.extend({
    rootUrl: '/api/v1/person/',
    entityType: PersonEntity
});

async_check("evaluating data store response structure", 3, function() {
    const desired_count = 3;

    const personnel_list = new PersonCollection([], {
        queryParameters: {
            max_results: desired_count,
            isActive: true
        }
    });

    personnel_list.fetch({
        onSuccess: function(result_data) {
            verify_equality(result_data.models.length, desired_count);
            verify_equality(result_data.metadata.max_results, desired_count);
            verify_equality(result_data.metadata.start_index, 0);
            begin_test();

            synchronous_check("entity endpoint verification", 1, function() {
                const individual_entity = result_data.first();
                const reference_entity = sample_personnel.first().value();

                verify_equality(individual_entity.url(), reference_entity.endpoint_path);
            });

            async_check("retrieving subsequent page", 3, function() {
                personnel_list.fetchNext({
                    onSuccess: function(next_page_data) {
                        verify_equality(next_page_data.models.length, desired_count * 2);
                        verify_equality(next_page_data.metadata.max_results, desired_count);
                        verify_equality(next_page_data.metadata.start_index, desired_count);
                        begin_test();
                    }
                });
            });
        }
    });
});

async_check("maximum results exceeding available records", 6, function() {
    const large_max_results = 100;
    const total_count_val = sample_personnel.value().length;

    const personnel_list = new PersonCollection([], {
        queryParameters: {
            max_results: large_max_results
        }
    });

    personnel_list.fetch({
        onSuccess: function(first_fetch_data) {
            verify_equality(first_fetch_data.models.length, total_count_val);
            verify_equality(first_fetch_data.metadata.max_results, large_max_results);
            verify_equality(first_fetch_data.metadata.start_index, 0);

            personnel_list.fetchNext({
                onSuccess: function(second_fetch_data) {
                    verify_equality(second_fetch_data.models.length, total_count_val);
                    verify_equality(second_fetch_data.metadata.max_results, large_max_results);
                    verify_equality(second_fetch_data.metadata.start_index, total_count_val);
                    begin_test();
                }
            });
        }
    });
});

synchronous_check("new entity endpoint generation", function() {
    const new_person_instance = new PersonEntity();
    verify_equality(new_person_instance.url(), '/api/v1/person/');
});

synchronous_check("entity metadata isolation check", function() {
    const Widget = EntityFramework.DataStore.Collection.extend();
    const Gadget = EntityFramework.DataStore.Collection.extend();

    const widget_instance = new Widget();
    const gadget_instance = new Gadget();

    widget_instance.metadata.start_index = 12;

    verify_inequality(widget_instance.metadata.start_index, gadget_instance.metadata.start_index);
});