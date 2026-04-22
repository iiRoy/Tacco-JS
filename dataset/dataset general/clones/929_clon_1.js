$(document).ready(
    function ()
    {
        /*
         * This section handles validation for coercion operations.
         * It includes tests for both falsy and truthy values.
         */

        ( function ()
            {
                var obj; // Declare object variable for later use.

                module( 'Validate: coerce' );

                // Test cases for falsy values.
                test( 'falsy',
                    function ()
                    {
                        equal( _.coerce( undefined, 'string' ), '' );
                        equal( _.coerce( null,      'string' ), '' );
                        equal( _.coerce( 0,         'string' ), '0' );
                        equal( _.coerce( false,     'string' ), 'false' );
                        equal( _.coerce( NaN,       'string' ), 'NaN' );
                    }
                );

                // Test cases for truthy values.
                test( 'truthy',
                    function ()
                    {
                        equal( _.coerce( 1,   'string' ), '1' );
                        equal( _.coerce( 1.0, 'string' ), '1' );
                        equal( _.coerce( 1.1, 'string' ), '1.1' );
                        equal( _.coerce( true, 'string' ), 'true' );
                        equal( _.coerce( [], 'string' ), '' );
                        equal( _.coerce( {}, 'string' ), '[object Object]' );
                    }
                );

            }
        )(); // End of coerce validation IIFE.


        /*
         * This section contains tests for schema validation,
         * focusing on various schema properties and behaviors.
         */

        ( function ()
            {
                var obj; // Object to be validated.

                module( 'Validate: schema' );

                // Test case for the 'value' attribute within a schema property.
                test( 'value attribute',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4' };

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    properties: {
                                        foo: {
                                            value: 'Зафиксировано'
                                        }
                                    },
                                    additionalProperties: true
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: false,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: 'Зафиксировано' },
                            'schema ok'
                        );
                    }
                );

                // Test case when 'properties' object in schema is empty.
                test( 'empty properties',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4', bar: 'vareniki', spam: true };

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    properties: {},
                                    additionalProperties: true
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: false,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: '4', bar: 'vareniki', spam: true },
                            'schema ok'
                        );
                    }
                );

                // Test case when 'properties' is undefined in the schema.
                test( 'undefined properties',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4', bar: 'vareniki', spam: true };

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    additionalProperties: true
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: false,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: '4', bar: 'vareniki', spam: true },
                            'schema ok'
                        );
                    }
                );

                // Test case with undefined properties and additionalProperties set to false.
                test( 'undefined properties and additionalProperties=false',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4', bar: 'vareniki', spam: true };

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    additionalProperties: false
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: true,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: '4', bar: 'vareniki', spam: true },
                            'schema ok'
                        );
                    }
                );

                // Test for greedy coercion behavior with optional properties.
                test( 'greedy coercion for optionals',
                    function ()
                    {
                        obj = { foo: undefined, bar: null };

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    properties: {
                                        foo: {
                                            type: 'string',
                                            pattern: /^aaa$/,
                                            optional: true
                                        },
                                        bar: {}
                                    },
                                    additionalProperties: true
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: false,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'optionals not coerced ok'
                        );

                        deepEqual(
                            obj,
                            { bar: null },
                            'schema ok'
                        );
                    }
                );

                // Test cases for handling fixed values in schema.
                test( 'fixed values',
                    function ()
                    {
                        obj = { foo: 'baz' };

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    properties: {
                                        foo: {
                                            type: 'string',
                                            value: 'bar',
                                            veto: {
                                                update: true
                                            }
                                        }
                                    },
                                    additionalProperties: false
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: true,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'fixed values fixed ok'
                        );
                        deepEqual( obj, { foo: 'bar' }, 'schema ok' );

                        // Another scenario for fixed values.
                        obj = {};

                        equal(
                            _.validate(
                                obj,
                                {
                                    type: 'object',
                                    properties: {
                                        foo: {
                                            type: 'string',
                                            value: 'bar',
                                            veto: {
                                                update: true
                                            }
                                        }
                                    },
                                    additionalProperties: false
                                },
                                {
                                    veto: true,
                                    removeAdditionalProps: true,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'fixed values fixed ok'
                        );
                        deepEqual( obj, { foo: 'bar' }, 'schema ok' );
                    }
                );

            }
        )(); // End of schema validation IIFE.


        /*
         * This module tests schema validation when 'additionalProperties' is set to false.
         * It defines a base schema and applies different validation flavors (add, update, get, query).
         */

        ( function ()
            {
                var schema, obj; // Declare schema and object variables.

                module( 'Validate: additionalProperties=false' );

                schema = {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            pattern: /^[abc]+$/,
                            veto: {
                                update: true
                            }
                        },
                        foo: {
                            type: 'integer',
                            veto: {
                                get: true
                            }
                        },
                        bar: {
                            type: 'array',
                            items: {
                                type: 'string',
                                'enum': [ 'eniki', 'beniki', 'eli', 'vareniki' ]
                            },
                            veto: {
                                query: true
                            }
                        },
                        defaulty: {
                            type: 'date',
                            'default': '2011-02-14'
                        }
                    },
                    additionalProperties: false
                };

                // Test 'add' validation flavor.
                test( 'add',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4', bar: 'vareniki', spam: true };

                        equal(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        //console.log(obj.defaulty, _.parseDate('2011-02-14')); // Original commented line.
                        deepEqual(
                            obj,
                            { id: 'bac', foo: 4, bar: [ 'vareniki' ], defaulty: _.parseDate( '2011-02-14' ) },
                            'coerced for "add" ok'
                        );

                        obj = { id: 'bac1', foo: 'a', bar: 'pelmeshki' };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            [
                                { property: 'id', message: 'pattern' },
                                { 'property': 'foo', 'message': 'type' },
                                { 'property': 'bar[0]', 'message': 'enum' }
                            ],
                            'validate for "add"'
                        );

                        obj = { id: 'bac' };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            [
                                { 'property': 'foo', 'message': 'required' },
                                { 'property': 'bar', 'message': 'required' }
                            ],
                            'validate for "add"'
                        );
                    }
                );

                // Test 'update' validation flavor.
                test( 'update',
                    function ()
                    {
                        obj = { id: 'bac', foo1: '5', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            null,
                            'validate for "update" nak: required'
                        );

                        deepEqual( obj, { bar: [ 'eli', 'eniki' ] }, 'validate for "update" ok' );

                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            null,
                            'validate for "update" ok'
                        );

                        deepEqual( obj, { foo: 5, bar: [ 'eli', 'eniki' ] }, 'validate for "update" ok' );
                    }
                );

                // Test 'get' validation flavor.
                test( 'get',
                    function ()
                    {
                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ], secret: true };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'get'
                                }
                            ),
                            null,
                            'validate for "get" ok'
                        );

                        deepEqual( obj, { id: 'bac', bar: [ 'eli', 'eniki' ] }, 'validate for "get" ok' );
                    }
                );

                // Test 'query' validation flavor.
                test( 'query',
                    function ()
                    {
                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ], secret: true };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'query'
                                }
                            ),
                            null,
                            'validate for "query" ok'
                        );

                        deepEqual( obj, { id: 'bac', foo: '5' }, 'validate for "query" ok' );
                    }
                );

            }
        )(); // End of additionalProperties=false IIFE.


        /*
         * This module tests schema validation when 'additionalProperties' is explicitly set to true.
         * This allows extra properties not defined in the schema to exist.
         */

        ( function ()
            {
                var schema, obj; // Schema and object for tests.

                module( 'Validate: additionalProperties=true' );

                schema = {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            pattern: /^[abc]+$/,
                            veto: {
                                update: true
                            }
                        },
                        foo: {
                            type: 'integer',
                            veto: {
                                get: true
                            }
                        },
                        bar: {
                            type: 'array',
                            items: {
                                type: 'string',
                                'enum': [ 'eniki', 'beniki', 'eli', 'vareniki' ]
                            },
                            veto: {
                                query: true
                            }
                        },
                        defaulty: {
                            type: 'date',
                            'default': '2011-02-14'
                        }
                    },
                    additionalProperties: true
                };

                // Test 'add' validation flavor with additional properties allowed.
                test( 'add',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4', bar: 'vareniki', spam: true };

                        equal(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: 4, bar: [ 'vareniki' ], defaulty: _.parseDate( '2011-02-14' ), spam: true },
                            'coerced for "add" ok'
                        );

                        obj = { id: 'bac1', foo: 'a', bar: 'pelmeshki' };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            [
                                { property: 'id', message: 'pattern' },
                                { 'property': 'foo', 'message': 'type' },
                                { 'property': 'bar[0]', 'message': 'enum' }
                            ],
                            'validate for "add"'
                        );
                    }
                );

                // Test 'update' validation flavor with additional properties allowed.
                test( 'update',
                    function ()
                    {
                        obj = { id: 'bac', foo1: '5', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            null,
                            'validate for "update" nak: required'
                        );

                        deepEqual(
                            obj,
                            { bar: [ 'eli', 'eniki' ], foo1: '5' },
                            'validate for "update" ok'
                        );

                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            null,
                            'validate for "update" ok'
                        );

                        deepEqual( obj, { foo: 5, bar: [ 'eli', 'eniki' ] }, 'validate for "update" ok' );
                    }
                );

                // Test 'get' validation flavor with additional properties allowed.
                test( 'get',
                    function ()
                    {
                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ], secret: true };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'get'
                                }
                            ),
                            null,
                            'validate for "get" ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', bar: [ 'eli', 'eniki' ], secret: true },
                            'validate for "get" ok'
                        );
                    }
                );

                // Test 'query' validation flavor with additional properties allowed.
                test( 'query',
                    function ()
                    {
                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ], secret: true };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'query'
                                }
                            ),
                            null,
                            'validate for "query" ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: '5', secret: true },
                            'validate for "query" ok'
                        );
                    }
                );

            }
        )(); // End of additionalProperties=true IIFE.


        /*
         * This module specifically tests schema validation
         * when 'additionalProperties' is itself a schema.
         * This means additional properties must conform to a specified type.
         */

        ( function ()
            {
                var schema, obj; // Define schema and object.

                module( 'Validate: additionalProperties=schema' );

                schema = {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            pattern: /^[abc]+$/,
                            veto: {
                                update: true
                            }
                        },
                        foo: {
                            type: 'integer',
                            veto: {
                                get: true
                            }
                        },
                        bar: {
                            type: 'array',
                            items: {
                                type: 'string',
                                'enum': [ 'eniki', 'beniki', 'eli', 'vareniki' ]
                            }, // Note: comma here was optional, adding it for consistency
                            veto: {
                                query: true
                            }
                        },
                        defaulty: {
                            type: 'date',
                            'default': '2011-12-31'
                        }
                    },
                    additionalProperties: {
                        type: 'number',
                        maxDecimal: 2
                    }
                };

                // Test 'add' validation flavor with additionalProperties as a schema.
                test( 'add',
                    function ()
                    {
                        obj = { id: 'bac', foo: '4', bar: 'vareniki', spam: true };

                        equal(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            null,
                            'coerced and added ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: 4, bar: [ 'vareniki' ], defaulty: _.parseDate( '2011-12-31' ), spam: 1 },
                            'coerced for "add" ok'
                        );

                        obj = { id: 'bac1', foo: 'a', bar: 'pelmeshki' };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'add',
                                    coerce: true
                                }
                            ),
                            [
                                { property: 'id', message: 'pattern' },
                                { 'property': 'foo', 'message': 'type' },
                                { 'property': 'bar[0]', 'message': 'enum' }
                            ],
                            'validate for "add"'
                        );
                    }
                );

                // Test 'update' validation flavor with additionalProperties as a schema.
                test( 'update',
                    function ()
                    {
                        obj = { id: 'bac', foo1: '5.111', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            [ { property: 'foo1', message: 'digits' } ],
                            'validate for "update" nak: digits'
                        );

                        obj = { id: 'bac', foo1: '5.11', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            null,
                            'validate for "update" ok'
                        );

                        deepEqual(
                            obj,
                            { bar: [ 'eli', 'eniki' ], foo1: 5.11 },
                            'validate for "update" ok'
                        );

                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ] };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    existingOnly: true,
                                    flavor: 'update',
                                    coerce: true
                                }
                            ),
                            null,
                            'validate for "update" ok'
                        );

                        deepEqual( obj, { foo: 5, bar: [ 'eli', 'eniki' ] }, 'validate for "update" ok' );
                    }
                );

                // Test 'get' validation flavor with additionalProperties as a schema.
                test( 'get',
                    function ()
                    {
                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ], secret: true };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'get'
                                }
                            ),
                            null,
                            'validate for "get" ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', bar: [ 'eli', 'eniki' ], secret: true },
                            'validate for "get" ok'
                        );
                    }
                );

                // Test 'query' validation flavor with additionalProperties as a schema.
                test( 'query',
                    function ()
                    {
                        obj = { id: 'bac', foo: '5', bar: [ 'eli', 'eniki' ], secret: true };

                        deepEqual(
                            _.validate(
                                obj,
                                schema,
                                {
                                    veto: true,
                                    removeAdditionalProps: !schema.additionalProperties,
                                    flavor: 'query'
                                }
                            ),
                            null,
                            'validate for "query" ok'
                        );

                        deepEqual(
                            obj,
                            { id: 'bac', foo: '5', secret: true },
                            'validate for "query" ok'
                        );
                    }
                );

            }
        )(); // End of additionalProperties=schema IIFE.

    }
);