// License details for this software component.
//
// All rights are reserved for this work.
//
// Distribution and usage of this software, in both source and compiled forms,
// is permitted provided the following conditions are met:
//
//  * Redistributions of the source code must include the above copyright
//    notice, this list of conditions, and the following disclaimer.
//
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions, and the following disclaimer in the
//    accompanying documentation and/or other distributed materials.
//
//  * Neither the name of the original developer nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission from the owner.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//
// IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
// OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
// BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
// DAMAGE.

var kit = require("./kit");
var blueprint = require("./blueprint");
var blueprint_creator = require("./blueprint-maker");
var disk_io = require("fs");

module.supply(

  // This function parses a blueprint definition from a file.
  // The second argument can be either a blueprint object or an event observer.
  // If it's a blueprint object, the parser will populate it with definitions.
  // If it's an observer, the observer will receive events corresponding
  // to the definitions found in the file. The parser signals events by
  // invoking specific function properties on the observer object:

  //   onNamespaceDeclaration (label_string)
  //
  //   onStartComponentDefinition (label_string, identification, parent_type, attributes, location_info)
  //   onEndComponentDefinition ()
  //
  //   onStartProperty (location_info)
  //   onEndProperty (label_string, identification, required_status, attributes)
  //
  //   onStartAlias (label_string, identification, attributes, location_info)
  //   onEndAlias ()
  //
  //   onStartEnumeration (location_info)
  //   onEndEnumeration ()
  //
  //   onReferenceType (label_string, arrangement_kind, collection_kind, attributes, location_info)
  //   onStringTypeDefinition (collection_kind, maximum_length, attributes, location_info)
  //   onBinaryTypeDefinition (collection_kind, maximum_length, attributes, location_info)
  //   onSizedTypeDefinition (collection_kind, fixed_size, attributes, location_info)
  //   onPrimitiveType (data_type, collection_kind, attributes, location_info)
  //   onEnumSymbol (label_string, symbol_value, attributes, location_info)
  //
  //   onBlueprintAnnotation (attributes, location_info)
  //   onExtensionAnnotation (label_string, sub_step_ref, path_classification, identification, attributes, location_info)

  // Structural elements with nested content are indicated by matching
  // 'start' and 'end' event pairs.

  // The event arguments explained:
  //
  //   label_string        - a textual name
  //   parent_type         - a string representing the super type
  //   data_type           - blueprint.DataTypeCode.I8 | ... | blueprint.DataTypeCode.Object
  //   arrangement_kind    - blueprint.Arrangement.Dynamic | blueprint.Arrangement.Static
  //   symbol_value        - string value for an enum symbol
  //   identification      - an ID string
  //   collection_kind     - blueprint.CollectionRank.Single | blueprint.CollectionRank.Sequence
  //   required_status     - blueprint.FieldNecessity.Optional | blueprint.FieldNecessity.Required
  //   sub_step_ref        - string reference for a component sub-step
  //   path_classification - blueprint.ReferencePathType.Name or blueprint.ReferencePathType.Type
  //   attributes          - an object where each property corresponds to an annotation
  //   location_info       - { line: 1, col: 1, src: "blueprint.blink" }
  //   maximum_length      - max size for string or binary types
  //   fixed_size          - specific size for fixed types

  parse_file, // (input_file_path, target_container)

  // Parses a blueprint definition from a string. An optional source identity
  // (filename) can be provided for error reporting. If the first argument
  // is an array, it will be flattened, and all elements will be joined
  // into a single string, separated by newline characters.

  parse_text // (source_content, target_container [, source_identity])
);

function parse_file(input_file_path, target_container) {
  process_source(
    disk_io.readFileSync(input_file_path),
    input_file_path || "-",
    create_listener(target_container)
  );
}

function parse_text(source_content, target_container, source_identity) {
  if (kit.is_array_check(source_content))
    source_content = kit.flatten_array(source_content).join("\n");
  process_source(
    source_content,
    source_identity || "-",
    create_listener(target_container)
  );
}

var ActionNames = [
  "NamespaceDeclaration",
  "StartComponentDefinition",
  "EndComponentDefinition",
  "StartProperty",
  "EndProperty",
  "StartAlias",
  "EndAlias",
  "StartEnumeration",
  "EndEnumeration",
  "ReferenceType",
  "StringTypeDefinition",
  "BinaryTypeDefinition",
  "SizedTypeDefinition",
  "PrimitiveType",
  "EnumSymbol",
  "BlueprintAnnotation",
  "ExtensionAnnotation",
];

