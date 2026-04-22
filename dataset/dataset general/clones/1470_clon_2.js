function interpret_whitespace(input_data, current_position) {
  /* This function attempts to parse various forms of whitespace. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = recognize_literal(input_data, processing_status.current_position, ' ');
  if (processing_status) {
    /* Successfully parsed a space character. */
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    position_history.push(processing_status);
    processing_status = recognize_literal(input_data, processing_status.current_position, '\n');
    if (processing_status) {
      /* Successfully parsed a newline character. */
    }
    if (!processing_status) {
      processing_status = position_history.pop();
      processing_status = recognize_literal(input_data, processing_status.current_position, '\t');
      if (processing_status) {
        /* Successfully parsed a tab character. */
      }
    } else {
      position_history.pop();
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_optional_whitespace(input_data, current_position) {
  /* This function parses zero or more whitespace characters. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_whitespace(input_data, processing_status.current_position);
  if (processing_status) {
    processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
    if (processing_status) {
      /* Recursively parsed more whitespace. */
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_grammar_rule(input_data, current_position) {
  /* This function parses a single grammar rule definition. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = interpret_identifier(input_data, processing_status.current_position);
  if (processing_status) {
    let rule_name = processing_status.value;
    if (processing_status) {
      processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
      if (processing_status) {
        processing_status = recognize_literal(input_data, processing_status.current_position, '<-');
        if (processing_status) {
          processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
          if (processing_status) {
            processing_status = interpret_rule_alternatives(input_data, processing_status.current_position);
            if (processing_status) {
              let rule_body = processing_status.value;
              if (processing_status) {
                processing_status = recognize_literal(input_data, processing_status.current_position, '.');
                if (processing_status) {
                  processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
                  if (processing_status) {
                    /* Constructing the output function string for this rule. */
                    if (processing_status) processing_status.value = ["function parse_", rule_name, "(input, pos) {\n",
                      '  var state = { pos: pos };\n',
                      '  var stack = [];\n',
                      rule_body,
                      '  return state;\n',
                      "}\n"].join('');
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return processing_status;
}

function interpret_full_grammar(input_data, current_position) {
  /* This function parses a sequence of grammar rules. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
  if (processing_status) {
    processing_status = interpret_grammar_rule(input_data, processing_status.current_position);
    if (processing_status) {
      let first_rule_output = processing_status.value;
      if (processing_status) {
        processing_status = interpret_full_grammar(input_data, processing_status.current_position);
        if (processing_status) {
          let subsequent_rules_output = processing_status.value;
          if (processing_status) {
            /* Concatenate the generated code for rules. */
            if (processing_status) processing_status.value = first_rule_output + "\n" + subsequent_rules_output;
          }
        }
      }
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
    if (processing_status) {
      processing_status = interpret_grammar_rule(input_data, processing_status.current_position);
      if (processing_status) {
        let single_rule_output = processing_status.value;
        if (processing_status) {
          /* Final assembly of the generated parser. */
          if (processing_status) processing_status.value = single_rule_output + "\n"
            + 'function parse_char(input, pos) {\n'
            + '  if (pos >= input.length) return null;\n'
            + '  return { pos: pos + 1, val: input.charAt(pos) };\n'
            + '}\n'
            + 'function literal(input, pos, string) {\n'
            + '  if (input.substr(pos, string.length) === string) {\n'
            + '    return { pos: pos + string.length, val: string };\n'
            + '  } else return null;\n'
            + '}\n'
            + "if (typeof exports !== 'undefined')\n"
            + "    exports.parse_sentence = parse_full_grammar;\n"
            ;
        }
      }
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_meta_symbols(input_data, current_position) {
  /* This function identifies special meta-syntax symbols. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = recognize_literal(input_data, processing_status.current_position, '!');
  if (processing_status) {
    /* Matched '!' */
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    position_history.push(processing_status);
    processing_status = recognize_literal(input_data, processing_status.current_position, '\'');
    if (processing_status) {
      /* Matched ''' */
    }
    if (!processing_status) {
      processing_status = position_history.pop();
      position_history.push(processing_status);
      processing_status = recognize_literal(input_data, processing_status.current_position, '<-');
      if (processing_status) {
        /* Matched '<-' */
      }
      if (!processing_status) {
        processing_status = position_history.pop();
        position_history.push(processing_status);
        processing_status = recognize_literal(input_data, processing_status.current_position, '/');
        if (processing_status) {
          /* Matched '/' */
        }
        if (!processing_status) {
          processing_status = position_history.pop();
          position_history.push(processing_status);
          processing_status = recognize_literal(input_data, processing_status.current_position, '.');
          if (processing_status) {
            /* Matched '.' */
          }
          if (!processing_status) {
            processing_status = position_history.pop();
            position_history.push(processing_status);
            processing_status = recognize_literal(input_data, processing_status.current_position, '(');
            if (processing_status) {
              /* Matched '(' */
            }
            if (!processing_status) {
              processing_status = position_history.pop();
              position_history.push(processing_status);
              processing_status = recognize_literal(input_data, processing_status.current_position, ')');
              if (processing_status) {
                /* Matched ')' */
              }
              if (!processing_status) {
                processing_status = position_history.pop();
                position_history.push(processing_status);
                processing_status = recognize_literal(input_data, processing_status.current_position, ':');
                if (processing_status) {
                  /* Matched ':' */
                }
                if (!processing_status) {
                  processing_status = position_history.pop();
                  processing_status = recognize_literal(input_data, processing_status.current_position, '->');
                  if (processing_status) {
                    /* Matched '->' */
                  }
                } else {
                  position_history.pop();
                }
              } else {
                position_history.pop();
              }
            } else {
              position_history.pop();
            }
          } else {
            position_history.pop();
          }
        } else {
          position_history.pop();
        }
      } else {
        position_history.pop();
      }
    } else {
      position_history.pop();
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_identifier(input_data, current_position) {
  /* This function parses a grammar rule identifier. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_identifier_character(input_data, processing_status.current_position);
  if (processing_status) {
    let char_val = processing_status.value;
    if (processing_status) {
      processing_status = interpret_identifier(input_data, processing_status.current_position);
      if (processing_status) {
        let name_suffix = processing_status.value;
        if (processing_status) {
          /* Concatenate characters for the identifier. */
          if (processing_status) processing_status.value = char_val + name_suffix;
        }
      }
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    processing_status = interpret_identifier_character(input_data, processing_status.current_position);
    if (processing_status) {
      /* Single character identifier. */
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_identifier_character(input_data, current_position) {
  /* This function parses a single character valid in an identifier. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_meta_symbols(input_data, processing_status.current_position);
  if (processing_status) {
    position_history.pop();
    processing_status = null; /* Meta symbol is not an identifier char. */
  } else {
    processing_status = position_history.pop();
  }
  if (processing_status) {
    position_history.push(processing_status);
    processing_status = interpret_whitespace(input_data, processing_status.current_position);
    if (processing_status) {
      position_history.pop();
      processing_status = null; /* Whitespace is not an identifier char. */
    } else {
      processing_status = position_history.pop();
    }
    if (processing_status) {
      processing_status = parse_char(input_data, processing_status.current_position);
      if (processing_status) {
        /* Successfully parsed a character. */
      }
    }
  }
  return processing_status;
}

function interpret_rule_term(input_data, current_position) {
  /* This function parses a single term within a rule sequence. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_labeled_expression(input_data, processing_status.current_position);
  if (processing_status) {
    /* Matched a labeled expression. */
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    position_history.push(processing_status);
    processing_status = interpret_nonterminal_reference(input_data, processing_status.current_position);
    if (processing_status) {
      /* Matched a non-terminal reference. */
    }
    if (!processing_status) {
      processing_status = position_history.pop();
      position_history.push(processing_status);
      processing_status = interpret_string_literal(input_data, processing_status.current_position);
      if (processing_status) {
        /* Matched a string literal. */
      }
      if (!processing_status) {
        processing_status = position_history.pop();
        position_history.push(processing_status);
        processing_status = interpret_negation_expression(input_data, processing_status.current_position);
        if (processing_status) {
          /* Matched a negation expression. */
        }
        if (!processing_status) {
          processing_status = position_history.pop();
          processing_status = interpret_parenthesized_expression(input_data, processing_status.current_position);
          if (processing_status) {
            /* Matched a parenthesized expression. */
          }
        } else {
          position_history.pop();
        }
      } else {
        position_history.pop();
      }
    } else {
      position_history.pop();
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_nonterminal_reference(input_data, current_position) {
  /* This function parses a reference to another grammar rule. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = interpret_identifier(input_data, processing_status.current_position);
  if (processing_status) {
    let rule_ref_name = processing_status.value;
    if (processing_status) {
      processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
      if (processing_status) {
        /* Generate code for calling the referenced parser function. */
        if (processing_status) processing_status.value = ['  state = parse_', rule_ref_name, '(input, state.pos);\n'].join('');
      }
    }
  }
  return processing_status;
}

function interpret_labeled_expression(input_data, current_position) {
  /* This function parses a labeled term (e.g., 'label: term'). */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = interpret_identifier(input_data, processing_status.current_position);
  if (processing_status) {
    let label_name = processing_status.value;
    if (processing_status) {
      processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
      if (processing_status) {
        processing_status = recognize_literal(input_data, processing_status.current_position, ':');
        if (processing_status) {
          processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
          if (processing_status) {
            processing_status = interpret_rule_term(input_data, processing_status.current_position);
            if (processing_status) {
              let term_output = processing_status.value;
              if (processing_status) {
                /* Generate code to assign the term's value to the label. */
                if (processing_status) processing_status.value = [term_output, '  if (state) var ', label_name, ' = state.val;\n'].join('');
              }
            }
          }
        }
      }
    }
  }
  return processing_status;
}

function interpret_rule_sequence(input_data, current_position) {
  /* This function parses a sequence of terms within a rule. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_rule_term(input_data, processing_status.current_position);
  if (processing_status) {
    let first_term_code = processing_status.value;
    if (processing_status) {
      processing_status = interpret_rule_sequence(input_data, processing_status.current_position);
      if (processing_status) {
        let subsequent_terms_code = processing_status.value;
        if (processing_status) {
          /* Combine code for sequential terms. */
          if (processing_status) processing_status.value = [first_term_code, '  if (state) {\n', subsequent_terms_code, '  }\n'].join('');
        }
      }
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    position_history.push(processing_status);
    processing_status = interpret_result_action(input_data, processing_status.current_position);
    if (processing_status) {
      /* Matched a result action. */
    }
    if (!processing_status) {
      processing_status = position_history.pop();
      /* Empty sequence, generates no code. */
      if (processing_status) processing_status.value = '';
    } else {
      position_history.pop();
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_string_literal(input_data, current_position) {
  /* This function parses a quoted string literal. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = recognize_literal(input_data, processing_status.current_position, '\'');
  if (processing_status) {
    processing_status = interpret_string_contents(input_data, processing_status.current_position);
    if (processing_status) {
      let string_val = processing_status.value;
      if (processing_status) {
        processing_status = recognize_literal(input_data, processing_status.current_position, '\'');
        if (processing_status) {
          processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
          if (processing_status) {
            /* Generate code to recognize this literal. */
            if (processing_status) processing_status.value = ["  state = literal(input, state.pos, '", string_val, "');\n"].join('');
          }
        }
      }
    }
  }
  return processing_status;
}

