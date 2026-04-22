(function(void_val) {
  // Global object holding core functionality
  var Gemstone = this.Gemstone = {};

  // Reference for the fundamental base entity
  var CoreBasicEntity;

  // Reference for the standard entity type
  var CoreEntity;

  // Reference for the module construct
  var CoreMod;

  // Reference for the class construct
  var CoreClass;

  // Builder for instances of the basic entity
  function BaseEntity(){}

  // Builder for instances of the standard entity
  function Entity(){}

  // Builder for instances of the class construct
  function ClassType(){}

  // Builder for instances of the module construct
  function ModType(){}

  // Builder for instances of the null entity (nil)
  function NullType(){}

  // Collection of native JavaScript types wrapped as Gemstone entities
  var native_wrappers = [];

  // GlobalContext is utilized for constant inheritance at the highest level
  var GlobalContext = function(){};

  // Gemstone itself serves as the top-level context
  GlobalContext.prototype = Gemstone;

  // To facilitate context inheritance
  Gemstone.initializer = GlobalContext;

  Gemstone.defined_items = [];

  // A useful pointer to the global execution context within Gemstone files
  Gemstone.overall = this;

  // Shorten frequently used function calls
  var ownPropCheck = Gemstone.hasOwnProperty;
  var arrSlice = Gemstone.slice = Array.prototype.slice;

  // Counter for generating unique identifiers for every Gemstone entity
  var next_seq_id = 0;

  // Returns the next available unique ID
  Gemstone.get_seq_id = function() {
    return next_seq_id++;
  };

  // Repository for all class-level variables
  Gemstone.class_vars = {};

  // Repository for global variables
  Gemstone.global_vars = {};

  /*
   * Establishes a new constant context for a given entity type with a specified
   * parent context. Constants are resolved through their hierarchical parents,
   * so the parent context will be the enclosing scope of the new entity_type.
   */
  function form_context(parent_ctx, entity_type, name_ident) {
    let item_allocator = function() {};
    let item_context = item_allocator.prototype = new parent_ctx.initializer();
    entity_type._context = item_context;
    item_context.base = entity_type;
    entity_type._parent_mod = parent_ctx.base;
    item_context.initializer = item_allocator;
    item_context.defined_items = [];

    if (name_ident) {
      entity_type._initial_context = parent_ctx;
      parent_ctx[name_ident] = parent_ctx.initializer[name_ident] = entity_type;
      parent_ctx.defined_items.push(name_ident);
    }
  }

  Gemstone.form_context = form_context;

  /*
   * A `class Foo; end` declaration in Gemstone is compiled to invoke this
   * runtime method. It either retrieves an existing class by the given name
   * or constructs a new one within the provided `parent_ctx` scope.
   *
   * If a constant with the specified name exists, we verify it's a class
   * and that its ancestor types align. Any mismatch triggers a `KindError`.
   * Note that `ancestor_type` might be null if not explicitly defined in
   * the Gemstone code.
   *
   * We supply a builder function, such as `function ClassName() {}`, primarily
   * to ensure that classes are displayed with readable names in debugger tools
   * across various environments (browsers, Node.js, etc.).
   *
   * The `parent_ctx` represents the `self` value where the class definition
   * originates. We use this to determine the appropriate scope for the
   * class. If `parent_ctx` is an object (not a class/module), its own class
   * is used as the base instead.
   *
   * @param {Object} parent_ctx The context where the class is being defined.
   * @param {Class} ancestor_type The superclass of the new class (can be null).
   * @param {String} name_ident The identifier for the class to be created.
   * @param {Function} builder_func The function to serve as the constructor.
   * @returns {Class} The newly created or existing Gemstone class.
   */
  Gemstone.make_class = function(parent_ctx, ancestor_type, name_ident, builder_func) {

    // If parent_ctx is an object, use its entity type
    if (!parent_ctx._isEntityType) {
      parent_ctx = parent_ctx._entity_type;
    }

    // If no ancestor_type is specified, it defaults to CoreEntity
    if (ancestor_type === null) {
      ancestor_type = CoreEntity;
    }

    var entity_type = parent_ctx._context[name_ident];

    // If a constant exists in the scope, it must be used
    if (ownPropCheck.call(parent_ctx._context, name_ident) && entity_type._initial_context === parent_ctx._context) {

      // Ensure the existing constant is a class, otherwise throw an error
      if (!entity_type._isEntityType) {
        throw Gemstone.KindError.$new(name_ident + " is not a class entity");
      }

      // Verify the existing class has the same ancestor_type
      if (ancestor_type !== entity_type._ancestor && ancestor_type !== CoreEntity) {
        throw Gemstone.KindError.$new("ancestor type mismatch for entity " + name_ident);
      }
    }
    else if (typeof(ancestor_type) === 'function') {
      // If a native builder_func is passed as ancestor_type, wrap it as a Gemstone class
      return wrap_native_type(name_ident, ancestor_type);
    }
    else {
      // If the entity type doesn't exist, create a new one with the given ancestor
      entity_type = init_entity_type(ancestor_type, builder_func);

      // Assign the entity type's name based on its context (e.g., Foo or Foo::Baz)
      entity_type._entity_name = name_ident;

      // Each entity type gets its own constant context, inherited from the current context
      form_context(parent_ctx._context, entity_type, name_ident);

      // Set the new entity type directly onto the current context (Gemstone.Foo.Baz = entity_type)
      parent_ctx[name_ident] = parent_ctx._context[name_ident] = entity_type;

      // Propagate all parent constants to the child, unless the parent is CoreEntity
      if (ancestor_type !== CoreEntity && ancestor_type !== CoreBasicEntity) {
        Gemstone.transfer_items(ancestor_type, entity_type);
      }

      // Invoke the .on_inherited() hook on the ancestor_type with the new entity_type
      if (ancestor_type.$on_inherited) {
        ancestor_type.$on_inherited(entity_type);
      }
    }

    return entity_type;
  };

  // Constructs a generic entity type with a specified ancestor.
  var init_entity_type = Gemstone.init_type = function(ancestor_type, builder_func) {
    // For instances
    var ctor_proxy = function() {};
    ctor_proxy.prototype = ancestor_type._prototype_ref;

    builder_func.prototype = new ctor_proxy();

    builder_func.prototype.initializer = builder_func;

    return init_entity_meta(ancestor_type, builder_func);
  };

  // For the entity type itself (meta-class)
  function init_entity_meta(ancestor_type, builder_func) {
    var meta_ctor_proxy = function() {};
    meta_ctor_proxy.prototype = ancestor_type.initializer.prototype;

    function GemstoneClassRef() {}
    GemstoneClassRef.prototype = new meta_ctor_proxy();

    var entity_type = new GemstoneClassRef();

    entity_type._entity_id = next_seq_id++;
    entity_type._allocator_ref = builder_func;
    entity_type._isEntityType = true;
    entity_type.initializer = GemstoneClassRef;
    entity_type._ancestor = ancestor_type;
    entity_type._operations = [];
    entity_type.__includes__ = [];
    entity_type.__parent_ref = ancestor_type;
    entity_type._prototype_ref = builder_func.prototype;

    builder_func.prototype._entity_type = entity_type;

    return entity_type;
  }

  // Defines a new module (or retrieves an existing one)
  Gemstone.make_module = function(parent_ctx, name_ident) {
    var mod_obj;

    if (!parent_ctx._isEntityType) {
      parent_ctx = parent_ctx._entity_type;
    }

    if (ownPropCheck.call(parent_ctx._context, name_ident)) {
      mod_obj = parent_ctx._context[name_ident];

      if (!mod_obj.__is_module__ && mod_obj !== CoreEntity) {
        throw Gemstone.KindError.$new(name_ident + " is not a module entity")
      }
    }
    else {
      mod_obj = init_mod_type()
      mod_obj._entity_name = name_ident;

      form_context(parent_ctx._context, mod_obj, name_ident);

      // Places the new module directly onto the current context (Gemstone.Foo.Baz = mod_obj)
      parent_ctx[name_ident] = parent_ctx._context[name_ident] = mod_obj;
    }

    return mod_obj;
  };

  /*
   * Internal routine to instantiate a new module object. This simply configures
   * the prototype chain and method lookup tables.
   */
  function init_mod_type() {
    var meta_ctor_proxy = function() {};
    meta_ctor_proxy.prototype = CoreMod.initializer.prototype;

    function GemstoneModuleRef() {}
    GemstoneModuleRef.prototype = new meta_ctor_proxy();

    var mod_obj = new GemstoneModuleRef();

    mod_obj._entity_id = next_seq_id++;
    mod_obj._isEntityType = true;
    mod_obj.initializer = GemstoneModuleRef;
    mod_obj._ancestor = CoreMod;
    mod_obj._operations = [];
    mod_obj.__includes__ = [];
    mod_obj.__parent_ref = CoreMod;
    mod_obj._prototype_ref = {};
    mod_obj.__is_module__ = true;
    mod_obj.__dependencies__ = [];

    return mod_obj;
  }

  // Initializes a base entity type (creates instances).
  var init_def_type = function(name_ident, builder_func, ancestor_type) {
    if (ancestor_type) {
      let ctor_proxy = function() {};
      ctor_proxy.prototype = ancestor_type.prototype;

      builder_func.prototype = new ctor_proxy();
    }

    builder_func.prototype.initializer = builder_func;

    return builder_func;
  };

  // Initializes the actual (meta?) types of core entities
  var init_meta_type = function(name_ident, builder_func, ancestor_type) {

    var meta_ctor_proxy = function() {};
    meta_ctor_proxy.prototype = ancestor_type.prototype;

    function GemstoneClassRef() {}
    GemstoneClassRef.prototype = new meta_ctor_proxy();

    var entity_type = new GemstoneClassRef();

    entity_type._entity_id = next_seq_id++;
    entity_type._allocator_ref = builder_func;
    entity_type._isEntityType = true;
    entity_type._entity_name = name_ident;
    entity_type._ancestor = ancestor_type;
    entity_type.initializer = GemstoneClassRef;
    entity_type._operations = [];
    entity_type.__includes__ = [];
    entity_type.__parent_ref = ancestor_type;
    entity_type._prototype_ref = builder_func.prototype;

    builder_func.prototype._entity_type = entity_type;

    Gemstone[name_ident] = entity_type;
    Gemstone.defined_items.push(name_ident);

    return entity_type;
  };

  /*
   * For performance considerations, some fundamental Gemstone entities are
   * seamlessly mapped to their native JavaScript counterparts (e.g., a
   * Gemstone Array is a JavaScript Array).
   *
   * This method configures a native builder (e.g., Array) so its prototype
   * behaves like a regular Gemstone entity. First, a new Gemstone entity
   * is created using the native builder, ensuring its prototype becomes
   * the target for the new entity. All wrapped entities are set to inherit
   * from CoreEntity.
   *
   * Wrapped entities are tracked in the `native_wrappers` array. This allows
   * methods defined on CoreEntity to be "donated" to all wrapped entities,
   * simulating the inheritance of a native prototype from our CoreEntity
   * prototype.
   *
   * Example:
   *
   *    wrap_native_type("Proc", Function);
   *
   * @param {String} type_name The name of the Gemstone entity to create.
   * @param {Function} native_builder The native JavaScript constructor to use.
   * @returns {Class} The new Gemstone entity type.
   */
  function wrap_native_type(type_name, native_builder) {
    var entity_type = init_entity_meta(CoreEntity, native_builder);

    entity_type._entity_name = type_name;

    form_context(Gemstone, entity_type, type_name);
    native_wrappers.push(entity_type);

    var entity_operations = CoreBasicEntity._operations.concat(CoreEntity._operations);

    for (var i = 0, len = entity_operations.length; i < len; i++) {
      var op_name = entity_operations[i];
      native_builder.prototype[op_name] = CoreEntity._prototype_ref[op_name];
    }

    return entity_type;
  }

  /*
   * Assigns a constant value.
   */
  Gemstone.assign_const = function(parent_mod, item_name, item_value) {
    var context_ref = parent_mod._context;

    if (item_value._isEntityType && item_value._entity_name === void_val) {
      item_value._entity_name = item_name;
    }

    if (item_value._isEntityType) {
      item_value._parent_mod = parent_mod;
    }

    context_ref.defined_items.push(item_name);
    return context_ref[item_name] = item_value;
  };

  /*
   * Declares a constant.
   */
  Gemstone.declare_const = function(parent_scope, item_name, item_value) {
    parent_scope.defined_items.push(item_name);
    return parent_scope[item_name] = item_value;
  };

  /*
   * Retrieves a constant.
   */
  Gemstone.get_const = function(parent_scope, item_path) {
    if (item_path == null) {
      item_path = parent_scope;
      parent_scope = Gemstone.Entity;
    }

    var found_item = parent_scope;

    item_path = item_path.split('::');
    while (item_path.length !== 0) {
      found_item = found_item.$get_constant(item_path.shift());
    }

    return found_item;
  };

  /*
   * When a source module is included into a target module, its constants
   * must also be copied to the target.
   */
  Gemstone.transfer_items = function(origin_mod, dest_mod) {
    var origin_items = origin_mod._context.defined_items,
        dest_scope = dest_mod._context,
        dest_items = dest_scope.defined_items;

    for (var i = 0, length = origin_items.length; i < length; i++) {
      dest_items.push(origin_items[i]);
      dest_scope[origin_items[i]] = origin_mod._context[origin_items[i]];
    }
  };

  /*
   * Operation proxies are used to enable `op_missing` functionality in Gemstone.
   * A proxy is a placeholder function that simply invokes `op_missing` on the
   * receiver. If no operation with the given name is actually defined on an
   * entity, then the proxy will be called, which in turn calls `op_missing`.
   *
   * When a Gemstone file is compiled to JavaScript, it includes a call to this
   * function, adding proxies for every operation name in the compiled file.
   * This ensures that `op_missing` will work for any detected operation call.
   *
   * Operation proxies are added to the `BaseEntity` prototype, which all other
   * Gemstone entities inherit from, so all entities should handle missing
   * operations. A proxy is only added if the given property name (operation name)
   * is not already defined.
   *
   * Note: all Gemstone operations have a `$` prefix in JavaScript, so all proxies
   * will also have this prefix (to enhance performance).
   *
   *    Gemstone.install_proxies(["$foo", "$bar", "$baz="]);
   *
   * All proxy functions will have a private `is_proxy_op` property set to true,
   * allowing other internal methods to detect if an operation is merely a proxy.
   * `Kernel#responds_to?` uses this property to determine an operation's presence.
   *
   * @param {Array} proxy_names An array of operation proxies to add.
   */
  Gemstone.install_proxies = function(proxy_names) {
    for (var i = 0, length = proxy_names.length; i < length; i++) {
      var proxy_name = proxy_names[i];

      if (!BaseEntity.prototype[proxy_name]) {
        BaseEntity.prototype[proxy_name] = true;
        add_proxy_for(BaseEntity.prototype, proxy_name);
      }
    }
  };

  /*
   * Actually adds an `op_missing` proxy function to the given prototype for the
   * specified name.
   *
   * @param {Prototype} target_proto The target prototype.
   * @param {String} proxy_name The proxy name to add (e.g., "$foo").
   */
  function add_proxy_for(target_proto, proxy_name) {
    function missing_op_proxy() {
      // Transfer any provided block onto the `op_missing` dispatcher
      this.$op_missing._block_ref = missing_op_proxy._block_ref;

      // Reset block property to null for the next call (prevents false positives)
      missing_op_proxy._block_ref = null;

      // Invoke `op_missing` with correct arguments (remove '$' prefix from operation name)
      return this.$op_missing.apply(this, [proxy_name.slice(1)].concat(arrSlice.call(arguments)));
    }

    missing_op_proxy.is_proxy_op = true;
    target_proto[proxy_name] = missing_op_proxy;
  }

  // Expose for usage by other Gemstone components
  Gemstone.add_proxy_for = add_proxy_for;

  // Constant missing dispatcher
  Gemstone.find_missing_const = function(const_name) {
    return this.base.$missing_const(const_name);
  };

  // Argument count error dispatcher
  Gemstone.arg_count_error = function(actual_args, expected_args, target_obj, op_method) {
    var op_signature = (target_obj._isEntityType ? target_obj._entity_name + '.' : target_obj._entity_type._entity_name + '#') + op_method;
    var error_msg = '[' + op_signature + '] incorrect argument count (' + actual_args + ' provided, ' + expected_args + ' expected)';
    throw Gemstone.ArgCountError.$new(error_msg);
  };

  // Ancestor method dispatcher
  Gemstone.locate_ancestor_dispatcher = function(target_obj, js_ident, current_op, iterator_ref, definer_scope) {
    var dispatch_func;

    if (definer_scope) {
      dispatch_func = target_obj._isEntityType ? definer_scope._ancestor : target_obj._entity_type._prototype_ref;
    }
    else {
      if (target_obj._isEntityType) {
        dispatch_func = target_obj._ancestor;
      }
      else {
        dispatch_func = locate_obj_ancestor_dispatcher(target_obj, js_ident, current_op);