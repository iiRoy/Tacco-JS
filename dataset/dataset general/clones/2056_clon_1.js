/*
 * Copyright (c) 2015, salesforce.com, inc. All rights reserved.
 * This software is licensed under the BSD 3-Clause License.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of salesforce.com, inc. nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Core Node.js modules and third-party libraries
var assert    = require('assert');
var sinon     = require('sinon');

var fs        = require('fs');
var path      = require('path');
var gulp      = require('gulp');
var gulpu     = require('gulp-util');
var through   = require('through2');
var _         = require('lodash');
var xml2js    = require('xml2js');

// Internal project modules
var $stream   = require('../../dist/stream-util');
var $props    = require('../../dist/props');

/**
 * Checks if the given value is an error instance.
 * @param {any} error - The value to check.
 * @returns {boolean} - True if the value is an Error or PluginError, false otherwise.
 */
function isError(
    error
) {
    return (
        (error instanceof Error) ||
        (error instanceof gulpu.PluginError)
    );
}


describe(
    '$props',
    function() {

        // Test suite for getValueTransform method
        describe(
            '#getValueTransform()',
            function() {

                it('throws an error if the valueTransform is not registered', function() {
                    assert.throws(function() {
                        $props.getValueTransform('foo');
                    });
                });

                it('returns a copy of the valueTransform', function() {
                    var t = $props.getValueTransform('color/rgb');
                    assert(typeof t.matcher === 'function');
                    assert(typeof t.transformer === 'function');
                });
            }
        );


        // Test suite for valueTransformIsRegistered method
        describe(
            '#valueTransformIsRegistered()',
            function() {

                it('returns true if the value transform is registered', function() {
                    assert($props.valueTransformIsRegistered('color/rgb'));
                });

                it('returns false if the value transform isnt registered', function() {
                    assert($props.valueTransformIsRegistered('color/rgb/foo') === false);
                });
            }
        );


        // Test suite for registerValueTransform method
        describe(
            '#registerValueTransform()',
            function() {

                var matcher = function() {}; // Dummy matcher function
                var transformer = function() {}; // Dummy transformer function

                it('throws an error if the name is not passed or is not a string', function() {
                    assert.throws(function() {
                        $props.registerValueTransform();
                    });
                    assert.throws(function() {
                        $props.registerValueTransform(true);
                    });
                });

                it('throws an error if the matcher is not passed or not a function', function() {
                    assert.throws(function() {
                        $props.registerValueTransform('foo');
                    });
                    assert.throws(function() {
                        $props.registerValueTransform('foo', true);
                    });
                });

                it('throws an error if the transformer is not passed or not a function', function() {
                    assert.throws(function() {
                        $props.registerValueTransform('foo', function() {});
                    });
                    assert.throws(function() {
                        $props.registerValueTransform('foo', function() {}, true);
                    });
                });

                it('registers the valueTransform', function() {
                    $props.registerValueTransform('foo', matcher, transformer);
                    var r = $props.getValueTransform('foo');
                    assert(r.matcher === matcher);
                    assert(r.transformer === transformer);
                });

                it('registers the valueTransform and overwrites any pre-existing valueTransforms', function() {
                    var m = function() {
                        return true;
                    };
                    var t = function(value) {
                        return value;
                    };
                    $props.registerValueTransform('foo', m, t);
                    var r = $props.getValueTransform('foo');
                    assert(r.matcher !== matcher);
                    assert(r.transformer !== transformer);
                });
            }
        );


        // Test suite for getTransform method
        describe(
            '#getTransform()',
            function() {

                it('throws an error if the transform is not registered', function() {
                    assert.throws(function() {
                        $props.getTransform('foo');
                    });
                });

                it('returns a copy of the transform', function() {
                    var t = $props.getTransform('web');
                    assert(_.includes(t, 'color/rgb'));
                });
            }
        );


        // Test suite for transformIsRegistered method
        describe(
            '#transformIsRegistered()',
            function() {

                it('returns true if the value transform is registered', function() {
                    assert($props.transformIsRegistered('web'));
                });

                it('returns false if the value transform isnt registered', function() {
                    assert($props.transformIsRegistered('foo') === false);
                });
            }
        );


        // Test suite for registerTransform method
        describe(
            '#registerTransform()',
            function() {

                it('throws an error if the name is not passed or is not a string', function() {
                    assert.throws(function() {
                        $props.registerTransform();
                    });
                    assert.throws(function() {
                        $props.registerTransform(true);
                    });
                });

                it('throws an error if the list of valueMatchers is not passed or not an array', function() {
                    assert.throws(function() {
                        $props.registerTransform('foo');
                    });
                    assert.throws(function() {
                        $props.registerTransform('foo', true);
                    });
                });

                it('throws an error if any of the value transforms are not registered', function() {
                    assert.throws(function() {
                        $props.registerTransform('foo', ['hello']);
                    });
                });

                it('registers the transform', function() {
                    $props.registerTransform('foo', ['foo']);
                    var r = $props.getTransform('foo');
                    assert(r[0] === 'foo');
                });

                it('registers the transform and overwrites any pre-existing transforms', function() {
                    $props.registerTransform('foo', ['color/rgb']);
                    var r = $props.getTransform('foo');
                    assert(r[0] === 'color/rgb');
                });
            }
        );


        // Test suite for getFormat method
        describe(
            '#getFormat)',
            function() {

                it('throws an error if the format is not registered', function() {
                    assert.throws(function() {
                        $props.getFormat('foo');
                    });
                });

                it('returns a copy of the format', function() {
                    var f = $props.getFormat('scss');
                    assert(typeof f === 'function');
                });
            }
        );


        // Test suite for formatIsRegistered method
        describe(
            '#formatIsRegistered()',
            function() {

                it('returns true if the value transform is registered', function() {
                    assert($props.formatIsRegistered('scss'));
                });

                it('returns false if the value transform isnt registered', function() {
                    assert($props.formatIsRegistered('foo') === false);
                });
            }
        );


        // Test suite for registerFormat method
        describe(
            '#registerFormat()',
            function() {

                var formatter = function() {}; // Dummy formatter function

                it('throws an error if the name is not passed or is not a string', function() {
                    assert.throws(function() {
                        $props.registerFormat();
                    });
                    assert.throws(function() {
                        $props.registerFormat(true);
                    });
                });

                it('throws an error if the formatter is not passed or not an function', function() {
                    assert.throws(function() {
                        $props.registerFormat('foo');
                    });
                    assert.throws(function() {
                        $props.registerFormat('foo', true);
                    });
                });

                it('registers the format', function() {
                    $props.registerFormat('foo', formatter);
                    var f = $props.getFormat('foo');
                    assert(f === formatter);
                });
            }
        );

    }
);