function interpret_string_contents(input_data, current_position) {
  /* This function parses the characters inside a string literal, handling escapes. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  position_history.push(processing_status);
  processing_status = recognize_literal(input_data, processing_status.current_position, '\\');
  if (processing_status) {
    position_history.pop();
    processing_status = null; /* Backslash, so this is an escape. */
  } else {
    processing_status = position_history.pop();
  }
  if (processing_status) {
    position_history.push(processing_status);
    processing_status = recognize_literal(input_data, processing_status.current_position, '\'');
    if (processing_status) {
      position_history.pop();
      processing_status = null; /* Quote, so this is the end of the string. */
    } else {
      processing_status = position_history.pop();
    }
    if (processing_status) {
      processing_status = parse_char(input_data, processing_status.current_position);
      if (processing_status) {
        let char_val = processing_status.value;
        if (processing_status) {
          processing_status = interpret_string_contents(input_data, processing_status.current_position);
          if (processing_status) {
            let remaining_string = processing_status.value;
            if (processing_status) {
              /* Concatenate characters. */
              if (processing_status) processing_status.value = char_val + remaining_string;
            }
          }
        }
      }
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    position_history.push(processing_status);
    processing_status = recognize_literal(input_data, processing_status.current_position, '\\');
    if (processing_status) {
      let backslash_char = processing_status.value;
      if (processing_status) {
        processing_status = parse_char(input_data, processing_status.current_position);
        if (processing_status) {
          let escaped_char = processing_status.value;
          if (processing_status) {
            processing_status = interpret_string_contents(input_data, processing_status.current_position);
            if (processing_status) {
              let remaining_string = processing_status.value;
              if (processing_status) {
                /* Concatenate escaped characters. */
                if (processing_status) processing_status.value = backslash_char + escaped_char + remaining_string;
              }
            }
          }
        }
      }
    }
    if (!processing_status) {
      processing_status = position_history.pop();
      /* Empty string contents. */
      if (processing_status) processing_status.value = '';
    } else {
      position_history.pop();
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_rule_alternatives(input_data, current_position) {
  /* This function parses a choice between multiple rule sequences. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  processing_status = interpret_rule_sequence(input_data, processing_status.current_position);
  if (processing_status) {
    let first_alternative_code = processing_status.value;
    if (processing_status) {
      processing_status = recognize_literal(input_data, processing_status.current_position, '/');
      if (processing_status) {
        processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
        if (processing_status) {
          processing_status = interpret_rule_alternatives(input_data, processing_status.current_position);
          if (processing_status) {
            let subsequent_alternative_code = processing_status.value;
            if (processing_status) {
              /* Generate code for a choice (OR) operation. */
              if (processing_status) processing_status.value = ['  stack.push(state);\n',
                first_alternative_code,
                '  if (!state) {\n',
                '    state = stack.pop();\n',
                subsequent_alternative_code,
                '  } else stack.pop();\n'].join('');
            }
          }
        }
      }
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    processing_status = interpret_rule_sequence(input_data, processing_status.current_position);
    if (processing_status) {
      /* Single alternative. */
    }
  } else {
    position_history.pop();
  }
  return processing_status;
}