function create_listener(listener_obj) {
  listener_obj = listener_obj || build_debug_listener();
  if (listener_obj instanceof blueprint.BlueprintRegistry)
    listener_obj = blueprint_creator.create(listener_obj);

  // Install placeholder event handlers for any events not explicitly handled by the listener
  var extended_listener = {};
  ActionNames.forEach(function (action_item) {
    var method_name = "on" + action_item;
    var method_ref = listener_obj[method_name];
    if (method_ref)
      extended_listener[method_name] = function () {
        method_ref.apply(listener_obj, arguments);
      };
    else extended_listener[method_name] = function () {};
  });

  return extended_listener;
}

function build_debug_listener() {
  var listener_obj = {};

  ActionNames.forEach(function (action_item) {
    listener_obj["on" + action_item] = function () {
      var argument_list = [];
      for (var index_val = 0; index_val < arguments.length; ++index_val) {
        var current_arg = arguments[index_val];
        if (kit.is_text(current_arg))
          argument_list.push('"' + current_arg + '"');
        else if (kit.is_numeric(current_arg) || kit.is_enumeration(current_arg))
          argument_list.push(current_arg);
        else if (current_arg instanceof blueprint.SourcePoint)
          argument_list.push(current_arg);
        else {
          var annotations_array = kit
            .get_object_properties(current_arg)
            .map(function (prop_name) {
              return prop_name + '="' + current_arg[prop_name] + '"';
            });
          argument_list.push("[" + annotations_array.join(", ") + "]");
        }
      }
      console.info(action_item + " (" + argument_list.join(", ") + ")");
    };
  });

  return listener_obj;
}

var Lexeme;
var Unique = {};
var ReservedWord = {};