describe(
    '$props.plugins',
    function() {

        // Test suite for the legacy plugin
        describe(
            '#legacy()',
            function() {

                // Helper function A for legacy tests
                function legacyA(
                    done,
                    format
                ) {
                    var src = path.resolve(__dirname, 'mock', 'legacy.json')
                    gulp.src(src)
                        .pipe(through.obj(function(file, enc, next) {
                            var json = JSON.parse(file.contents.toString());
                            file.contents = new Buffer(format(json));
                            next(null, file);
                        }))
                        .pipe($props.plugins.legacy())
                        .on('error', function(err) {
                            done(err);
                        })
                        .on('finish', function() {
                            done();
                        });
                }

                // Helper function B for legacy tests
                function legacyB(
                    done
                ) {
                    var files = [];
                    var src = path.resolve(__dirname, 'mock', 'legacy.json')
                    gulp.src(src)
                        .pipe($props.plugins.legacy())
                        .pipe(through.obj(function(file, enc, next) {
                            files.push(file);
                            next();
                        }))
                        .on('finish', function() {
                            done(files);
                        });
                }

                // Helper function C for legacy tests
                function legacyC(
                    done
                ) {
                    var files = [];
                    var src = path.resolve(__dirname, 'mock', 'legacy-alt.json')
                    gulp.src(src)
                        .pipe($props.plugins.legacy())
                        .pipe(through.obj(function(file, enc, next) {
                            files.push(file);
                            next();
                        }))
                        .on('finish', function() {
                            done(files);
                        });
                }

                it('pipes an error if invalid Design Properties file is encoutered', function(done) {
                    legacyA(function(error) {
                        assert(isError(error));
                        assert(/encountered an invalid/.test(error.message));
                        done();
                    }, function(json) {
                        return '{"foo":}';
                    });
                });

                it('pipes an error if the Design Properties file is not an object', function(done) {
                    legacyA(function(error) {
                        assert(isError(error));
                        assert(/non object/.test(error.message));
                        done();
                    }, function(json) {
                        return '[]';
                    });
                });

                it('pipes an error if a property with no "name" key is found', function(done) {
                    legacyA(function(error) {
                        assert(isError(error));
                        assert(/name/.test(error.message));
                        done();
                    }, function(json) {
                        json.theme.properties = [{
                            "value": "red"
                        }];
                        return JSON.stringify(json);
                    });
                });

                it('created a single JSON file', function(done) {
                    legacyB(function(files) {
                        assert(files.length === 1);
                        done();
                    });
                });

                it('produces valid JSON', function(done) {
                    legacyB(function(files) {
                        assert.doesNotThrow(function() {
                            JSON.parse(files[0].contents.toString());
                        });
                        done();
                    })
                });

                it('converts legacy design properties to the new format', function(done) {
                    legacyB(function(files) {
                        var json = JSON.parse(files[0].contents.toString());
                        assert(json.props.a.value === 'foo');
                        assert(json.props.b.value === 'bar');
                        assert(typeof json.theme === 'undefined');
                        done();
                    })
                });

                it('converts legacy aliases to the new format', function(done) {
                    legacyB(function(files) {
                        var json = JSON.parse(files[0].contents.toString());
                        assert(!_.isArray(json.aliases));
                        assert(_.has(json.aliases, 'SKY'));
                        done();
                    })
                });

                it('imports legacy aliases', function(done) {
                    legacyC(function(files) {
                        var json = JSON.parse(files[0].contents.toString());
                        assert(!_.isArray(json.aliases));
                        assert(_.has(json.aliases, 'SKY'));
                        done();
                    })
                });

                it('imports converts imports to auraImports', function(done) {
                    legacyC(function(files) {
                        var json = JSON.parse(files[0].contents.toString());
                        assert(_.isArray(json.auraImports));
                        done();
                    })
                });

                it('imports converts extends to auraExtends', function(done) {
                    legacyC(function(files) {
                        var json = JSON.parse(files[0].contents.toString());
                        assert(_.isString(json.auraExtends));
                        done();
                    })
                });

                it('adds a relevant type if possible', function(done) {
                    legacyC(function(files) {
                        var json = JSON.parse(files[0].contents.toString());
                        assert(json.props.d.type === 'color');
                        assert(json.props.e.type === 'size');
                        done();
                    })
                });
            }
        );


        // Test suite for the transform plugin
        describe(
            '#transform',
            function() {

                it('transforms Design Properties as JSON', function(done) {
                    var error;
                    gulp.src(path.resolve(__dirname, 'mock', 'sample.json'))
                        .on('error', function(err) {
                            error = err;
                        })
                        .on('finish', function() {
                            assert(typeof error === 'undefined');
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                });

                it('transforms Design Properties as YML', function(done) {
                    var error;
                    gulp.src(path.resolve(__dirname, 'mock', 'sample.yml'))
                        .on('error', function(err) {
                            error = err;
                        })
                        .on('finish', function() {
                            assert(typeof error === 'undefined');
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                });
            }
        );


        // Test suite for the format plugin
        describe(
            '#format',
            function() {

                it('throws an error for invalid options', function() {
                    assert.throws(function() {
                        $props.plugins.format('web', false);
                    });
                });

                it('throws an error if options.propsFilter is not a function', function() {
                    try {
                        $props.plugins.format('web', {
                            propsFilter: false
                        });
                    } catch (e) {
                        // This 'error' variable is not defined in this scope, so this assert will always fail or throw.
                        // It seems like a copy-paste error from another test.
                        // assert(typeof error === 'undefined');
                        assert(/function/.test(e.message));
                    }
                });

                it('formats props', function(done) {
                    var error, result;
                    var samplePath = path.resolve(__dirname, 'mock', 'sample.json');
                    var postResult;
                    gulp.src(samplePath)
                        .on('error', function(err) {
                            error = err;
                        })
                        .on('finish', function() {
                            assert(typeof error === 'undefined');
                            assert.doesNotThrow(function() {
                                JSON.parse(postResult);
                            });
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                        .pipe($props.plugins.format('raw.json'))
                        .pipe($props.plugins.getResult(function(result) {
                            postResult = result;
                        }));
                });

                it('filters props before formatting', function(done) {
                    var error, result;
                    var samplePath = path.resolve(__dirname, 'mock', 'sample.json');
                    //var preResult = JSON.parse(fs.readFileSync(samplePath)); // This line was commented out in original
                    var postResult;
                    gulp.src(samplePath)
                        .on('finish', function() {
                            assert(postResult.propKeys.length === 1);
                            assert(_.keys(postResult.props).length === 1);
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                        .pipe($props.plugins.format('raw.json', {
                            propsFilter: function(prop) {
                                return prop.name === 'account';
                            }
                        }))
                        .pipe($props.plugins.getResult(function(result) {
                            postResult = JSON.parse(result);
                        }));
                });

                it('renames the file correctly', function(done) {
                    var resultFile;
                    var samplePath = path.resolve(__dirname, 'mock', 'sample.json');
                    gulp.src(samplePath)
                        .on('finish', function() {
                            assert(resultFile.relative === 'sample.scss');
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                        .pipe($props.plugins.format('scss'))
                        .pipe(through.obj(function(file, enc, next) {
                            resultFile = file
                            next(null, file);
                        }))
                });
            }
        );


        // Test suite for the getResult plugin
        describe(
            '#getResult',
            function() {

                it('gets the result of a transform', function(done) {
                    var error;
                    var spy = sinon.spy();
                    gulp.src(path.resolve(__dirname, 'mock', 'sample.json'))
                        .on('error', function(err) {
                            error = err;
                        })
                        .on('finish', function() {
                            assert(typeof error === 'undefined');
                            assert(spy.calledOnce);
                            assert.doesNotThrow(function() {
                                JSON.parse(spy.getCall(0).args[0]);
                            });
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                        .pipe($props.plugins.getResult(spy));
                });

                it('gets the result of a format', function(done) {
                    var error;
                    var spy = sinon.spy();
                    gulp.src(path.resolve(__dirname, 'mock', 'sample.json'))
                        .on('error', function(err) {
                            error = err;
                        })
                        .on('finish', function() {
                            assert(typeof error === 'undefined');
                            assert(spy.calledOnce);
                            assert.doesNotThrow(function() {
                                JSON.parse(spy.getCall(0).args[0]);
                            });
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                        .pipe($props.plugins.format('raw.json'))
                        .pipe($props.plugins.getResult(spy));
                });

                it('passes the file through the stream', function(done) {
                    var error;
                    var spy = sinon.spy();
                    var spy2 = sinon.spy();
                    gulp.src(path.resolve(__dirname, 'mock', 'sample.json'))
                        .on('error', function(err) {
                            error = err;
                        })
                        .on('finish', function() {
                            assert(typeof error === 'undefined');
                            assert(spy.calledOnce);
                            assert(spy2.calledOnce);
                            done();
                        })
                        .pipe($props.plugins.transform('web'))
                        .pipe($props.plugins.format('raw.json'))
                        .pipe($props.plugins.getResult(spy))
                        .pipe($props.plugins.getResult(spy2));
                });
            }
        );


        // Test suite for the diff plugin
        describe(
            '#diff()',
            function() {
                var files, log; // Declaring variables for use in tests

                // Setup before each test in this suite
                beforeEach(function(done) {
                    files = [];
                    var src = [
                        path.resolve(__dirname, 'mock', 'a.json'),
                        path.resolve(__dirname, 'mock', 'b.json')
                    ];
                    gulp.src(src)
                        .pipe($props.plugins.transform('ios'))
                        .pipe($props.plugins.diff())
                        .pipe(through.obj(function(file, enc, next) {
                            files.push(file);
                            next();
                        }))
                        .on('finish', done);
                });

                it('created a single change log', function() {
                    assert(files.length === 1);
                });

                it('produces valid JSON', function() {
                    assert.doesNotThrow(function() {
                        JSON.parse(files[0].contents.toString());
                    });
                });
            }
        );