function interpret_negation_expression(input_data, current_position) {
  /* This function parses a negation (NOT) expression. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = recognize_literal(input_data, processing_status.current_position, '!');
  if (processing_status) {
    processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
    if (processing_status) {
      processing_status = interpret_rule_term(input_data, processing_status.current_position);
      if (processing_status) {
        let term_to_negate_code = processing_status.value;
        if (processing_status) {
          /* Generate code for negation. */
          if (processing_status) processing_status.value = ['  stack.push(state);\n',
            term_to_negate_code,
            '  if (state) {\n',
            '    stack.pop();\n',
            '    state = null;\n',
            '  } else {\n',
            '    state = stack.pop();\n',
            '  }\n'].join('');
        }
      }
    }
  }
  return processing_status;
}

function interpret_parenthesized_expression(input_data, current_position) {
  /* This function parses an expression enclosed in parentheses. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = recognize_literal(input_data, processing_status.current_position, '(');
  if (processing_status) {
    processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
    if (processing_status) {
      processing_status = interpret_rule_alternatives(input_data, processing_status.current_position);
      if (processing_status) {
        let inner_expression_code = processing_status.value;
        if (processing_status) {
          processing_status = recognize_literal(input_data, processing_status.current_position, ')');
          if (processing_status) {
            processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
            if (processing_status) {
              /* The generated code is simply the code of the inner expression. */
              if (processing_status) processing_status.value = inner_expression_code;
            }
          }
        }
      }
    }
  }
  return processing_status;
}

