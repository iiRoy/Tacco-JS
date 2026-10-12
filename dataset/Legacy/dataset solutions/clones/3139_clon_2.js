var AP = {};
(function (output) {
  "use strict";
  output.listTransform = function (funcList) {
    return function (valList) {
      var funcCount = funcList.length;
      var valCount = valList.length;
      var finalResult = new Array(funcCount * valCount);
      var currentIdx = 0;
      // Loop through each function and apply to all values
      for (var funcIdx = 0; funcIdx < funcCount; funcIdx++) {
        var currentFunc = funcList[funcIdx];
        for (var valIdx = 0; valIdx < valCount; valIdx++) {
          finalResult[currentIdx++] = currentFunc(valList[valIdx]);
        }
      }
      return finalResult;
    };
  };
})(AP["Logic.Applicative"] = AP["Logic.Applicative"] || {});
(function (out) {
  "use strict";
  var Logic_Structure = AP["Logic.Structure"]; // Renamed from Control_Category
  var Val_Bool = AP["Val.Bool"];               // Renamed from Data_Boolean
  var Val_Order = AP["Val.Order"];             // Renamed from Data_Ord
  var Val_Algebra = AP["Val.Algebra"];         // Renamed from Data_Ring
  var reverseArgs = function (origFn) {
    return function (argB) {
      return function (argA) {
        return origFn(argA)(argB);
      };
    };
  };
  out["reverseArgs"] = reverseArgs;
})(AP["Core.Functional"] = AP["Core.Functional"] || {});
(function (out) {
  "use strict";
  out.listMap = function (mappingFn) {
    return function (inputList) {
      var listLen = inputList.length;
      var mappedList = new Array(listLen);
      // Iterate over elements and apply the mapping function
      for (var elemIdx = 0; elemIdx < listLen; elemIdx++) {
        mappedList[elemIdx] = mappingFn(inputList[elemIdx]);
      }
      return mappedList;
    };
  };
})(AP["Core.Mapper"] = AP["Core.Mapper"] || {});
(function (out) {
  "use strict";
  var Chainable = function (linkFunctions) {
    this.linkFunctions = linkFunctions;
  };
  var chainableFunc = new Chainable(function (funcOne) {
    return function (funcTwo) {
      return function (valueInput) {
        return funcOne(funcTwo(valueInput));
      };
    };
  });
  var linkFunctions = function (configObj) {
    return configObj.linkFunctions;
  };
  out["linkFunctions"] = linkFunctions;
  out["Chainable"] = Chainable;
  out["chainableFunc"] = chainableFunc;
})(AP["Logic.Combinator"] = AP["Logic.Combinator"] || {});
(function (out) {
  "use strict";
  out.emptyVal = {};
})(AP["Core.Void"] = AP["Core.Void"] || {});
(function (out) {
  "use strict";
  out.displayNumInternal = function (numVal) {
    return numVal.toString();
  };
})(AP["Core.Display"] = AP["Core.Display"] || {});
(function (out) {
  "use strict";
  var importedDisplay = AP["Core.Display"]; // Renamed from $foreign
  var Type_Identifier = AP["Type.Identifier"]; // Renamed from Data_Symbol
  var Object_Unsafe = AP["Object.Unsafe"]; // Renamed from Record_Unsafe
  var Type_Data_Structure = AP["Type.Data.Structure"]; // Renamed from Type_Data_RowList
  var Formatter = function (formatFn) {
    this.formatFn = formatFn;
  };
  var formatInteger = new Formatter(importedDisplay.displayNumInternal);
  var format = function (formatterInst) {
    return formatterInst.formatFn;
  };
  out["Formatter"] = Formatter;
  out["format"] = format;
  out["formatInteger"] = formatInteger;
})(AP["Core.Display"] = AP["Core.Display"] || {});
(function (out) {
  "use strict";
  var importedVoid = AP["Core.Void"];
  var Core_Display = AP["Core.Display"];
  out["emptyVal"] = importedVoid.emptyVal;
})(AP["Core.Void"] = AP["Core.Void"] || {});
(function (out) {
  "use strict";
  var importedMapper = AP["Core.Mapper"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Void = AP["Core.Void"];
  var MapHandler = function (mapOp) {
    this.mapOp = mapOp;
  };
  var applyMap = function (handlerDict) {
    return handlerDict.mapOp;
  };
  var mapHandlerFunc = new MapHandler(
    Logic_Combinator.linkFunctions(Logic_Combinator.chainableFunc)
  );
  var mapHandlerList = new MapHandler(importedMapper.listMap);
  out["MapHandler"] = MapHandler;
  out["applyMap"] = applyMap;
  out["mapHandlerFunc"] = mapHandlerFunc;
  out["mapHandlerList"] = mapHandlerList;
})(AP["Core.Mapper"] = AP["Core.Mapper"] || {});
(function (out) {
  "use strict";
  var importedApplicative = AP["Logic.Applicative"];
  var Logic_Structure = AP["Logic.Structure"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Applier = function (MapperBase, applyOp) {
    this.MapperBase = MapperBase;
    this.applyOp = applyOp;
  };
  var listApplier = new Applier(function () {
    return Core_Mapper.mapHandlerList;
  }, importedApplicative.listTransform);
  var executeApply = function (applierInst) {
    return applierInst.applyOp;
  };
  out["Applier"] = Applier;
  out["executeApply"] = executeApply;
  out["listApplier"] = listApplier;
})(AP["Logic.Applicative"] = AP["Logic.Applicative"] || {});
(function (out) {
  "use strict";
  var Logic_Applicative = AP["Logic.Applicative"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Void = AP["Core.Void"];
  var PureHandler = function (ApplicativeBase, pureOp) {
    this.ApplicativeBase = ApplicativeBase;
    this.pureOp = pureOp;
  };
  var createPure = function (pureInst) {
    return pureInst.pureOp;
  };
  out["PureHandler"] = PureHandler;
  out["createPure"] = createPure;
})(AP["Logic.Pure"] = AP["Logic.Pure"] || {});
(function (out) {
  "use strict";
  out.listSequence = function (sourceList) {
    return function (binderFn) {
      var mergedResult = [];
      // Apply the binder function to each element and merge results
      for (var idx = 0, len = sourceList.length; idx < len; idx++) {
        Array.prototype.push.apply(mergedResult, binderFn(sourceList[idx]));
      }
      return mergedResult;
    };
  };
})(AP["Logic.Sequencer"] = AP["Logic.Sequencer"] || {});
(function (out) {
  "use strict";
  var importedSequencer = AP["Logic.Sequencer"];
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Applicative = AP["Logic.Applicative"];
  var Logic_Structure = AP["Logic.Structure"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Void = AP["Core.Void"];
  var Sequencer = function (ApplicativeBase, sequenceOp) {
    this.ApplicativeBase = ApplicativeBase;
    this.sequenceOp = sequenceOp;
  };
  var Ignorer = function (ignoreOp) {
    this.ignoreOp = ignoreOp;
  };
  var performIgnore = function (sequencerInst) {
    return sequencerInst.ignoreOp;
  };
  var listSequencer = new Sequencer(function () {
    return Logic_Applicative.listApplier;
  }, importedSequencer.listSequence);
  var bindOperation = function (sequencerInst) {
    return sequencerInst.sequenceOp;
  };
  var ignoreVoid = new Ignorer(function (sequencerDict) {
    return bindOperation(sequencerDict);
  });
  out["Sequencer"] = Sequencer;
  out["bindOperation"] = bindOperation;
  out["Ignorer"] = Ignorer;
  out["performIgnore"] = performIgnore;
  out["listSequencer"] = listSequencer;
  out["ignoreVoid"] = ignoreVoid;
})(AP["Logic.Sequencer"] = AP["Logic.Sequencer"] || {});
(function (out) {
  "use strict";
  out.reduceRightList = function (reducerFn) {
    return function (initialVal) {
      return function (dataList) {
        var accumulator = initialVal;
        var dataLen = dataList.length;
        // Reduce from right to left
        for (var idx = dataLen - 1; idx >= 0; idx--) {
          accumulator = reducerFn(dataList[idx])(accumulator);
        }
        return accumulator;
      };
    };
  };
  out.reduceLeftList = function (reducerFn) {
    return function (initialVal) {
      return function (dataList) {
        var accumulator = initialVal;
        var dataLen = dataList.length;
        // Reduce from left to right
        for (var idx = 0; idx < dataLen; idx++) {
          accumulator = reducerFn(accumulator)(dataList[idx]);
        }
        return accumulator;
      };
    };
  };
})(AP["Core.Aggregator"] = AP["Core.Aggregator"] || {});
(function (out) {
  "use strict";
  out.andBool = function (valA) {
    return function (valB) {
      return valA && valB;
    };
  };
  out.orBool = function (valA) {
    return function (valB) {
      return valA || valB;
    };
  };
  out.notBool = function (inputVal) {
    return !inputVal;
  };
})(AP["Core.Logic"] = AP["Core.Logic"] || {});
(function (out) {
  "use strict";
  var importedLogic = AP["Core.Logic"];
  var Type_Identifier = AP["Type.Identifier"];
  var Core_Void = AP["Core.Void"];
  var Object_Unsafe = AP["Object.Unsafe"];
  var Type_Data_Record = AP["Type.Data.Record"];
  var Type_Data_Structure = AP["Type.Data.Structure"];
  var LogicalAlgebra = function (andOp, orOp, falseConst, impliesOp, notOp, trueConst) {
    this.andOp = andOp;
    this.orOp = orOp;
    this.falseConst = falseConst;
    this.impliesOp = impliesOp;
    this.notOp = notOp;
    this.trueConst = trueConst;
  };
  var getTrue = function (dict) {
    return dict.trueConst;
  };
  var applyNot = function (dict) {
    return dict.notOp;
  };
  var applyImplies = function (dict) {
    return dict.impliesOp;
  };
  var getFalse = function (dict) {
    return dict.falseConst;
  };
  var applyOr = function (dict) {
    return dict.orOp;
  };
  var booleanLogicAlgebra = new LogicalAlgebra(
    importedLogic.andBool,
    importedLogic.orBool,
    false,
    function (boolA) {
      return function (boolB) {
        return applyOr(booleanLogicAlgebra)(applyNot(booleanLogicAlgebra)(boolA))(boolB);
      };
    },
    importedLogic.notBool,
    true
  );
  var applyAnd = function (dict) {
    return dict.andOp;
  };
  out["LogicalAlgebra"] = LogicalAlgebra;
  out["getTrue"] = getTrue;
  out["getFalse"] = getFalse;
  out["applyImplies"] = applyImplies;
  out["applyAnd"] = applyAnd;
  out["applyOr"] = applyOr;
  out["applyNot"] = applyNot;
  out["booleanLogicAlgebra"] = booleanLogicAlgebra;
})(AP["Core.Logic"] = AP["Core.Logic"] || {});
(function (out) {
  "use strict";
  var Type_Identifier = AP["Type.Identifier"];
  var Core_Void = AP["Core.Void"];
  var Type_Empty = AP["Type.Empty"];
  var Object_Unsafe = AP["Object.Unsafe"];
  var Type_Data_Structure = AP["Type.Data.Structure"];
  var ItemCombiner = function (combineOp) {
    this.combineOp = combineOp;
  };
  var runCombine = function (combinerInst) {
    return combinerInst.combineOp;
  };
  out["ItemCombiner"] = ItemCombiner;
  out["runCombine"] = runCombine;
})(AP["Core.Combiner"] = AP["Core.Combiner"] || {});
(function (out) {
  "use strict";
  var Val_Bool = AP["Val.Bool"];
  var Val_Equality = AP["Val.Equality"];
  var Val_Euclid = AP["Val.Euclid"];
  var Val_Order = AP["Val.Order"];
  var Val_Ordering = AP["Val.Ordering"];
  var Core_Combiner = AP["Core.Combiner"];
  var Type_Identifier = AP["Type.Identifier"];
  var Core_Void = AP["Core.Void"];
  var Object_Unsafe = AP["Object.Unsafe"];
  var Type_Data_Structure = AP["Type.Data.Structure"];
  var IdentityCombiner = function (BaseCombiner, identityElem) {
    this.BaseCombiner = BaseCombiner;
    this.identityElem = identityElem;
  };
  var getIdentity = function (identityInst) {
    return identityInst.identityElem;
  };
  out["IdentityCombiner"] = IdentityCombiner;
  out["getIdentity"] = getIdentity;
})(AP["Core.IdentityCombiner"] = AP["Core.IdentityCombiner"] || {});
(function (out) {
  "use strict";
  var Logic_Alt = AP["Logic.Alt"];
  var Logic_Alternative = AP["Logic.Alternative"];
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Applicative = AP["Logic.Applicative"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Structure = AP["Logic.Structure"];
  var Logic_Extend = AP["Logic.Extend"];
  var Logic_Monadic = AP["Logic.Monadic"];
  var Logic_ZeroMonad = AP["Logic.ZeroMonad"];
  var Logic_Plus = AP["Logic.Plus"];
  var Val_Bounded = AP["Val.Bounded"];
  var Val_Equality = AP["Val.Equality"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_MapperInvariant = AP["Core.MapperInvariant"];
  var Core_IdentityCombiner = AP["Core.IdentityCombiner"];
  var Val_Order = AP["Val.Order"];
  var Val_Ordering = AP["Val.Ordering"];
  var Core_Combiner = AP["Core.Combiner"];
  var Core_Display = AP["Core.Display"];
  var Core_Void = AP["Core.Void"];
  var Prelude_Core = AP["Prelude.Core"];
  var Absent = (function () {
    function Absent() {}
    Absent.value = new Absent();
    return Absent;
  })();
  var Present = (function () {
    function Present(content) {
      this.content = content;
    }
    Present.create = function (content) {
      return new Present(content);
    };
    return Present;
  })();
  var handleOptional = function (ifAbsent) {
    return function (ifPresent) {
      return function (optionalValue) {
        if (optionalValue instanceof Absent) {
          return ifAbsent;
        }
        if (optionalValue instanceof Present) {
          return ifPresent(optionalValue.content);
        }
        throw new Error(
          "Pattern match error at Core.Optional (line 217): " +
            [
              ifAbsent.constructor.name,
              ifPresent.constructor.name,
              optionalValue.constructor.name,
            ]
        );
      };
    };
  };
  out["Absent"] = Absent;
  out["Present"] = Present;
  out["handleOptional"] = handleOptional;
})(AP["Core.Optional"] = AP["Core.Optional"] || {});
(function (out) {
  "use strict";
  out.addInteger = function (numX) {
    return function (numY) {
      return (numX + numY) | 0;
    };
  };
  out.multiplyInteger = function (numX) {
    return function (numY) {
      return (numX * numY) | 0;
    };
  };
})(AP["Core.NumberOps"] = AP["Core.NumberOps"] || {});
(function (out) {
  "use strict";
  var importedNumberOps = AP["Core.NumberOps"];
  var Type_Identifier = AP["Type.Identifier"];
  var Core_Void = AP["Core.Void"];
  var Object_Unsafe = AP["Object.Unsafe"];
  var Type_Data_Record = AP["Type.Data.Record"];
  var Type_Data_Structure = AP["Type.Data.Structure"];
  var NumberAlgebra = function (addFn, mulFn, oneVal, zeroVal) {
    this.addFn = addFn;
    this.mulFn = mulFn;
    this.oneVal = oneVal;
    this.zeroVal = zeroVal;
  };
  var getZero = function (dict) {
    return dict.zeroVal;
  };
  var integerAlgebra = new NumberAlgebra(
    importedNumberOps.addInteger,
    importedNumberOps.multiplyInteger,
    1,
    0
  );
  var getOne = function (dict) {
    return dict.oneVal;
  };
  var applyMul = function (dict) {
    return dict.mulFn;
  };
  var applyAdd = function (dict) {
    return dict.addFn;
  };
  out["NumberAlgebra"] = NumberAlgebra;
  out["applyAdd"] = applyAdd;
  out["getZero"] = getZero;
  out["applyMul"] = applyMul;
  out["getOne"] = getOne;
  out["integerAlgebra"] = integerAlgebra;
})(AP["Core.NumberOps"] = AP["Core.NumberOps"] || {});
(function (out) {
  "use strict";
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Applicative = AP["Logic.Applicative"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Monadic = AP["Logic.Monadic"];
  var Val_Bounded = AP["Val.Bounded"];
  var Val_Equality = AP["Val.Equality"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Logic = AP["Core.Logic"];
  var Core_IdentityCombiner = AP["Core.IdentityCombiner"];
  var Val_Order = AP["Val.Order"];
  var Core_Combiner = AP["Core.Combiner"];
  var Core_NumberOps = AP["Core.NumberOps"];
  var Core_Display = AP["Core.Display"];
  var Prelude_Core = AP["Prelude.Core"];
  var Conjunction = function (boolVal) {
    return boolVal;
  };
  var conjunctiveCombiner = function (logicDict) {
    return new Core_Combiner.ItemCombiner(function (valA) {
      return function (valB) {
        return Core_Logic.applyAnd(logicDict)(valA)(valB);
      };
    });
  };
  var conjunctiveIdentity = function (logicDict) {
    return new Core_IdentityCombiner.IdentityCombiner(function () {
      return conjunctiveCombiner(logicDict);
    }, Core_Logic.getTrue(logicDict));
  };
  out["Conjunction"] = Conjunction;
  out["conjunctiveCombiner"] = conjunctiveCombiner;
  out["conjunctiveIdentity"] = conjunctiveIdentity;
})(AP["Logic.ConjunctiveMonoid"] = AP["Logic.ConjunctiveMonoid"] || {});
(function (out) {
  "use strict";
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Logic_AdditiveMonoid = AP["Logic.AdditiveMonoid"];
  var Logic_ConjunctiveMonoid = AP["Logic.ConjunctiveMonoid"];
  var Logic_DisjunctiveMonoid = AP["Logic.DisjunctiveMonoid"];
  var Logic_DualMonoid = AP["Logic.DualMonoid"];
  var Logic_EndoMonoid = AP["Logic.EndoMonoid"];
  var Logic_MultiplicativeMonoid = AP["Logic.MultiplicativeMonoid"];
  var Logic_FirstSemigroup = AP["Logic.FirstSemigroup"];
  var Logic_LastSemigroup = AP["Logic.LastSemigroup"];
  var Prelude_Core = AP["Prelude.Core"];
  var TypeWrapper = function (unwrapFn, wrapFn) {
    this.unwrapFn = unwrapFn;
    this.wrapFn = wrapFn;
  };
  var performWrap = function (wrapperDict) {
    return wrapperDict.wrapFn;
  };
  var performUnwrap = function (wrapperDict) {
    return wrapperDict.unwrapFn;
  };
  var conjunctiveWrapper = new TypeWrapper(function (val) {
    return val;
  }, Logic_ConjunctiveMonoid.Conjunction);
  var mapAcrossWrappers = function (mapperDict1) {
    return function (mapperDict2) {
      return function (wrapperDict1) {
        return function (wrapperDict2) {
          return function (initialVal) {
            return function (transformFn) {
              return function (inputData) {
                return Core_Mapper.applyMap(mapperDict2)(
                  performUnwrap(wrapperDict2)
                )(
                  transformFn(
                    Core_Mapper.applyMap(mapperDict1)(
                      performWrap(wrapperDict1)
                    )(inputData)
                  )
                );
              };
            };
          };
        };
      };
    };
  };
  out["performUnwrap"] = performUnwrap;
  out["performWrap"] = performWrap;
  out["TypeWrapper"] = TypeWrapper;
  out["mapAcrossWrappers"] = mapAcrossWrappers;
  out["conjunctiveWrapper"] = conjunctiveWrapper;
})(AP["Type.Wrapper"] = AP["Type.Wrapper"] || {});
(function (out) {
  "use strict";
  var importedAggregator = AP["Core.Aggregator"];
  var Logic_Alt = AP["Logic.Alt"];
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Applicative = AP["Logic.Applicative"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Structure = AP["Logic.Structure"];
  var Logic_Plus = AP["Logic.Plus"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Val_Equality = AP["Val.Equality"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Logic = AP["Core.Logic"];
  var Core_Optional = AP["Core.Optional"];
  var Core_OptionalFirst = AP["Core.OptionalFirst"];
  var Core_OptionalLast = AP["Core.OptionalLast"];
  var Core_IdentityCombiner = AP["Core.IdentityCombiner"];
  var Logic_AdditiveMonoid = AP["Logic.AdditiveMonoid"];
  var Logic_ConjunctiveMonoid = AP["Logic.ConjunctiveMonoid"];
  var Logic_DisjunctiveMonoid = AP["Logic.DisjunctiveMonoid"];
  var Logic_DualMonoid = AP["Logic.DualMonoid"];
  var Logic_EndoMonoid = AP["Logic.EndoMonoid"];
  var Logic_MultiplicativeMonoid = AP["Logic.MultiplicativeMonoid"];
  var Type_Wrapper = AP["Type.Wrapper"];
  var Val_Order = AP["Val.Order"];
  var Val_Ordering = AP["Val.Ordering"];
  var Core_Combiner = AP["Core.Combiner"];
  var Core_NumberOps = AP["Core.NumberOps"];
  var Core_Void = AP["Core.Void"];
  var Prelude_Core = AP["Prelude.Core"];
  var ListReducer = function (mapReduce, reduceLeft, reduceRight) {
    this.mapReduce = mapReduce;
    this.reduceLeft = reduceLeft;
    this.reduceRight = reduceRight;
  };
  var execReduceRight = function (dict) {
    return dict.reduceRight;
  };
  var execReduceLeft = function (dict) {
    return dict.reduceLeft;
  };
  var calculateSum = function (reducerDict) {
    return function (numberAlgebraDict) {
      return execReduceLeft(reducerDict)(
        Core_NumberOps.applyAdd(numberAlgebraDict)
      )(Core_NumberOps.getZero(numberAlgebraDict));
    };
  };
  var defaultMapReduceRight = function (reducerDict) {
    return function (identityCombinerDict) {
      return function (mapperFn) {
        return execReduceRight(reducerDict)(function (item) {
          return function (accumulator) {
            return Core_Combiner.runCombine(
              identityCombinerDict.BaseCombiner()
            )(
              mapperFn(item)
            )(accumulator);
          };
        })(Core_IdentityCombiner.getIdentity(identityCombinerDict));
      };
    };
  };
  var listReducerArray = new ListReducer(
    function (identityCombinerDict) {
      return defaultMapReduceRight(listReducerArray)(identityCombinerDict);
    },
    importedAggregator.reduceLeftList,
    importedAggregator.reduceRightList
  );
  var execMapReduce = function (dict) {
    return dict.mapReduce;
  };
  var checkAll = function (reducerDict) {
    return function (logicAlgebraDict) {
      return Type_Wrapper.mapAcrossWrappers(Core_Mapper.mapHandlerFunc)(
        Core_Mapper.mapHandlerFunc
      )(Type_Wrapper.conjunctiveWrapper)(
        Type_Wrapper.conjunctiveWrapper
      )(Logic_ConjunctiveMonoid.Conjunction)(
        execMapReduce(reducerDict)(
          Logic_ConjunctiveMonoid.conjunctiveIdentity(logicAlgebraDict)
        )
      );
    };
  };
  out["ListReducer"] = ListReducer;
  out["execReduceRight"] = execReduceRight;
  out["execReduceLeft"] = execReduceLeft;
  out["execMapReduce"] = execMapReduce;
  out["defaultMapReduceRight"] = defaultMapReduceRight;
  out["checkAll"] = checkAll;
  out["calculateSum"] = calculateSum;
  out["listReducerArray"] = listReducerArray;
})(AP["Core.Aggregator"] = AP["Core.Aggregator"] || {});
(function (out) {
  "use strict";
  var Logic_Alt = AP["Logic.Alt"];
  var Logic_Alternative = AP["Logic.Alternative"];
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Applicative = AP["Logic.Applicative"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Extend = AP["Logic.Extend"];
  var Logic_Monadic = AP["Logic.Monadic"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_BiAggregator = AP["Core.BiAggregator"];
  var Core_BiMapper = AP["Core.BiMapper"];
  var Core_BiTraversable = AP["Core.BiTraversable"];
  var Val_Bounded = AP["Val.Bounded"];
  var Val_Equality = AP["Val.Equality"];
  var Core_Aggregator = AP["Core.Aggregator"];
  var Core_IndexedAggregator = AP["Core.IndexedAggregator"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_MapperInvariant = AP["Core.MapperInvariant"];
  var Core_IndexedMapper = AP["Core.IndexedMapper"];
  var Core_Optional = AP["Core.Optional"];
  var Core_IdentityCombiner = AP["Core.IdentityCombiner"];
  var Val_Order = AP["Val.Order"];
  var Val_Ordering = AP["Val.Ordering"];
  var Core_Combiner = AP["Core.Combiner"];
  var Core_Display = AP["Core.Display"];
  var Core_Traversable = AP["Core.Traversable"];
  var Core_IndexedTraversable = AP["Core.IndexedTraversable"];
  var Core_Void = AP["Core.Void"];
  var Prelude_Core = AP["Prelude.Core"];
  var ErrSide = (function () {
    function ErrSide(content) {
      this.content = content;
    }
    ErrSide.create = function (content) {
      return new ErrSide(content);
    };
    return ErrSide;
  })();
  var OkSide = (function () {
    function OkSide(content) {
      this.content = content;
    }
    OkSide.create = function (content) {
      return new OkSide(content);
    };
    return OkSide;
  })();
  var maybeToEither = function (errorVal) {
    return Core_Optional.handleOptional(new ErrSide(errorVal))(OkSide.create);
  };
  var choiceMapper = new Core_Mapper.MapHandler(function (mapFn) {
    return function (choiceVal) {
      if (choiceVal instanceof ErrSide) {
        return new ErrSide(choiceVal.content);
      }
      if (choiceVal instanceof OkSide) {
        return new OkSide(mapFn(choiceVal.content));
      }
      throw new Error(
        "Choice mapping failed at Core.Choice (line 38): " +
          [choiceVal.constructor.name]
      );
    };
  });
  var extractRight = function (partialDict) {
    return function (inputChoice) {
      if (inputChoice instanceof OkSide) {
        return inputChoice.content;
      }
      throw new Error(
        "Failed to extract right value at Core.Choice (line 261): " +
          [inputChoice.constructor.name]
      );
    };
  };
  var handleChoice = function (leftHandler) {
    return function (rightHandler) {
      return function (choiceInput) {
        if (choiceInput instanceof ErrSide) {
          return leftHandler(choiceInput.content);
        }
        if (choiceInput instanceof OkSide) {
          return rightHandler(choiceInput.content);
        }
        throw new Error(
          "Choice handling failed at Core.Choice (line 238): " +
            [
              leftHandler.constructor.name,
              rightHandler.constructor.name,
              choiceInput.constructor.name,
            ]
        );
      };
    };
  };
  var choiceApplier = new Logic_Applicative.Applier(function () {
    return choiceMapper;
  }, function (fnChoice) {
    return function (argChoice) {
      if (fnChoice instanceof ErrSide) {
        return new ErrSide(fnChoice.content);
      }
      if (fnChoice instanceof OkSide) {
        return Core_Mapper.applyMap(choiceMapper)(fnChoice.content)(argChoice);
      }
      throw new Error(
        "Choice application failed at Core.Choice (line 82): " +
          [fnChoice.constructor.name, argChoice.constructor.name]
      );
    };
  });
  var choiceSequencer = new Logic_Sequencer.Sequencer(function () {
    return choiceApplier;
  }, handleChoice(function (errorContent) {
    return function (v) {
      return new ErrSide(errorContent);
    };
  })(function (successContent) {
    return function (continuationFn) {
      return continuationFn(successContent);
    };
  }));
  var choicePure = new Logic_Pure.PureHandler(function () {
    return choiceApplier;
  }, OkSide.create);
  out["ErrSide"] = ErrSide;
  out["OkSide"] = OkSide;
  out["handleChoice"] = handleChoice;
  out["extractRight"] = extractRight;
  out["maybeToEither"] = maybeToEither;
  out["choiceMapper"] = choiceMapper;
  out["choiceApplier"] = choiceApplier;
  out["choicePure"] = choicePure;
  out["choiceSequencer"] = choiceSequencer;
})(AP["Core.Choice"] = AP["Core.Choice"] || {});
(function (out) {
  "use strict";
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Monadic = AP["Logic.Monadic"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_BiMapper = AP["Core.BiMapper"];
  var Core_Choice = AP["Core.Choice"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Identity = AP["Core.Identity"];
  var Core_Optional = AP["Core.Optional"];
  var Core_Void = AP["Core.Void"];
  var System_Effect = AP["System.Effect"];
  var System_Ref = AP["System.Ref"];
  var Unsafe_Partial = AP["Unsafe.Partial"];
  var Prelude_Core = AP["Prelude.Core"];
  var ContinueLoop = (function () {
    function ContinueLoop(dataValue) {
      this.dataValue = dataValue;
    }
    ContinueLoop.create = function (dataValue) {
      return new ContinueLoop(dataValue);
    };
    return ContinueLoop;
  })();
  var FinishLoop = (function () {
    function FinishLoop(dataValue) {
      this.dataValue = dataValue;
    }
    FinishLoop.create = function (dataValue) {
      return new FinishLoop(dataValue);
    };
    return FinishLoop;
  })();
  var recursiveProcess = function (stepFn) {
    var loopExecutor = function (currentStep) {
      var isDone = false;
      var finalResult;
      function internalLoop(loopState) {
        if (loopState instanceof ContinueLoop) {
          currentStep = stepFn(loopState.dataValue);
          return;
        }
        if (loopState instanceof FinishLoop) {
          isDone = true;
          return loopState.dataValue;
        }
        throw new Error(
          "Recursive pattern match failed at Logic.RecursiveMonad (line 91): " +
            [loopState.constructor.name]
        );
      }
      while (!isDone) {
        finalResult = internalLoop(currentStep);
      }
      return finalResult;
    };
    return function (initialState) {
      return loopExecutor(stepFn(initialState));
    };
  };
  out["ContinueLoop"] = ContinueLoop;
  out["FinishLoop"] = FinishLoop;
  out["recursiveProcess"] = recursiveProcess;
})(AP["Logic.RecursiveMonad"] = AP["Logic.RecursiveMonad"] || {});
(function (out) {
  "use strict";
  out.getListLength = function (targetList) {
    return targetList.length;
  };
  out.accessElementInternal = function (foundCb) {
    return function (notFoundVal) {
      return function (targetList) {
        return function (idx) {
          return idx < 0 || idx >= targetList.length
            ? notFoundVal
            : foundCb(targetList[idx]);
        };
      };
    };
  };
  out.getSlice = function (startIndex) {
    return function (endIndex) {
      return function (inputList) {
        return inputList.slice(startIndex, endIndex);
      };
    };
  };
  out.removeHead = function (numToDrop) {
    return function (inputList) {
      return numToDrop < 1 ? inputList : inputList.slice(numToDrop);
    };
  };
  out.combineListsWith = function (combinerFn) {
    return function (listA) {
      return function (listB) {
        var minLen = listA.length < listB.length ? listA.length : listB.length;
        var combinedList = new Array(minLen);
        for (var idx = 0; idx < minLen; idx++) {
          combinedList[idx] = combinerFn(listA[idx])(listB[idx]);
        }
        return combinedList;
      };
    };
  };
})(AP["Core.List"] = AP["Core.List"] || {});
(function (out) {
  "use strict";
  out.forceCast = function (inputVal) {
    return inputVal;
  };
})(AP["System.UnsafeCast"] = AP["System.UnsafeCast"] || {});
(function (out) {
  "use strict";
  var importedUnsafeCast = AP["System.UnsafeCast"];
  out["forceCast"] = importedUnsafeCast.forceCast;
})(AP["System.UnsafeCast"] = AP["System.UnsafeCast"] || {});
(function (out) {
  "use strict";
  var importedList = AP["Core.List"];
  var Logic_Alt = AP["Logic.Alt"];
  var Logic_Alternative = AP["Logic.Alternative"];
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Applicative = AP["Logic.Applicative"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Structure = AP["Logic.Structure"];
  var Logic_Lazy = AP["Logic.Lazy"];
  var Logic_RecursiveMonad = AP["Logic.RecursiveMonad"];
  var System_STMonad = AP["System.STMonad"];
  var System_STMonadInternal = AP["System.STMonadInternal"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_NonEmptyListInternal = AP["Core.NonEmptyListInternal"];
  var System_STList = AP["System.STList"];
  var System_STListIterator = AP["System.STListIterator"];
  var Val_Bool = AP["Val.Bool"];
  var Val_Equality = AP["Val.Equality"];
  var Core_Aggregator = AP["Core.Aggregator"];
  var Core_Functional = AP["Core.Functional"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Logic = AP["Core.Logic"];
  var Core_Optional = AP["Core.Optional"];
  var Val_Order = AP["Val.Order"];
  var Val_Ordering = AP["Val.Ordering"];
  var Val_Algebra = AP["Val.Algebra"];
  var Core_Combiner = AP["Core.Combiner"];
  var Core_NumberOps = AP["Core.NumberOps"];
  var Core_Traversable = AP["Core.Traversable"];
  var Core_Pair = AP["Core.Pair"];
  var Core_Unfoldable = AP["Core.Unfoldable"];
  var Unsafe_Partial = AP["Unsafe.Partial"];
  var Prelude_Core = AP["Prelude.Core"];
  var System_UnsafeCast = AP["System.UnsafeCast"];
  var createSingleList = function (itemVal) {
    return [itemVal];
  };
  var getElement = importedList.accessElementInternal(
    Core_Optional.Present.create
  )(Core_Optional.Absent.value);
  var getFirstElement = function (inputList) {
    return getElement(inputList)(0);
  };
  var flattenAndMap = Core_Functional.reverseArgs(
    Logic_Sequencer.bindOperation(Logic_Sequencer.listSequencer)
  );
  var filterMap = function (mapperFn) {
    return flattenAndMap(function (currentItem) {
      return Core_Optional.handleOptional([])(createSingleList)(
        mapperFn(currentItem)
      );
    });
  };
  out["createSingleList"] = createSingleList;
  out["getFirstElement"] = getFirstElement;
  out["getElement"] = getElement;
  out["flattenAndMap"] = flattenAndMap;
  out["filterMap"] = filterMap;
  out["getListLength"] = importedList.getListLength;
  out["removeHead"] = importedList.removeHead;
  out["combineListsWith"] = importedList.combineListsWith;
})(AP["Core.List"] = AP["Core.List"] || {});
(function (out) {
  "use strict";
  out.parseIntegerBaseInternal = function (onSuccess) {
    return function (onFailure) {
      return function (baseNum) {
        var regexDigits;
        if (baseNum < 11) {
          regexDigits = "[0-" + (baseNum - 1).toString() + "]";
        } else if (baseNum === 11) {
          regexDigits = "[0-9a]";
        } else {
          regexDigits = "[0-9a-" + String.fromCharCode(86 + baseNum) + "]";
        }
        var parsePattern = new RegExp("^[\\+\\-]?" + regexDigits + "+$", "i");
        return function (inputString) {
          if (parsePattern.test(inputString)) {
            var parsedInt = parseInt(inputString, baseNum);
            return (parsedInt | 0) === parsedInt
              ? onSuccess(parsedInt)
              : onFailure;
          } else {
            return onFailure;
          }
        };
      };
    };
  };
})(AP["Core.Integer"] = AP["Core.Integer"] || {});
(function (out) {
  "use strict";
  var importedInteger = AP["Core.Integer"];
  var Logic_Structure = AP["Logic.Structure"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Val_Bool = AP["Val.Bool"];
  var Val_Bounded = AP["Val.Bounded"];
  var Val_CommutativeRing = AP["Val.CommutativeRing"];
  var Val_DivisionRing = AP["Val.DivisionRing"];
  var Val_Equality = AP["Val.Equality"];
  var Val_Euclid = AP["Val.Euclid"];
  var Core_Logic = AP["Core.Logic"];
  var Core_IntegerBits = AP["Core.IntegerBits"];
  var Core_Optional = AP["Core.Optional"];
  var Val_Order = AP["Val.Order"];
  var Val_Ordering = AP["Val.Ordering"];
  var Val_Algebra = AP["Val.Algebra"];
  var Core_NumberOps = AP["Core.NumberOps"];
  var Core_Display = AP["Core.Display"];
  var Global_JS = AP["Global.JS"];
  var JS_Math = AP["JS.Math"];
  var Prelude_Core = AP["Prelude.Core"];
  var parseIntegerBase = importedInteger.parseIntegerBaseInternal(
    Core_Optional.Present.create
  )(Core_Optional.Absent.value);
  var parseInteger = parseIntegerBase(10);
  out["parseInteger"] = parseInteger;
  out["parseIntegerBase"] = parseIntegerBase;
})(AP["Core.Integer"] = AP["Core.Integer"] || {});
(function (out) {
  "use strict";
  out.splitString = function (separator) {
    return function (inputStr) {
      return inputStr.split(separator);
    };
  };
  out.trimString = function (inputStr) {
    return inputStr.trim();
  };
})(AP["Core.StringUtil"] = AP["Core.StringUtil"] || {});
(function (out) {
  "use strict";
  var importedStringUtil = AP["Core.StringUtil"];
  var Val_Equality = AP["Val.Equality"];
  var Val_Ordering = AP["Val.Ordering"];
  var Core_StringPattern = AP["Core.StringPattern"];
  var Prelude_Core = AP["Prelude.Core"];
  out["splitString"] = importedStringUtil.splitString;
  out["trimString"] = importedStringUtil.trimString;
})(AP["Core.StringUtil"] = AP["Core.StringUtil"] || {});
(function (out) {
  "use strict";
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_RecursiveMonad = AP["Logic.RecursiveMonad"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_List = AP["Core.List"];
  var Core_Choice = AP["Core.Choice"];
  var Val_Equality = AP["Val.Equality"];
  var Core_Aggregator = AP["Core.Aggregator"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Logic = AP["Core.Logic"];
  var Core_Integer = AP["Core.Integer"];
  var Core_Optional = AP["Core.Optional"];
  var Val_Order = AP["Val.Order"];
  var Core_NumberOps = AP["Core.NumberOps"];
  var Core_Display = AP["Core.Display"];
  var Core_Text = AP["Core.Text"];
  var Core_StringUtil = AP["Core.StringUtil"];
  var Core_StringPattern = AP["Core.StringPattern"];
  var Core_Traversable = AP["Core.Traversable"];
  var Core_Void = AP["Core.Void"];
  var Unsafe_Partial = AP["Unsafe.Partial"];
  var Prelude_Core = AP["Prelude.Core"];

  var calculateResult = function (thresholdC) {
    return function (weightsB) {
      return function (dataSetsA) {
        var loopFn = function (loopContext) {
          var currentDataSet = Core_List.getElement(dataSetsA)(loopContext.idx);
          if (currentDataSet instanceof Core_Optional.Absent) {
            return new Logic_RecursiveMonad.FinishLoop(loopContext.count);
          }
          if (currentDataSet instanceof Core_Optional.Present) {
            var isAboveThreshold =
              (Core_Aggregator.calculateSum(Core_Aggregator.listReducerArray)(
                Core_NumberOps.integerAlgebra
              )(
                Core_List.combineListsWith(
                  Core_NumberOps.applyMul(Core_NumberOps.integerAlgebra)
                )(currentDataSet.content)(weightsB)
              ) +
                thresholdC) |
                0 >
              0;
            if (isAboveThreshold) {
              return new Logic_RecursiveMonad.ContinueLoop({
                idx: loopContext.idx + 1,
                count: loopContext.count + 1,
              });
            }
            return new Logic_RecursiveMonad.ContinueLoop({
              idx: loopContext.idx + 1,
              count: loopContext.count,
            });
          }
          throw new Error(
            "Pattern match error in calculateResult (line 55): " +
              [currentDataSet.constructor.name]
          );
        };
        return Logic_RecursiveMonad.recursiveProcess(loopFn)({
          idx: 0,
          count: 0,
        });
      };
    };
  };

  var parseAndCompute = function (rawInput) {
    var inputLines = Core_StringUtil.splitString("\n")(
      Core_StringUtil.trimString(rawInput)
    );
    return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
      Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
        Core_Choice.maybeToEither("config_line_missing")(
          Core_List.getFirstElement(inputLines)
        )
      )(function (configStr) {
        return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
          Core_Choice.maybeToEither("weights_line_missing")(
            Core_List.getFirstElement(Core_List.removeHead(1)(inputLines))
          )
        )(function (weightsStr) {
          return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
            Logic_Pure.createPure(Core_Choice.choicePure)(
              Core_List.removeHead(2)(inputLines)
            )
          )(function (allDataSets) {
            return Logic_Pure.createPure(Core_Choice.choicePure)({
              allDataSets: allDataSets,
              weightsStr: weightsStr,
              configStr: configStr,
            });
          });
        });
      })
    )(function (parsedInput) {
      return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
        (function () {
          var configParts = Core_StringUtil.splitString(" ")(
            parsedInput.configStr
          );
          if (Core_List.getListLength(configParts) === 3) {
            return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
              Core_Choice.maybeToEither("N_parse_error")(
                Core_Integer.parseInteger(configParts[0])
              )
            )(function (numN) {
              return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
                Core_Choice.maybeToEither("M_parse_error")(
                  Core_Integer.parseInteger(configParts[1])
                )
              )(function (numM) {
                return Logic_Sequencer.bindOperation(
                  Core_Choice.choiceSequencer
                )(
                  Core_Choice.maybeToEither("C_parse_error")(
                    Core_Integer.parseInteger(configParts[2])
                  )
                )(function (numC) {
                  return Logic_Pure.createPure(Core_Choice.choicePure)({
                    c: numC,
                    m: numM,
                    n: numN,
                  });
                });
              });
            });
          }
          return new Core_Choice.ErrSide("config_format_error");
        })()
      )(function (configParams) {
        return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
          Logic_Pure.createPure(Core_Choice.choicePure)(
            Core_List.filterMap(Core_Integer.parseInteger)(
              Core_StringUtil.splitString(" ")(parsedInput.weightsStr)
            )
          )
        )(function (parsedWeightsB) {
          return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
            (function () {
              var isInvalidBLength =
                Core_List.getListLength(parsedWeightsB) !== configParams.m;
              if (isInvalidBLength) {
                return new Core_Choice.ErrSide("weights_list_length_mismatch");
              }
              return Logic_Pure.createPure(Core_Choice.choicePure)(
                Core_Void.emptyVal
              );
            })()
          )(function () {
            return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
              Logic_Pure.createPure(Core_Choice.choicePure)(
                Core_Mapper.applyMap(Core_Mapper.mapHandlerList)(function (
                  lineStr
                ) {
                  return Core_List.filterMap(Core_Integer.parseInteger)(
                    Core_StringUtil.splitString(" ")(lineStr)
                  );
                })(parsedInput.allDataSets)
              )
            )(function (parsedDataSetsA) {
              return Logic_Sequencer.bindOperation(Core_Choice.choiceSequencer)(
                (function () {
                  var isInvalidALength =
                    Core_List.getListLength(parsedDataSetsA) === configParams.n;
                  if (isInvalidALength) {
                    return Logic_Pure.createPure(Core_Choice.choicePure)(
                      Core_Void.emptyVal
                    );
                  }
                  return new Core_Choice.ErrSide(
                    "data_sets_list_length_mismatch"
                  );
                })()
              )(function () {
                return Logic_Sequencer.bindOperation(
                  Core_Choice.choiceSequencer
                )(
                  (function () {
                    var isInvalidInnerALength = Core_Aggregator.checkAll(
                      Core_Aggregator.listReducerArray
                    )(Core_Logic.booleanLogicAlgebra)(function (innerList) {
                      return configParams.m === Core_List.getListLength(innerList);
                    })(parsedDataSetsA);
                    if (isInvalidInnerALength) {
                      return Logic_Pure.createPure(Core_Choice.choicePure)(
                        Core_Void.emptyVal
                      );
                    }
                    return new Core_Choice.ErrSide(
                      "inner_data_set_length_mismatch"
                    );
                  })()
                )(function () {
                  return Logic_Pure.createPure(Core_Choice.choicePure)(
                    Core_Display.format(Core_Display.formatInteger)(
                      calculateResult(configParams.c)(parsedWeightsB)(
                        parsedDataSetsA
                      )
                    )
                  );
                });
              });
            });
          });
        });
      });
    });
  };

  var executeSolution = function (rawInput) {
    return Core_Choice.extractRight(null)(parseAndCompute(rawInput));
  };
  out["executeSolution"] = executeSolution;
})(AP["Competition.ProblemSolver"] = AP["Competition.ProblemSolver"] || {});
(function (out) {
  "use strict";
  out.printToConsole = function (message) {
    return function () {
      console.log(message);
      return {};
    };
  };
})(AP["System.Console"] = AP["System.Console"] || {});
(function (out) {
  "use strict";
  var importedConsole = AP["System.Console"];
  var Core_Display = AP["Core.Display"];
  var Core_Void = AP["Core.Void"];
  var System_Effect = AP["System.Effect"];
  out["printToConsole"] = importedConsole.printToConsole;
})(AP["System.Console"] = AP["System.Console"] || {});
(function (out) {
  "use strict";
  var importedEncoding = AP["System.TextEncoding"];
  var Core_Display = AP["Core.Display"];
  var Prelude_Core = AP["Prelude.Core"];
  var AsciiEncoding = (function () {
    function AsciiEncoding() {}
    AsciiEncoding.value = new AsciiEncoding();
    return AsciiEncoding;
  })();
  var Utf8Encoding = (function () {
    function Utf8Encoding() {}
    Utf8Encoding.value = new Utf8Encoding();
    return Utf8Encoding;
  })();
  var Utf16LEncoding = (function () {
    function Utf16LEncoding() {}
    Utf16LEncoding.value = new Utf16LEncoding();
    return Utf16LEncoding;
  })();
  var Ucs2Encoding = (function () {
    function Ucs2Encoding() {}
    Ucs2Encoding.value = new Ucs2Encoding();
    return Ucs2Encoding;
  })();
  var Base64Encoding = (function () {
    function Base64Encoding() {}
    Base64Encoding.value = new Base64Encoding();
    return Base64Encoding;
  })();
  var Latin1Encoding = (function () {
    function Latin1Encoding() {}
    Latin1Encoding.value = new Latin1Encoding();
    return Latin1Encoding;
  })();
  var BinaryEncoding = (function () {
    function BinaryEncoding() {}
    BinaryEncoding.value = new BinaryEncoding();
    return BinaryEncoding;
  })();
  var HexEncoding = (function () {
    function HexEncoding() {}
    HexEncoding.value = new HexEncoding();
    return HexEncoding;
  })();
  var displayEncoding = new Core_Display.Formatter(function (encodingType) {
    if (encodingType instanceof AsciiEncoding) {
      return "ASCII";
    }
    if (encodingType instanceof Utf8Encoding) {
      return "UTF8";
    }
    if (encodingType instanceof Utf16LEncoding) {
      return "UTF16LE";
    }
    if (encodingType instanceof Ucs2Encoding) {
      return "UCS2";
    }
    if (encodingType instanceof Base64Encoding) {
      return "Base64";
    }
    if (encodingType instanceof Latin1Encoding) {
      return "Latin1";
    }
    if (encodingType instanceof BinaryEncoding) {
      return "Binary";
    }
    if (encodingType instanceof HexEncoding) {
      return "Hex";
    }
    throw new Error(
      "Encoding display failed at System.TextEncoding (line 19): " +
        [encodingType.constructor.name]
    );
  });
  out["AsciiEncoding"] = AsciiEncoding;
  out["Utf8Encoding"] = Utf8Encoding;
  out["Utf16LEncoding"] = Utf16LEncoding;
  out["Ucs2Encoding"] = Ucs2Encoding;
  out["Base64Encoding"] = Base64Encoding;
  out["Latin1Encoding"] = Latin1Encoding;
  out["BinaryEncoding"] = BinaryEncoding;
  out["HexEncoding"] = HexEncoding;
  out["displayEncoding"] = displayEncoding;
})(AP["System.TextEncoding"] = AP["System.TextEncoding"] || {});
(function (out) {
  "use strict";
  out.getFsModule = require("fs");
})(AP["System.FileInternal"] = AP["System.FileInternal"] || {});
(function (out) {
  "use strict";
  var importedFileInternal = AP["System.FileInternal"];
  var System_Effect = AP["System.Effect"];
  var Prelude_Core = AP["Prelude.Core"];
  var System_UnsafeCast = AP["System.UnsafeCast"];
  var createEffect = System_UnsafeCast.forceCast;
  out["createEffect"] = createEffect;
  out["getFsModule"] = importedFileInternal.getFsModule;
})(AP["System.FileInternal"] = AP["System.FileInternal"] || {});
(function (out) {
  "use strict";
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var Logic_Combinator = AP["Logic.Combinator"];
  var Core_DateTime = AP["Core.DateTime"];
  var Core_DateTimeInstant = AP["Core.DateTimeInstant"];
  var Val_Euclid = AP["Val.Euclid"];
  var Core_Functional = AP["Core.Functional"];
  var Core_FunctionalUncurried = AP["Core.FunctionalUncurried"];
  var Core_Mapper = AP["Core.Mapper"];
  var Core_Integer = AP["Core.Integer"];
  var Core_Optional = AP["Core.Optional"];
  var Core_Nullable = AP["Core.Nullable"];
  var Core_Display = AP["Core.Display"];
  var Core_TimeDuration = AP["Core.TimeDuration"];
  var System_Effect = AP["System.Effect"];
  var System_Buffer = AP["System.Buffer"];
  var System_TextEncoding = AP["System.TextEncoding"];
  var System_File = AP["System.File"];
  var System_FileInternal = AP["System.FileInternal"];
  var System_FilePerms = AP["System.FilePerms"];
  var System_FileStats = AP["System.FileStats"];
  var System_Path = AP["System.Path"];
  var Prelude_Core = AP["Prelude.Core"];
  var fileSystemModule = System_FileInternal.getFsModule;
  var readSyncTextFile = function (fileEncoding) {
    return function (filePath) {
      return System_FileInternal.createEffect(function (_) {
        return fileSystemModule.readFileSync(filePath, {
          encoding: Core_Display.format(System_TextEncoding.displayEncoding)(
            fileEncoding
          ),
        });
      });
    };
  };
  out["readSyncTextFile"] = readSyncTextFile;
})(AP["System.FileSync"] = AP["System.FileSync"] || {});
(function (out) {
  "use strict";
  var Competition_ProblemSolver = AP["Competition.ProblemSolver"];
  var Logic_Pure = AP["Logic.Pure"];
  var Logic_Sequencer = AP["Logic.Sequencer"];
  var System_Effect = AP["System.Effect"];
  var System_Console = AP["System.Console"];
  var System_TextEncoding = AP["System.TextEncoding"];
  var System_FileSync = AP["System.FileSync"];
  var Prelude_Core = AP["Prelude.Core"];
  var executeSolution = Competition_ProblemSolver.executeSolution;
  var runApplication = function asyncOp() {
    var fileContent = System_FileSync.readSyncTextFile(
      System_TextEncoding.Utf8Encoding.value
    )("/dev/stdin")();
    var solutionOutput = executeSolution(fileContent);
    return System_Console.printToConsole(solutionOutput)();
  };
  out["runApplication"] = runApplication;
})(AP["App.Runner"] = AP["App.Runner"] || {});
AP["App.Runner"].runApplication();