function process_source(source_content, source_identity, event_sink) {
  var tokenizer_instance = tokenize(source_content, source_identity);

  var current_metadata = {};
  var pending_identifier = "";
  var pending_label = "";

  // blueprint ::=
  //    definitions
  //  | namespaceDeclaration definitions

  // namespaceDeclaration ::=
  //    "namespace" label

  if (tokenizer_instance.next("namespace")) process_namespace_declaration();

  // definitions ::=
  //    epsilon
  //  | definition definitions

  while (!tokenizer_instance.match("End")) handle_definition();

  function extract_metadata() {
    var temp_metadata = current_metadata;
    current_metadata = {};
    return temp_metadata;
  }

  function retrieve_identifier() {
    var identification = pending_identifier;
    pending_identifier = "";
    return identification;
  }

  // process_annotation ::=
  //   "@" qualifiedNameOrKeyword "=" literal

  function process_annotation() {
    var entry_name =
      tokenizer_instance.nextNameOrKeyword() ||
      tokenizer_instance.expected("annotation name");
    tokenizer_instance.require("=");
    var entry_value = tokenizer_instance.require("String");
    for (;;) {
      var continuation_string = tokenizer_instance.next("String");
      if (continuation_string) entry_value += continuation_string;
      else break;
    }
    current_metadata[entry_name] = entry_value;
  }

  // parse_annotations ::=
  //    epsilon
  //  | process_annotation parse_annotations

  function parse_annotations() {
    while (tokenizer_instance.next("@")) process_annotation();
  }

  // process_namespace_declaration ::=
  //    "namespace" label

  function process_namespace_declaration() {
    event_sink.onNamespaceDeclaration(
      tokenizer_instance.require("Name", "namespace label")
    );
  }

  // parse_labeled_entity ::=
  //    label identification

  function parse_labeled_entity(entity_description) {
    pending_label = tokenizer_instance.require("Name", entity_description);
    pending_identifier = "";
    if (tokenizer_instance.next("/")) {
      pending_identifier =
        tokenizer_instance.next("Uint", "Hex") ||
        tokenizer_instance.expected("unsigned integer or hex number");
    }
  }

  // sequence ::=
  //    unique "[" "]"

  function determine_cardinality() {
    if (tokenizer_instance.next("[")) {
      tokenizer_instance.require("]");
      return blueprint.CollectionRank.Sequence;
    } else return blueprint.CollectionRank.Single;
  }

  // reference ::=
  //    qualifiedName
  //  | qualifiedName "*"

  function handle_type_reference() {
    var entry_name = tokenizer_instance.next();
    var layout_type = tokenizer_instance.next("*")
      ? blueprint.Arrangement.Dynamic
      : blueprint.Arrangement.Static;
    var cardinality_spec = determine_cardinality();
    event_sink.onReferenceType(
      entry_name,
      layout_type,
      cardinality_spec,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // string ::=
  //    "string"
  //  | "string" "(" unsignedInt ")"

  function process_string_type() {
    tokenizer_instance.next();
    var maximum_size;
    if (tokenizer_instance.next("(")) {
      maximum_size = tokenizer_instance.require("Uint", "string max size");
      tokenizer_instance.require(")");
    }
    var cardinality_spec = determine_cardinality();
    event_sink.onStringTypeDefinition(
      cardinality_spec,
      maximum_size,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // binary ::=
  //    "binary"
  //  | "binary" "(" unsignedInt ")"

  function process_binary_type() {
    tokenizer_instance.next();
    var maximum_size;
    if (tokenizer_instance.next("(")) {
      maximum_size = tokenizer_instance.require("Uint", "binary max size");
      tokenizer_instance.require(")");
    }
    var cardinality_spec = determine_cardinality();
    event_sink.onBinaryTypeDefinition(
      cardinality_spec,
      maximum_size,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // fixed ::=
  //  | "fixed" "(" unsignedInt ")"

  function handle_fixed_type() {
    tokenizer_instance.next();
    tokenizer_instance.require("(");
    var fixed_length = tokenizer_instance.require("Uint", "fixed max size");
    tokenizer_instance.require(")");
    var cardinality_spec = determine_cardinality();
    event_sink.onSizedTypeDefinition(
      cardinality_spec,
      fixed_length,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // "i8" ... "object"

  function parse_primitive_type() {
    var type_code_val =
      blueprint.DataTypeCode[kit.capitalize_first(tokenizer_instance.next())];
    var cardinality_spec = determine_cardinality();
    event_sink.onPrimitiveType(
      type_code_val,
      cardinality_spec,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // handle_type_definition ::=
  //    unique | sequence
  //
  // unique ::=
  //    reference | time | number | string | binary | fixed | "bool" | "object"

  function handle_type_definition() {
    if (tokenizer_instance.match("Name", "Qname")) handle_type_reference();
    else if (tokenizer_instance.match("string")) process_string_type();
    else if (tokenizer_instance.match("binary")) process_binary_type();
    else if (tokenizer_instance.match("fixed")) handle_fixed_type();
    else if (
      tokenizer_instance.match("namespace", "blueprint", "type")
    )
      tokenizer_instance.expected("type specifier");
    else if (tokenizer_instance.matchAnyKeyword()) parse_primitive_type();
    else tokenizer_instance.expected("type specifier");
  }

  // process_field_definition ::=
  //    parse_annotations handle_type_definition parse_annotations parse_labeled_entity optional_modifier
  //
  // optional_modifier ::=
  //    epsilon | "?"

  function process_field_definition() {
    parse_annotations();
    event_sink.onStartProperty(tokenizer_instance.loc());
    handle_type_definition();
    parse_annotations();
    parse_labeled_entity("field label");
    var presence_requirement = tokenizer_instance.next("?")
      ? blueprint.FieldNecessity.Optional
      : blueprint.FieldNecessity.Required;
    event_sink.onEndProperty(
      pending_label,
      retrieve_identifier(),
      presence_requirement,
      extract_metadata()
    );
  }

  // handle_group_definition ::=
  //    parse_labeled_entity super_type_specifier definition_body
  //
  // super_type_specifier ::=
  //    epsilon
  //  | ":" qualifiedName
  //
  // definition_body ::=
  //    epsilon
  //  | "->" fields_list

  // fields_list ::=
  //    process_field_definition
  //  | process_field_definition "," fields_list

  function handle_group_definition() {
    var super_type_name = "";
    if (tokenizer_instance.next(":"))
      super_type_name =
        tokenizer_instance.next("Name", "Qname") ||
        tokenizer_instance.expected("supertype label");

    event_sink.onStartComponentDefinition(
      pending_label,
      retrieve_identifier(),
      super_type_name,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );

    if (tokenizer_instance.next("->")) {
      for (;;) {
        process_field_definition();
        if (!tokenizer_instance.next(",")) break;
      }
    }

    event_sink.onEndComponentDefinition();
  }

  // process_symbol ::=
  //    parse_annotations label symbol_value
  //
  // symbol_value ::=
  //    epsilon
  //  | "/" (integer | hexNumber)

  function process_symbol() {
    parse_annotations();
    var entry_name = tokenizer_instance.require("Name", "enum symbol label");
    var symbol_value = "";
    if (tokenizer_instance.next("/")) {
      symbol_value =
        tokenizer_instance.next("Uint", "Int", "Hex") ||
        tokenizer_instance.expected("integer or hex number");
    }
    event_sink.onEnumSymbol(
      entry_name,
      symbol_value,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // parse_enum_definition ::=
  //    "|" process_symbol
  //  | process_symbol "|" symbols_list
  //
  // symbols_list ::=
  //    process_symbol
  //  | process_symbol "|" symbols_list

  function parse_enum_definition() {
    event_sink.onStartEnumeration(tokenizer_instance.lastLoc());
    if (tokenizer_instance.next("|")) process_symbol();
    else {
      for (;;) {
        process_symbol();
        if (!tokenizer_instance.next("|")) break;
      }
    }

    event_sink.onEndEnumeration();
  }

  // handle_definition_block ::=
  //    parse_labeled_entity "=" (parse_enum_definition | (parse_annotations handle_type_definition))

  function handle_definition_block() {
    event_sink.onStartAlias(
      pending_label,
      retrieve_identifier(),
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
    parse_annotations();
    if (
      tokenizer_instance.match("|") ||
      (tokenizer_instance.match("Name") && tokenizer_instance.matchPend("/", "|"))
    )
      parse_enum_definition();
    else handle_type_definition();
    event_sink.onEndAlias();
  }

  // parse_incremental_annotation_list ::=
  //    parse_incremental_annotation_item
  //  | parse_incremental_annotation_item "<-" parse_incremental_annotation_list

  function parse_incremental_annotation_list() {
    if (!tokenizer_instance.match("<-"))
      tokenizer_instance.expected("expected '<-'");

    while (tokenizer_instance.next("<-")) {
      parse_incremental_annotation_item();
    }
  }

  // parse_incremental_annotation_item ::=
  //    annots name substep pathType id annots loc

  function parse_incremental_annotation_item() {
    parse_annotations();
    var entry_name = tokenizer_instance.require("Name", "annotation name");
    var sub_step_ref = "";
    if (tokenizer_instance.next(".")) {
      sub_step_ref =
        tokenizer_instance.next("Name") ||
        tokenizer_instance.expected("substep name");
    }

    var path_classification;
    if (tokenizer_instance.next("#")) {
      path_classification = blueprint.ReferencePathType.Type;
    } else {
      path_classification = blueprint.ReferencePathType.Name;
    }

    var identifier_code = tokenizer_instance.next("Uint", "Hex") || "";

    event_sink.onExtensionAnnotation(
      entry_name,
      sub_step_ref,
      path_classification,
      identifier_code,
      extract_metadata(),
      tokenizer_instance.lastLoc()
    );
  }

  // definition ::=
  //    annots (groupDef | define | incrAnnotList)

  function handle_definition() {
    parse_annotations();
    if (tokenizer_instance.matchKeyword("group")) {
      tokenizer_instance.next(); // Consume "group"
      parse_labeled_entity("group name");
      handle_group_definition();
    } else if (tokenizer_instance.matchKeyword("define")) {
      tokenizer_instance.next(); // Consume "define"
      parse_labeled_entity("alias name");
      tokenizer_instance.require("=");
      handle_definition_block();
    } else if (tokenizer_instance.matchKeyword("annotation")) {
      tokenizer_instance.next(); // Consume "annotation"
      tokenizer_instance.next("incr") ||
        tokenizer_instance.expected("'incr' for annotation");
      parse_incremental_annotation_list();
    } else if (tokenizer_instance.matchKeyword("blueprint")) {
      tokenizer_instance.next(); // Consume "blueprint"
      event_sink.onBlueprintAnnotation(
        extract_metadata(),
        tokenizer_instance.lastLoc()
      );
    } else tokenizer_instance.expected("definition type");
  }
}