function interpret_result_action(input_data, current_position) {
  /* This function parses a code block that determines the result value. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  processing_status = recognize_literal(input_data, processing_status.current_position, '->');
  if (processing_status) {
    processing_status = interpret_optional_whitespace(input_data, processing_status.current_position);
    if (processing_status) {
      processing_status = interpret_javascript_code(input_data, processing_status.current_position);
      if (processing_status) {
        let js_code_block = processing_status.value;
        if (processing_status) {
          /* Generate code to execute the JS block and assign its result. */
          if (processing_status) processing_status.value = ['  if (state) state.val = (function() {', js_code_block, '})();\n'].join('');
        }
      }
    }
  }
  return processing_status;
}

function interpret_javascript_code(input_data, current_position) {
  /* This function parses raw JavaScript code within a grammar. */
  let processing_status = { current_position: current_position };
  let position_history = [];
  position_history.push(processing_status);
  position_history.push(processing_status);
  processing_status = recognize_literal(input_data, processing_status.current_position, '\n');
  if (processing_status) {
    position_history.pop();
    processing_status = null; /* Newline signifies end of code block. */
  } else {
    processing_status = position_history.pop();
  }
  if (processing_status) {
    processing_status = parse_char(input_data, processing_status.current_position);
    if (processing_status) {
      let char_content = processing_status.value;
      if (processing_status) {
        processing_status = interpret_javascript_code(input_data, processing_status.current_position);
        if (processing_status) {
          let remaining_code = processing_status.value;
          if (processing_status) {
            /* Concatenate characters of the JS code. */
            if (processing_status) processing_status.value = char_content + remaining_code;
          }
        }
      }
    }
  }
  if (!processing_status) {
    processing_status = position_history.pop();
    /* Empty JavaScript code block. */
    if (processing_status) processing_status.value = '';
  } else {
    position_history.pop();
  }
  return processing_status;
}