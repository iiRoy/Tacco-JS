(function() {
    // Utility functions for character encoding.
    var convertUtf8ToJsString = function ( rawBytes ) {
        return decodeURIComponent( escape( rawBytes ) );
    };

    var convertJsStringToUtf8 = function ( jsString ) {
        return unescape( encodeURIComponent( jsString ) );
    };

    // Routines for handling boolean flags.
    var extractBitFlags = function ( byteStream ) {
        var singleByte = readByte( byteStream );
        return [
            !!(singleByte & 1),
            !!(singleByte & 2),
            !!(singleByte & 4),
            !!(singleByte & 8),
            !!(singleByte & 16),
            !!(singleByte & 32),
            !!(singleByte & 64),
            !!(singleByte & 128)
        ];
    };

    var insertBitFlags = function ( flagArray, byteStream ) {
        writeByte( flagArray[0] | (flagArray[1] << 1) | (flagArray[2] << 2) | (flagArray[3] << 3) |
                   (flagArray[4] << 4) | (flagArray[5] << 5) | (flagArray[6] << 6) | (flagArray[7] << 7),
                   byteStream );
    };

    // Routines for handling nibbles (half-bytes).
    var extractHalfByte = function ( byteStream ) {
        var singleByte = readByte( byteStream );
        return [ singleByte >>> 4, singleByte & 0x0f ];
    };

    var insertHalfByte = function ( nibbleTuple, byteStream ) {
        writeByte( nibbleTuple[0] << 4 | nibbleTuple[1], byteStream );
    };

    // Basic 8-bit operations.
    var getSigned8Bit = function ( integerValue ) {
        return (integerValue + 0x80) % 0x100 - 0x80;
    };

    var readByte = function ( byteStream ) {
        return byteStream.byteArray[byteStream.positionPointer++];
    };

    var writeByte = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
    };

    // 16-bit operations.
    var getSigned16Bit = function ( integerValue ) {
        return (integerValue + 0x8000) % 0x10000 - 0x8000;
    };

    var readShortLE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++];
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue >>>= 0;
        return byteValue;
    };

    var writeShortLE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
    };

    var readShortBE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++];
        byteValue >>>= 0;
        return byteValue;
    };

    var writeShortBE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
    };

    // 24-bit operations.
    var getSigned24Bit = function ( integerValue ) {
        return (integerValue + 0x800000) % 0x1000000 - 0x800000;
    };

    var readMediumLE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++];
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue >>>= 0;
        return byteValue;
    };

    var writeMediumLE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
    };

    var readMediumBE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++];
        byteValue >>>= 0;
        return byteValue;
    };

    var writeMediumBE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
    };

    // 32-bit operations.
    var getSigned32Bit = function ( integerValue ) {
        return (integerValue + 0x80000000) % 0x100000000 - 0x80000000;
    };

    var readLongLE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++];
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 24;
        byteValue >>>= 0;
        return byteValue;
    };

    var writeLongLE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 24) & 0xff;
    };

    var readLongBE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++] << 24;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++];
        byteValue >>>= 0;
        return byteValue;
    };

    var writeLongBE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 24) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
    };

    // 40-bit operations.
    var getSigned40Bit = function ( integerValue ) {
        return (integerValue + 0x8000000000) % 0x10000000000 - 0x8000000000;
    };

    var readFiveByteLE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++];
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 24;
        byteValue >>>= 0;
        byteValue += byteStream.byteArray[byteStream.positionPointer++] * 0x100000000;
        return byteValue;
    };

    var writeFiveByteLE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 24) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue / 0x100000000) & 0xff;
    };

    var readFiveByteBE = function ( byteStream ) {
        var highBytes = byteStream.byteArray[byteStream.positionPointer++] * 0x100000000;
        var byteValue = byteStream.byteArray[byteStream.positionPointer++] << 24;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++];
        byteValue >>>= 0;
        byteValue += highBytes;
        return byteValue;
    };

    var writeFiveByteBE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue / 0x100000000) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 24) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
    };

    // 48-bit operations.
    var getSigned48Bit = function ( integerValue ) {
        return (integerValue + 0x800000000000) % 0x1000000000000 - 0x800000000000;
    };

    var readSixByteLE = function ( byteStream ) {
        var byteValue = byteStream.byteArray[byteStream.positionPointer++];
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 24;
        byteValue >>>= 0;
        byteValue += byteStream.byteArray[byteStream.positionPointer++] * 0x100000000;
        byteValue += byteStream.byteArray[byteStream.positionPointer++] * 0x10000000000;
        return byteValue;
    };

    var writeSixByteLE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 24) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue / 0x100000000) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue / 0x10000000000) & 0xff;
    };

    var readSixByteBE = function ( byteStream ) {
        var highBytes = byteStream.byteArray[byteStream.positionPointer++] * 0x10000000000;
        highBytes += byteStream.byteArray[byteStream.positionPointer++] * 0x100000000;
        var byteValue = byteStream.byteArray[byteStream.positionPointer++] << 24;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 16;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++] << 8;
        byteValue |= byteStream.byteArray[byteStream.positionPointer++];
        byteValue >>>= 0;
        byteValue += highBytes;
        return byteValue;
    };

    var writeSixByteBE = function ( byteValue, byteStream ) {
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue / 0x10000000000) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue / 0x100000000) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 24) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 16) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = (byteValue >> 8) & 0xff;
        byteStream.byteArray[byteStream.positionPointer++] = byteValue & 0xff;
    };

    // BinarySchema class for defining data structures.
    var BinarySchema = function ( superSchema, totalByteLength, currentFormatter ) {
        if ( typeof superSchema === 'undefined' ) {
            this.totalByteLength = 0;
            this.formatters = [];
        } else {
            this.totalByteLength = superSchema.totalByteLength + totalByteLength;
            this.formatters = superSchema.formatters.concat( currentFormatter );
        }
    };

    BinarySchema.schematicPrototype = {
        // Add padding bytes (NUL).
        addPadding: function ( numBytes ) {
            if ( typeof numBytes === 'undefined' ) numBytes = 1;

            return new BinarySchema( this, numBytes, {
                unpack: function ( dataStream, targetObject ) {
                    dataStream.positionPointer += numBytes;
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = 0; idx < numBytes; ++idx ) {
                        writeByte( 0, dataStream );
                    }
                }
            });
        },

        // Define boolean flag fields.
        boolFlags: function ( fieldName, count ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 1, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = extractBitFlags( dataStream );
                    },

                    pack: function ( targetObject, dataStream ) {
                        insertBitFlags( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, count, {
                unpack: function ( dataStream, targetObject ) {
                    targetObject[fieldName] = [];
                    for ( var idx = 0; idx < count; ++idx ) {
                        targetObject[fieldName][idx] = extractBitFlags( dataStream );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = 0; idx < count; ++idx ) {
                        insertBitFlags( targetObject[fieldName][idx], dataStream );
                    }
                }
            });
        },

        // Define nibble fields.
        halfBytes: function ( fieldName, count ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 1, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = extractHalfByte( dataStream );
                    },

                    pack: function ( targetObject, dataStream ) {
                        insertHalfByte( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, count, {
                unpack: function ( dataStream, targetObject ) {
                    targetObject[fieldName] = [];
                    for ( var idx = 0; idx < count; ++idx ) {
                        targetObject[fieldName][idx] = extractHalfByte( dataStream );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = 0; idx < count; ++idx ) {
                        insertHalfByte( targetObject[fieldName][idx], dataStream );
                    }
                }
            });
        },

        // Signed 8-bit little-endian integer.
        signedInt8LE: function ( fieldName, count, outputBuffer ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 1, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = getSigned8Bit( readByte( dataStream ) );
                    },

                    pack: function ( targetObject, dataStream ) {
                        writeByte( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, 1 * count, {
                unpack: function ( dataStream, targetObject ) {
                    if ( typeof outputBuffer !== "undefined" ) {
                        targetObject[fieldName] = outputBuffer;
                    } else {
                        targetObject[fieldName] = [];
                    }

                    for ( var idx = count - 1; idx >= 0; --idx ) {
                        targetObject[fieldName][idx] = getSigned8Bit( readByte( dataStream ) );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = count - 1; idx >= 0; --idx ) {
                        writeByte( targetObject[fieldName][idx] || 0, dataStream );
                    }
                }
            });
        },

        // Unsigned 8-bit little-endian integer.
        unsignedInt8LE: function ( fieldName, count, outputBuffer ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 1, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = readByte( dataStream );
                    },

                    pack: function ( targetObject, dataStream ) {
                        writeByte( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, 1 * count, {
                unpack: function ( dataStream, targetObject ) {
                    if ( typeof outputBuffer !== "undefined" ) {
                        targetObject[fieldName] = outputBuffer;
                    } else {
                        targetObject[fieldName] = [];
                    }

                    for ( var idx = count - 1; idx >= 0; --idx ) {
                        targetObject[fieldName][idx] = readByte( dataStream );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = count - 1; idx >= 0; --idx ) {
                        writeByte( targetObject[fieldName][idx] || 0, dataStream );
                    }
                }
            });
        },

        // Signed 8-bit big-endian integer.
        signedInt8BE: function ( fieldName, count, outputBuffer ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 1, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = getSigned8Bit( readByte( dataStream ) );
                    },

                    pack: function ( targetObject, dataStream ) {
                        writeByte( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, 1 * count, {
                unpack: function ( dataStream, targetObject ) {
                    if ( typeof outputBuffer !== "undefined" ) {
                        targetObject[fieldName] = outputBuffer;
                    } else {
                        targetObject[fieldName] = [];
                    }

                    for ( var idx = 0; idx < count; ++idx ) {
                        targetObject[fieldName][idx] = getSigned8Bit( readByte( dataStream ) );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = 0; idx < count; ++idx ) {
                        writeByte( targetObject[fieldName][idx] || 0, dataStream );
                    }
                }
            });
        },

        // Unsigned 8-bit big-endian integer.
        unsignedInt8BE: function ( fieldName, count, outputBuffer ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 1, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = readByte( dataStream );
                    },

                    pack: function ( targetObject, dataStream ) {
                        writeByte( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, 1 * count, {
                unpack: function ( dataStream, targetObject ) {
                    if ( typeof outputBuffer !== "undefined" ) {
                        targetObject[fieldName] = outputBuffer;
                    } else {
                        targetObject[fieldName] = [];
                    }

                    for ( var idx = 0; idx < count; ++idx ) {
                        targetObject[fieldName][idx] = readByte( dataStream );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = 0; idx < count; ++idx ) {
                        writeByte( targetObject[fieldName][idx] || 0, dataStream );
                    }
                }
            });
        },

        // Signed 16-bit little-endian integer.
        signedInt16LE: function ( fieldName, count, outputBuffer ) {
            if ( typeof count === "undefined" ) {
                return new BinarySchema( this, 2, {
                    unpack: function ( dataStream, targetObject ) {
                        targetObject[fieldName] = getSigned16Bit( readShortLE( dataStream ) );
                    },

                    pack: function ( targetObject, dataStream ) {
                        writeShortLE( targetObject[fieldName], dataStream );
                    }
                });
            }

            return new BinarySchema( this, 2 * count, {
                unpack: function ( dataStream, targetObject ) {
                    if ( typeof outputBuffer !== "undefined" ) {
                        targetObject[fieldName] = outputBuffer;
                    } else {
                        targetObject[fieldName] = [];
                    }

                    for ( var idx = count - 1; idx >= 0; --idx ) {
                        targetObject[fieldName][idx] = getSigned16Bit( readShortLE( dataStream ) );
                    }
                },

                pack: function ( targetObject, dataStream ) {
                    for ( var idx = count - 1; idx >= 0; --idx ) {
                        writeShortLE( targetObject[fieldName][idx] || 0, dataStream );
                    }
                }
            });
        },

        // Unsigned 16-bit little-endian integer.
        unsignedInt16LE: function ( fieldName, count, outputBuffer ) {
            if ( typeof count === "undefined" ) {