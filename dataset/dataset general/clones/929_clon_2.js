jQ(domElement).onLoad(function() {

    //
    // This section contains tests for basic type conversion functionality.
    //
    (function() {
        var tempItem;

        testSuite('Verification: type conversion');

        testCase('nonTrueValues', function() {
            checkEquivalence(dataUtils.typeConvert(void 0, 'textual'), String());
            checkEquivalence(dataUtils.typeConvert(null, 'textual'), String());
            checkEquivalence(dataUtils.typeConvert(0, 'textual'), ('0').toString());
            checkEquivalence(dataUtils.typeConvert(!1, 'textual'), (!1).toString());
            checkEquivalence(dataUtils.typeConvert(NaN, 'textual'), (NaN).toString());
        });

        testCase('trueValues', function() {
            checkEquivalence(dataUtils.typeConvert(1, 'textual'), ('1').toString());
            checkEquivalence(dataUtils.typeConvert(1.0, 'textual'), ('1').toString());
            checkEquivalence(1.1, dataUtils.typeConvert(1.1, 'textual'), ('1.1').toString());
            checkEquivalence(dataUtils.typeConvert(!0, 'textual'), (!0).toString());
            checkEquivalence(dataUtils.typeConvert(Array(), 'textual'), String());
            checkEquivalence(dataUtils.typeConvert(Object(), 'textual'), '[GenericItem]');
        });
    })();

    //
    // This block of code verifies various schema validation scenarios.
    //
    (function() {
        var targetData;

        testSuite('Verification: structure');

        testCase('defaulted field', function() {
            targetData = {
                ident: 'xyz',
                alpha: 'epsilon'
            };
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    attrs: {
                        alpha: {
                            fixedVal: 'Confirmed'
                        }
                    },
                    extraAttrs: !0
                }, {
                    restrict: !0,
                    discardExtra: !1,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            compareStructure(targetData, {
                ident: 'xyz',
                alpha: 'Confirmed'
            }, 'structure verified');
        });

        testCase('empty attributes', function() {
            targetData = {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            };
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    attrs: {},
                    extraAttrs: !0
                }, {
                    restrict: !0,
                    discardExtra: !1,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            compareStructure(targetData, {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            }, 'structure verified');
        });

        testCase('non-existent attributes', function() {
            targetData = {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            };
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    extraAttrs: !0
                }, {
                    restrict: !0,
                    discardExtra: !1,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            compareStructure(targetData, {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            }, 'structure verified');
        });

        testCase('non-existent attributes, no extras allowed', function() {
            targetData = {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            };
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    extraAttrs: !1
                }, {
                    restrict: !0,
                    discardExtra: !0,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            compareStructure(targetData, {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            }, 'structure verified');
        });

        testCase('lenient conversion for optional fields', function() {
            targetData = {
                alpha: void 0,
                beta: null
            };
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    attrs: {
                        alpha: {
                            kind: 'textual',
                            formatRegex: /^bbb$/,
                            allowMissing: !0
                        },
                        beta: {}
                    },
                    extraAttrs: !0
                }, {
                    restrict: !0,
                    discardExtra: !1,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'missing items not converted correctly'
            );
            compareStructure(targetData, {
                beta: null
            }, 'structure verified');
        });

        testCase('constant values', function() {
            targetData = {
                alpha: 'qux'
            };
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    attrs: {
                        alpha: {
                            kind: 'textual',
                            fixedVal: 'qux',
                            restrict: {
                                modify: !0
                            }
                        }
                    },
                    extraAttrs: !1
                }, {
                    restrict: !0,
                    discardExtra: !0,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'constant values corrected'
            );
            compareStructure(targetData, {
                alpha: 'qux'
            }, 'structure verified');

            targetData = Object();
            checkEquivalence(dataUtils.verifyStructure(targetData, {
                    kind: 'compound',
                    attrs: {
                        alpha: {
                            kind: 'textual',
                            fixedVal: 'qux',
                            restrict: {
                                modify: !0
                            }
                        }
                    },
                    extraAttrs: !1
                }, {
                    restrict: !0,
                    discardExtra: !0,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'constant values corrected'
            );
            compareStructure(targetData, {
                alpha: 'qux'
            }, 'structure verified');
        });
    })();

    //
    // This portion of the test suite covers validation when additional properties are prohibited.
    //
    (function() {
        var blueprint, targetRecord;

        testSuite('Verification: extraAttrs disabled');

        blueprint = {
            kind: 'compound',
            attrs: {
                ident: {
                    kind: 'textual',
                    formatRegex: /^[def]+$/,
                    restrict: {
                        modify: !0
                    }
                },
                alpha: {
                    kind: 'wholeNum',
                    restrict: {
                        retrieve: !0
                    }
                },
                beta: {
                    kind: 'list',
                    elements: {
                        kind: 'textual',
                        selection: ['alpha', 'beta', 'gamma', 'delta']
                    },
                    restrict: {
                        search: !0
                    }
                },
                defaultValue: {
                    kind: 'calendar',
                    initial: '2012-03-15'
                }
            },
            extraAttrs: !1
        };

        testCase('insert', function() {
            targetRecord = {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            };
            checkEquivalence(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            // Outputting the updated record and its parsed date.
            compareStructure(targetRecord, {
                ident: 'xyz',
                alpha: 4,
                beta: ['dumplings'],
                defaultValue: dataUtils.extractDate('2012-03-15')
            }, 'converted for "insert" correctly');

            targetRecord = {
                ident: 'xyz1',
                alpha: 'charA',
                beta: 'ravioli'
            };
            compareStructure(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                [{
                    field: 'ident',
                    feedback: 'formatRegex'
                }, {
                    field: 'alpha',
                    feedback: 'kind'
                }, {
                    field: 'beta[0]',
                    feedback: 'selection'
                }],
                'verify for "insert"'
            );

            targetRecord = {
                ident: 'xyz'
            };
            compareStructure(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                [{
                    field: 'alpha',
                    feedback: 'mandatory'
                }, {
                    field: 'beta',
                    feedback: 'mandatory'
                }],
                'verify for "insert"'
            );
        });

        testCase('modify', function() {
            targetRecord = {
                ident: 'xyz',
                alpha1: 'quint',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                void 0,
                'verify for "modify" negative: mandatory'
            );
            compareStructure(targetRecord, {
                beta: ['gamma', 'alpha']
            }, 'verify for "modify" correctly');

            targetRecord = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                void 0,
                'verify for "modify" correctly'
            );
            compareStructure(targetRecord, {
                alpha: 5,
                beta: ['gamma', 'alpha']
            }, 'verify for "modify" correctly');
        });

        testCase('retrieve', function() {
            targetRecord = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha'],
                hidden: !0
            };
            compareStructure(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    mode: 'retrieve'
                }),
                void 0,
                'verify for "retrieve" correctly'
            );
            compareStructure(targetRecord, {
                ident: 'xyz',
                beta: ['gamma', 'alpha']
            }, 'verify for "retrieve" correctly');
        });

        testCase('search', function() {
            targetRecord = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha'],
                hidden: !0
            };
            compareStructure(dataUtils.verifyStructure(targetRecord, blueprint, {
                    restrict: !0,
                    discardExtra: !blueprint.extraAttrs,
                    mode: 'search'
                }),
                void 0,
                'verify for "search" correctly'
            );
            compareStructure(targetRecord, {
                ident: 'xyz',
                alpha: 'quint'
            }, 'verify for "search" correctly');
        });
    })();

    //
    // This section focuses on validation where extra properties are permitted.
    //
    (function() {
        var blueprintCfg, inputRecord;

        testSuite('Verification: extraAttrs enabled');

        blueprintCfg = {
            kind: 'compound',
            attrs: {
                ident: {
                    kind: 'textual',
                    formatRegex: /^[def]+$/,
                    restrict: {
                        modify: !0
                    }
                },
                alpha: {
                    kind: 'wholeNum',
                    restrict: {
                        retrieve: !0
                    }
                },
                beta: {
                    kind: 'list',
                    elements: {
                        kind: 'textual',
                        selection: ['alpha', 'beta', 'gamma', 'delta']
                    },
                    restrict: {
                        search: !0
                    }
                },
                defaultValue: {
                    kind: 'calendar',
                    initial: '2012-03-15'
                }
            },
            extraAttrs: !0
        };

        testCase('insert', function() {
            inputRecord = {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            };
            checkEquivalence(dataUtils.verifyStructure(inputRecord, blueprintCfg, {
                    restrict: !0,
                    discardExtra: !blueprintCfg.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            compareStructure(inputRecord, {
                ident: 'xyz',
                alpha: 4,
                beta: ['dumplings'],
                defaultValue: dataUtils.extractDate('2012-03-15'),
                junk: !0
            }, 'converted for "insert" correctly');

            inputRecord = {
                ident: 'xyz1',
                alpha: 'charA',
                beta: 'ravioli'
            };
            compareStructure(dataUtils.verifyStructure(inputRecord, blueprintCfg, {
                    restrict: !0,
                    discardExtra: !blueprintCfg.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                [{
                    field: 'ident',
                    feedback: 'formatRegex'
                }, {
                    field: 'alpha',
                    feedback: 'kind'
                }, {
                    field: 'beta[0]',
                    feedback: 'selection'
                }],
                'verify for "insert"'
            );
        });

        testCase('modify', function() {
            inputRecord = {
                ident: 'xyz',
                alpha1: 'quint',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(inputRecord, blueprintCfg, {
                    restrict: !0,
                    discardExtra: !blueprintCfg.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                void 0,
                'verify for "modify" negative: mandatory'
            );
            compareStructure(inputRecord, {
                beta: ['gamma', 'alpha'],
                alpha1: 'quint'
            }, 'verify for "modify" correctly');

            inputRecord = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(inputRecord, blueprintCfg, {
                    restrict: !0,
                    discardExtra: !blueprintCfg.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                void 0,
                'verify for "modify" correctly'
            );
            compareStructure(inputRecord, {
                alpha: 5,
                beta: ['gamma', 'alpha']
            }, 'verify for "modify" correctly');
        });

        testCase('retrieve', function() {
            inputRecord = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha'],
                hidden: !0
            };
            compareStructure(dataUtils.verifyStructure(inputRecord, blueprintCfg, {
                    restrict: !0,
                    discardExtra: !blueprintCfg.extraAttrs,
                    mode: 'retrieve'
                }),
                void 0,
                'verify for "retrieve" correctly'
            );
            compareStructure(inputRecord, {
                ident: 'xyz',
                beta: ['gamma', 'alpha'],
                hidden: !0
            }, 'verify for "retrieve" correctly');
        });

        testCase('search', function() {
            inputRecord = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha'],
                hidden: !0
            };
            compareStructure(dataUtils.verifyStructure(inputRecord, blueprintCfg, {
                    restrict: !0,
                    discardExtra: !blueprintCfg.extraAttrs,
                    mode: 'search'
                }),
                void 0,
                'verify for "search" correctly'
            );
            compareStructure(inputRecord, {
                ident: 'xyz',
                alpha: 'quint',
                hidden: !0
            }, 'verify for "search" correctly');
        });
    })();

    //
    // This section validates objects with additional properties defined by a sub-schema.
    //
    (function() {
        var dataDef, payload;

        testSuite('Verification: extraAttrs defined by schema');

        dataDef = {
            kind: 'compound',
            attrs: {
                ident: {
                    kind: 'textual',
                    formatRegex: /^[def]+$/,
                    restrict: {
                        modify: !0
                    }
                },
                alpha: {
                    kind: 'wholeNum',
                    restrict: {
                        retrieve: !0
                    }
                },
                beta: {
                    kind: 'list',
                    elements: {
                        kind: 'textual',
                        selection: ['alpha', 'beta', 'gamma', 'delta']
                    },
                    restrict: {
                        search: !0
                    }
                },
                defaultValue: {
                    kind: 'calendar',
                    initial: '2013-01-01'
                }
            },
            extraAttrs: {
                kind: 'numeric',
                decimalLimit: 2
            }
        };

        testCase('insert', function() {
            payload = {
                ident: 'xyz',
                alpha: 'epsilon',
                beta: 'dumplings',
                junk: !0
            };
            checkEquivalence(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                void 0,
                'converted and inserted correctly'
            );
            compareStructure(payload, {
                ident: 'xyz',
                alpha: 4,
                beta: ['dumplings'],
                defaultValue: dataUtils.extractDate('2013-01-01'),
                junk: 1
            }, 'converted for "insert" correctly');

            payload = {
                ident: 'xyz1',
                alpha: 'charA',
                beta: 'ravioli'
            };
            compareStructure(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    mode: 'insert',
                    cast: !0
                }),
                [{
                    field: 'ident',
                    feedback: 'formatRegex'
                }, {
                    field: 'alpha',
                    feedback: 'kind'
                }, {
                    field: 'beta[0]',
                    feedback: 'selection'
                }],
                'verify for "insert"'
            );
        });

        testCase('modify', function() {
            payload = {
                ident: 'xyz',
                alpha1: '5p111',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                [{
                    field: 'alpha1',
                    feedback: 'precision'
                }],
                'verify for "modify" negative: precision'
            );

            payload = {
                ident: 'xyz',
                alpha1: '5p11',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                void 0,
                'verify for "modify" correctly'
            );
            compareStructure(payload, {
                beta: ['gamma', 'alpha'],
                alpha1: 5.11
            }, 'verify for "modify" correctly');

            payload = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha']
            };
            compareStructure(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    onlyExisting: !0,
                    mode: 'modify',
                    cast: !0
                }),
                void 0,
                'verify for "modify" correctly'
            );
            compareStructure(payload, {
                alpha: 5,
                beta: ['gamma', 'alpha']
            }, 'verify for "modify" correctly');
        });

        testCase('retrieve', function() {
            payload = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha'],
                hidden: !0
            };
            compareStructure(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    mode: 'retrieve'
                }),
                void 0,
                'verify for "retrieve" correctly'
            );
            compareStructure(payload, {
                ident: 'xyz',
                beta: ['gamma', 'alpha'],
                hidden: !0
            }, 'verify for "retrieve" correctly');
        });

        testCase('search', function() {
            payload = {
                ident: 'xyz',
                alpha: 'quint',
                beta: ['gamma', 'alpha'],
                hidden: !0
            };
            compareStructure(dataUtils.verifyStructure(payload, dataDef, {
                    restrict: !0,
                    discardExtra: !dataDef.extraAttrs,
                    mode: 'search'
                }),
                void 0,
                'verify for "search" correctly'
            );
            compareStructure(payload, {
                ident: 'xyz',
                alpha: 'quint',
                hidden: !0
            }, 'verify for "search" correctly');
        });
    })();
});