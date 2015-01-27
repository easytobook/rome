/**
 * rome - Customizable date (and time) picker. Opt-in UI, no jQuery!
 * @version v1.2.3
 * @link https://github.com/bevacqua/rome
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.rome=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(_dereq_,module,exports){
module.exports = _dereq_('./src/contra.emitter.js');

},{"./src/contra.emitter.js":3}],3:[function(_dereq_,module,exports){
(function (process){
(function (root, undefined) {
  'use strict';

  var undef = '' + undefined;
  function atoa (a, n) { return Array.prototype.slice.call(a, n); }
  function debounce (fn, args, ctx) { if (!fn) { return; } tick(function run () { fn.apply(ctx || null, args || []); }); }

  // cross-platform ticker
  var si = typeof setImmediate === 'function', tick;
  if (si) {
    tick = function (fn) { setImmediate(fn); };
  } else if (typeof process !== undef && process.nextTick) {
    tick = process.nextTick;
  } else {
    tick = function (fn) { setTimeout(fn, 0); };
  }

  function _emitter (thing, options) {
    var opts = options || {};
    var evt = {};
    if (thing === undefined) { thing = {}; }
    thing.on = function (type, fn) {
      if (!evt[type]) {
        evt[type] = [fn];
      } else {
        evt[type].push(fn);
      }
      return thing;
    };
    thing.once = function (type, fn) {
      fn._once = true; // thing.off(fn) still works!
      thing.on(type, fn);
      return thing;
    };
    thing.off = function (type, fn) {
      var c = arguments.length;
      if (c === 1) {
        delete evt[type];
      } else if (c === 0) {
        evt = {};
      } else {
        var et = evt[type];
        if (!et) { return thing; }
        et.splice(et.indexOf(fn), 1);
      }
      return thing;
    };
    thing.emit = function () {
      var args = atoa(arguments);
      return thing.emitterSnapshot(args.shift()).apply(this, args);
    };
    thing.emitterSnapshot = function (type) {
      var et = (evt[type] || []).slice(0);
      return function () {
        var args = atoa(arguments);
        var ctx = this || thing;
        if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
        evt[type] = et.filter(function emitter (listen) {
          if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
          return !listen._once;
        });
        return thing;
      };
    }
    return thing;
  }

  // cross-platform export
  if (typeof module !== undef && module.exports) {
    module.exports = _emitter;
  } else {
    root.contra = root.contra || {};
    root.contra.emitter = _emitter;
  }
})(this);

}).call(this,_dereq_("FWaASH"))
},{"FWaASH":1}],4:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var debounce = _dereq_('lodash.debounce'),
    isFunction = _dereq_('lodash.isfunction'),
    isObject = _dereq_('lodash.isobject');

/** Used as an internal `_.debounce` options object */
var debounceOptions = {
  'leading': false,
  'maxWait': 0,
  'trailing': false
};

/**
 * Creates a function that, when executed, will only call the `func` function
 * at most once per every `wait` milliseconds. Provide an options object to
 * indicate that `func` should be invoked on the leading and/or trailing edge
 * of the `wait` timeout. Subsequent calls to the throttled function will
 * return the result of the last `func` call.
 *
 * Note: If `leading` and `trailing` options are `true` `func` will be called
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to throttle.
 * @param {number} wait The number of milliseconds to throttle executions to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * var throttled = _.throttle(updatePosition, 100);
 * jQuery(window).on('scroll', throttled);
 *
 * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (!isFunction(func)) {
    throw new TypeError;
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? options.leading : leading;
    trailing = 'trailing' in options ? options.trailing : trailing;
  }
  debounceOptions.leading = leading;
  debounceOptions.maxWait = wait;
  debounceOptions.trailing = trailing;

  return debounce(func, wait, debounceOptions);
}

module.exports = throttle;

},{"lodash.debounce":5,"lodash.isfunction":8,"lodash.isobject":9}],5:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isFunction = _dereq_('lodash.isfunction'),
    isObject = _dereq_('lodash.isobject'),
    now = _dereq_('lodash.now');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeMax = Math.max;

/**
 * Creates a function that will delay the execution of `func` until after
 * `wait` milliseconds have elapsed since the last time it was invoked.
 * Provide an options object to indicate that `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
 * to the debounced function will return the result of the last `func` call.
 *
 * Note: If `leading` and `trailing` options are `true` `func` will be called
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * var lazyLayout = _.debounce(calculateLayout, 150);
 * jQuery(window).on('resize', lazyLayout);
 *
 * // execute `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * });
 *
 * // ensure `batchLog` is executed once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * source.addEventListener('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }, false);
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (!isFunction(func)) {
    throw new TypeError;
  }
  wait = nativeMax(0, wait) || 0;
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
    trailing = 'trailing' in options ? options.trailing : trailing;
  }
  var delayed = function() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  };

  var maxDelayed = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || (maxWait !== wait)) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  };

  return function() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  };
}

module.exports = debounce;

},{"lodash.isfunction":8,"lodash.isobject":9,"lodash.now":6}],6:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = _dereq_('lodash._isnative');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var stamp = _.now();
 * _.defer(function() { console.log(_.now() - stamp); });
 * // => logs the number of milliseconds it took for the deferred function to be called
 */
var now = isNative(now = Date.now) && now || function() {
  return new Date().getTime();
};

module.exports = now;

},{"lodash._isnative":7}],7:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],8:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],9:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = _dereq_('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":10}],10:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],11:[function(_dereq_,module,exports){
var now = _dereq_('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":12}],12:[function(_dereq_,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,_dereq_("FWaASH"))
},{"FWaASH":1}],13:[function(_dereq_,module,exports){
'use strict';

var isInput = _dereq_('./isInput');
var bindings = {};

function has (source, target) {
  var binding = bindings[source.id];
  return binding && binding[target.id];
}

function insert (source, target) {
  var binding = bindings[source.id];
  if (!binding) {
    binding = bindings[source.id] = {};
  }
  var invalidate = invalidator(target);
  binding[target.id] = invalidate;
  source.on('data', invalidate);
  source.on('destroyed', remove.bind(null, source, target));
}

function remove (source, target) {
  var binding = bindings[source.id];
  if (!binding) {
    return;
  }
  var invalidate = binding[target.id];
  source.off('data', invalidate);
  delete binding[target.id];
}

function invalidator (target) {
  return function invalidate () {
    target.refresh();
  };
}

function add (source, target) {
  if (isInput(target.associated) || has(source, target)) {
    return;
  }
  insert(source, target);
}

module.exports = {
  add: add,
  remove: remove
};

},{"./isInput":24}],14:[function(_dereq_,module,exports){
'use strict';

var emitter = _dereq_('contra.emitter');
var raf = _dereq_('raf');
var dom = _dereq_('./dom');
var text = _dereq_('./text');
var parse = _dereq_('./parse');
var clone = _dereq_('./clone');
var defaults = _dereq_('./defaults');
var momentum = _dereq_('./momentum');
var classes = _dereq_('./classes');
var events = _dereq_('./events');
var noop = _dereq_('./noop');
var no;

function calendar (calendarOptions) {
  var o;
  var api = emitter({});
  var ref;
  var refCal;
  var container;
  var rendered = false;
  var selectedMonth;
  var selectedYear;
  var intervalDates = calendarOptions.intervalDates || [];

  // date variables
  var monthOffsetAttribute = 'data-rome-offset';
  var weekdays;
  var weekdayCount;
  var calendarMonths = [];
  var lastYear;
  var lastMonth;
  var lastDay;
  var lastDayElement;
  var datewrapper;
  var back;
  var next;

  // time variables
  var secondsInDay = 60 * 60 * 24;
  var time;
  var timelist;

  destroy(true);

  raf(function () {
    init();
  });

  function napi () { return api; }

  function init (initOptions) {
    o = defaults(initOptions || calendarOptions, api);
    if (!container) { container = dom({ className: o.styles.container }); }
    weekdays = o.weekdayFormat;
    weekdayCount = weekdays.length;
    lastMonth = no;
    lastYear = no;
    lastDay = no;
    lastDayElement = no;
    o.appendTo.appendChild(container);

    removeChildren(container);
    rendered = false;
    ref = o.initialValue ? o.initialValue : momentum.moment();
    if (o.initialValue){
      ref = o.initialValue;
      storeDate();
    } else {
      ref = momentum.moment();
    }
    refCal = ref.clone();

    api.container = container;
    api.destroyed = false;
    api.destroy = destroy.bind(api, false);
    api.emitValues = emitValues;
    api.getDate = getDate;
    api.getDateString = getDateString;
    api.getMoment = getMoment;
    api.hide = hide;
    api.options = changeOptions;
    api.options.reset = resetOptions;
    api.refresh = refresh;
    api.restore = napi;
    api.setValue = setValue;
    api.show = show;
    api.highlight = highlight;

    hideCalendar();
    eventListening();

    api.emit('ready', clone(o));

    return api;
  }

  function destroy (silent) {
    if (container) {
      container.parentNode.removeChild(container);
    }

    if (o) {
      eventListening(true);
    }

    api.destroyed = true;
    api.destroy = napi;
    api.emitValues = napi;
    api.getDate = noop;
    api.getDateString = noop;
    api.getMoment = noop;
    api.hide = napi;
    api.options = napi;
    api.options.reset = napi;
    api.refresh = napi;
    api.restore = init;
    api.setValue = napi;
    api.show = napi;
    api.highlight = napi;

    if (silent !== true) {
      api.emit('destroyed');
    }
    api.off();

    return api;
  }

  function eventListening (remove) {
    var op = remove ? 'remove' : 'add';
    if (o.autoHideOnBlur) { events[op](document, 'focusin', hideOnBlur); }
    if (o.autoHideOnClick) { events[op](document, 'click', hideOnClick); }
  }

  function changeOptions (options) {
    if (arguments.length === 0) {
      return clone(o);
    }
    destroy();
    init(options);
    return api;
  }

  function resetOptions () {
    return changeOptions({});
  }

  function render () {
    if (rendered) {
      return;
    }
    rendered = true;
    renderDates();
    renderTime();
    api.emit('render');
  }

  function renderDates () {
    if (!o.date) {
      return;
    }
    var i;
    calendarMonths = [];

    datewrapper = dom({ className: o.styles.date, parent: container });

    for (i = 0; i < o.monthsInCalendar; i++) {
      renderMonth(i);
    }

    events.add(back, 'click', subtractMonth);
    events.add(next, 'click', addMonth);
    events.add(datewrapper, 'click', pickDay);

    function renderMonth (i) {
      var month = dom({ className: o.styles.month, parent: datewrapper });
      if (i === 0) {
        back = dom({ type: 'span', className: o.styles.back, parent: month, innerHTML: o.html.back });
      }
      if (i === o.monthsInCalendar -1) {
        next = dom({ type: 'span', className: o.styles.next, parent: month, innerHTML: o.html.next });
      }
      var label = dom({ className: o.styles.monthLabel, parent: month });
      var date = dom({ type: 'table', className: o.styles.dayTable, parent: month });
      var datehead = dom({ type: 'thead', className: o.styles.dayHead, parent: date });
      var dateheadrow = dom({ type: 'tr', className: o.styles.dayRow, parent: datehead });
      var datebody = dom({ type: 'tbody', className: o.styles.dayBody, parent: date });
      var j;

      for (j = 0; j < weekdayCount; j++) {
        dom({ type: 'th', className: o.styles.dayHeadElem, parent: dateheadrow, text: weekdays[weekday(j)] });
      }

      datebody.setAttribute(monthOffsetAttribute, i);
      calendarMonths.push({
        label: label,
        body: datebody
      });
    }
  }

  function renderTime () {
    if (!o.time || !o.timeInterval) {
      return;
    }
    var timewrapper = dom({ className: o.styles.time, parent: container });
    time = dom({ className: o.styles.selectedTime, parent: timewrapper, text: ref.format(o.timeFormat) });
    events.add(time, 'click', toggleTimeList);
    timelist = dom({ className: o.styles.timeList, parent: timewrapper });
    events.add(timelist, 'click', pickTime);
    var next = momentum.moment('00:00:00', 'HH:mm:ss');
    var latest = next.clone().add(1, 'days');
    while (next.isBefore(latest)) {
      dom({ className: o.styles.timeOption, parent: timelist, text: next.format(o.timeFormat) });
      next.add(o.timeInterval, 'seconds');
    }
  }

  function weekday (index, backwards) {
    var factor = backwards ? -1 : 1;
    var offset = index + o.weekStart * factor;
    if (offset >= weekdayCount || offset < 0) {
      offset += weekdayCount * -factor;
    }
    return offset;
  }

  function displayValidTimesOnly () {
    if (!o.time || !rendered) {
      return;
    }
    var times = timelist.children;
    var length = times.length;
    var date;
    var time;
    var item;
    var i;
    for (i = 0; i < length; i++) {
      item = times[i];
      time = momentum.moment(text(item), o.timeFormat);
      date = setTime(ref.clone(), time);
      item.style.display = isInRange(date, false, o.timeValidator) ? 'block' : 'none';
    }
  }

  function toggleTimeList (show) {
    var display = typeof show === 'boolean' ? show : timelist.style.display === 'none';
    if (display) {
      showTimeList();
    } else {
      hideTimeList();
    }
  }

  function showTimeList () { if (timelist) { timelist.style.display = 'block'; } }
  function hideTimeList () { if (timelist) { timelist.style.display = 'none'; } }
  function showCalendar () {
    classes.remove(container, o.styles.hiddenContainerClass);
    classes.add(container, o.styles.visibleContainerClass);
    api.emit('show');
  }
  function hideCalendar () {
    classes.add(container, o.styles.hiddenContainerClass);
    classes.remove(container, o.styles.visibleContainerClass);
    api.emit('hide'); }

  function show () {
    render();
    refresh();
    toggleTimeList(!o.date);
    showCalendar();
    return api;
  }

  function hide () {
    hideTimeList();
    raf(hideCalendar);
    return api;
  }

  function highlight (dates) {
    intervalDates = dates;
    update(true);
    return api;
  }

  function hideConditionally () {
    hideTimeList();

    var pos = classes.contains(container, o.styles.positioned);
    if (pos) {
      raf(hideCalendar);
    }
    return api;
  }

  function calendarEventTarget (e) {
    var target = e.target;
    if (target === o.trigger || isDescendant(o.trigger, target) || isDescendant(container, target)) {
      return true;
    }
    if (target === api.associated) {
      return true;
    }
  }

  function hideOnBlur (e) {
    if (calendarEventTarget(e)) {
      return;
    }
    hideConditionally();
  }

  function hideOnClick (e) {
    if (calendarEventTarget(e)) {
      return;
    }
    hideConditionally();
  }

  function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
     }
     return false;
  }

  function subtractMonth () { changeMonth('subtract'); }
  function addMonth () { changeMonth('add'); }
  function changeMonth (op) {
    var bound;
    var direction = op === 'add' ? -1 : 1;
    var offset = o.monthsInCalendar + direction * getMonthOffset(lastDayElement);
    refCal[op]('months', offset);
    bound = inRange(refCal.clone());
    ref = bound || ref;
    if (bound) { refCal = bound.clone(); }
    update(!o.autoSelectDate);
  }

  function update (silent) {
    updateCalendar();
    updateTime();
    if (silent !== true) { emitValues(); }
    displayValidTimesOnly();
  }

  function updateCalendar () {
    if (!o.date || !rendered) {
      return;
    }
    var y = refCal.year();
    var m = refCal.month();
    var d = refCal.date();
    if (d === lastDay && m === lastMonth && y === lastYear) {
      return;
    }
    var canStay = isDisplayed();
    lastDay = refCal.date();
    lastMonth = refCal.month();
    lastYear = refCal.year();
    if (canStay) { updateCalendarSelection(); return; }
    calendarMonths.forEach(updateMonth);
    renderAllDays();

    function updateMonth (month, i) {
      var offsetCal = refCal.clone().add(i, 'months');
      text(month.label, offsetCal.format(o.monthFormat));
      removeChildren(month.body);
    }
  }

  function updateCalendarSelection () {
    var day = refCal.date() - 1;
    // selectDayElement(false);
    calendarMonths.forEach(function (cal) {
      var days;
      if (sameCalendarMonth(cal.date, refCal)) {
        days = cast(cal.body.children).map(aggregate);
        days = Array.prototype.concat.apply([], days).filter(inside);
        // selectDayElement(days[day]);
      }
    });

    function cast (like) {
      var dest = [];
      var i;
      for (i = 0; i < like.length; i++) {
        dest.push(like[i]);
      }
      return dest;
    }

    function aggregate (child) {
      return cast(child.children);
    }

    function inside (child) {
      return !classes.contains(child, o.styles.dayPrevMonth) &&
             !classes.contains(child, o.styles.dayNextMonth);
    }
  }

  function isDisplayed () {
    return calendarMonths.some(matches);

    function matches (cal) {
      if (!lastYear) { return false; }
      return sameCalendarMonth(cal.date, refCal);
    }
  }

  function sameCalendarMonth (left, right) {
    return left && right && left.year() === right.year() && left.month() === right.month();
  }

  function updateTime () {
    if (!o.time || !rendered) {
      return;
    }
    text(time, ref.format(o.timeFormat));
  }

  function emitValues () {
    storeDate();
    api.emit('data', getDateString());
    api.emit('year', ref.year());
    api.emit('month', ref.month());
    api.emit('day', ref.day());
    api.emit('time', ref.format(o.timeFormat));

    return api;
  }

  function storeDate () {
    selectedMonth = ref.month();
    selectedYear = ref.year();
  }

  function refresh () {
    lastYear = false;
    lastMonth = false;
    lastDay = false;
    update(true);
    return api;
  }

  function setValue (value) {
    var date = parse(value, o.inputFormat);
    if (date === null) {
      return;
    }
    ref = inRange(date) || ref;
    refCal = ref.clone();
    update(true);

    return api;
  }

  function removeChildren (elem, self) {
    while (elem && elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
    if (self === true) {
      elem.parentNode.removeChild(elem);
    }
  }

  function renderAllDays () {
    var i;
    for (i = 0; i < o.monthsInCalendar; i++) {
      renderDays(i);
    }
  }

  function renderDays (offset) {
    var month = calendarMonths[offset];
    var offsetCal = refCal.clone().add(offset, 'months');
    var total = offsetCal.daysInMonth();
    var current = offsetCal.month() !== ref.month() ? -1 : ref.date(); // -1 : 1..31
    var first = offsetCal.clone().date(1);
    var firstDay = weekday(first.day(), true); // 0..6
    var tr = dom({ type: 'tr', className: o.styles.dayRow, parent: month.body });
    var prevMonth = hiddenWhen(offset !== 0, [o.styles.dayBodyElem, o.styles.dayPrevMonth]);
    var nextMonth = hiddenWhen(offset !== o.monthsInCalendar - 1, [o.styles.dayBodyElem, o.styles.dayNextMonth]);
    var disabled = o.styles.dayDisabled;
    var lastDay;

    part({
      base: first.clone().subtract(firstDay, 'days'),
      length: firstDay,
      cell: prevMonth
    });

    part({
      base: first.clone(),
      length: total,
      cell: [o.styles.dayBodyElem],
      selectable: true
    });

    lastDay = first.clone().add(total, 'days');

    part({
      base: lastDay,
      length: weekdayCount - tr.children.length,
      cell: nextMonth
    });

    back.disabled = !isInRange(first, true);
    next.disabled = !isInRange(lastDay, true);
    month.date = offsetCal.clone();

    function part (data) {
      var i, day, node;
      for (i = 0; i < data.length; i++) {
        if (tr.children.length === weekdayCount) {
          tr = dom({ type: 'tr', className: o.styles.dayRow, parent: month.body });
        }
        day = data.base.clone().add(i, 'days');
        node = dom({
          type: 'td',
          parent: tr,
          text: day.format(o.dayFormat),
          className: validationTest(day, data.cell.join(' ').split(' ')).join(' ')
        });
      }
    }

    function validationTest (day, cell) {
      if (intervalDates[0] !== null && intervalDates[1] !== null ){
        day = day.startOf('day');
        if (day.isAfter(intervalDates[0]) && day.isBefore(intervalDates[1])) {
          cell.push('rd-day-selected');
        }
        if (day.diff(intervalDates[0], 'days') === 0  || intervalDates[1].diff(day, 'days') === 0) {
          cell.push('rd-day-selected');
        }
      }
      if (!isInRange(day, true, o.dateValidator)) { cell.push(disabled); }
      return cell;
    }

    function hiddenWhen (value, cell) {
      if (value) { cell.push(o.styles.dayConcealed); }
      return cell;
    }
  }

  function isInRange (date, allday, validator) {
    var min = !o.min ? false : (allday ? o.min.clone().startOf('day') : o.min);
    var max = !o.max ? false : (allday ? o.max.clone().endOf('day') : o.max);
    if (min && date.isBefore(min)) {
      return false;
    }
    if (max && date.isAfter(max)) {
      return false;
    }
    var valid = (validator || Function.prototype).call(api, date.toDate());
    return valid !== false;
  }

  function inRange (date) {
    if (o.min && date.isBefore(o.min)) {
      return inRange(o.min.clone());
    } else if (o.max && date.isAfter(o.max)) {
      return inRange(o.max.clone());
    }
    var value = date.clone().subtract(1, 'days');
    if (validateTowards(value, date, 'add')) {
      return inTimeRange(value);
    }
    value = date.clone();
    if (validateTowards(value, date, 'subtract')) {
      return inTimeRange(value);
    }
  }

  function inTimeRange (value) {
    var copy = value.clone().subtract(o.timeInterval, 'seconds');
    var times = Math.ceil(secondsInDay / o.timeInterval);
    var i;
    for (i = 0; i < times; i++) {
      copy.add(o.timeInterval, 'seconds');
      if (copy.date() > value.date()) {
        copy.subtract(1, 'days');
      }
      if (o.timeValidator.call(api, copy.toDate()) !== false) {
        return copy;
      }
    }
  }

  function validateTowards (value, date, op) {
    var valid = false;
    while (valid === false) {
      value[op](1, 'days');
      if (value.month() !== date.month()) {
        break;
      }
      valid = o.dateValidator.call(api, value.toDate());
    }
    return valid !== false;
  }

  function pickDay (e) {
    var target = e.target;
    if (classes.contains(target, o.styles.dayDisabled) || !classes.contains(target, o.styles.dayBodyElem)) {
      return;
    }
    var day = parseInt(text(target), 10);
    var prev = classes.contains(target, o.styles.dayPrevMonth);
    var next = classes.contains(target, o.styles.dayNextMonth);
    var offset = getMonthOffset(target) - getMonthOffset(lastDayElement);
    ref.add(offset, 'months');
    if (prev || next) {
      ref.add(prev ? -1 : 1, 'months');
    }
    // selectDayElement(target);
    ref.date(day); // must run after setting the month
    setTime(ref, inRange(ref) || ref);
    refCal = ref.clone();
    if (o.autoClose) { hideConditionally(); }
    update();
  }

  function selectDayElement (node) {
    if (node) {
      classes.add(node, o.styles.selectedDay);
    }
  }

  function getMonthOffset (elem) {
    var offset;
    while (elem && elem.getAttribute) {
      offset = elem.getAttribute(monthOffsetAttribute);
      if (typeof offset === 'string') {
        return parseInt(offset, 10);
      }
      elem = elem.parentNode;
    }
    return 0;
  }

  function setTime (to, from) {
    to.hour(from.hour()).minute(from.minute()).second(from.second());
    return to;
  }

  function pickTime (e) {
    var target = e.target;
    if (!classes.contains(target, o.styles.timeOption)) {
      return;
    }
    var value = momentum.moment(text(target), o.timeFormat);
    setTime(ref, value);
    refCal = ref.clone();
    emitValues();
    updateTime();
    if (!o.date && o.autoClose) {
      hideConditionally();
    } else {
      hideTimeList();
    }
  }

  function getDate () {
    return ref.toDate();
  }

  function getDateString (format) {
    return ref.format(format || o.inputFormat);
  }

  function getMoment () {
    return ref.clone();
  }

  return api;
}

module.exports = calendar;

},{"./classes":15,"./clone":16,"./defaults":18,"./dom":19,"./events":20,"./momentum":25,"./noop":26,"./parse":27,"./text":40,"contra.emitter":2,"raf":11}],15:[function(_dereq_,module,exports){
'use strict';

var trim = /^\s+|\s+$/g;
var whitespace = /\s+/;

function classes (node) {
  if (typeof node.className == 'string'){
    return node.className.replace(trim, '').split(whitespace);
  }
}

function set (node, value) {
  node.className = value.join(' ');
}

function add (node, value) {
  var values = remove(node, value);
  values.push(value);
  set(node, values);
}

function remove (node, value) {
  var values = classes(node);
  var i = values.indexOf(value);
  if (i !== -1) {
    values.splice(i, 1);
    set(node, values);
  }
  return values;
}

function contains (node, value) {
  if (!classes(node)) { return false; }
  return classes(node).indexOf(value) !== -1;
}

module.exports = {
  add: add,
  remove: remove,
  contains: contains
};

},{}],16:[function(_dereq_,module,exports){
'use strict';

var momentum = _dereq_('./momentum');

// naïve implementation, specifically meant to clone `options` objects
function clone (thing) {
  var copy = {};
  var value;

  for (var key in thing) {
    value = thing[key];

    if (!value) {
      copy[key] = value;
    } else if (momentum.isMoment(value)) {
      copy[key] = value.clone();
    } else if (value._isStylesConfiguration) {
      copy[key] = clone(value);
    } else {
      copy[key] = value;
    }
  }

  return copy;
}

module.exports = clone;

},{"./momentum":25}],17:[function(_dereq_,module,exports){
'use strict';

var index = _dereq_('./index');
var input = _dereq_('./input');
var inline = _dereq_('./inline');
var isInput = _dereq_('./isInput');

function core (elem, options) {
  var cal;
  var existing = index.find(elem);
  if (existing) {
    return existing;
  }

  if (isInput(elem)) {
    cal = input(elem, options);
  } else {
    cal = inline(elem, options);
  }
  cal.associated = elem;
  index.assign(elem, cal);

  return cal;
}

module.exports = core;

},{"./index":21,"./inline":22,"./input":23,"./isInput":24}],18:[function(_dereq_,module,exports){
'use strict';

var parse = _dereq_('./parse');
var isInput = _dereq_('./isInput');
var momentum = _dereq_('./momentum');

function defaults (options, cal) {
  var temp;
  var no;
  var o = options || {};
  if (o.autoHideOnClick === no) { o.autoHideOnClick = true; }
  if (o.autoHideOnBlur === no) { o.autoHideOnBlur = true; }
  if (o.autoClose === no) { o.autoClose = true; }
  if (o.autoSelectDate === no) { o.autoSelectDate = true; }
  if (o.appendTo === no) { o.appendTo = document.body; }
  if (o.appendTo === 'parent') {
    if (isInput(cal.associated)) {
      o.appendTo = cal.associated.parentNode;
    } else {
      throw new Error('Inline calendars must be appended to a parent node explicitly.');
    }
  }
  if (o.invalidate === no) { o.invalidate = true; }
  if (o.required === no) { o.required = false; }
  if (o.date === no) { o.date = true; }
  if (o.time === no) { o.time = true; }
  if (o.date === false && o.time === false) { throw new Error('At least one of `date` or `time` must be `true`.'); }
  if (o.inputFormat === no) {
    if (o.date && o.time) {
      o.inputFormat = 'YYYY-MM-DD HH:mm';
    } else if (o.date) {
      o.inputFormat = 'YYYY-MM-DD';
    } else {
      o.inputFormat = 'HH:mm';
    }
  }
  if (o.initialValue === no) {
    o.initialValue = null;
  } else {
    o.initialValue = parse(o.initialValue, o.inputFormat);
  }
  if (o.min === no) { o.min = null; } else { o.min = parse(o.min, o.inputFormat); }
  if (o.max === no) { o.max = null; } else { o.max = parse(o.max, o.inputFormat); }
  if (o.timeInterval === no) { o.timeInterval = 60 * 30; } // 30 minutes by default
  if (o.min && o.max) {
    if (o.max.isBefore(o.min)) {
      temp = o.max;
      o.max = o.min;
      o.min = temp;
    }
    if (o.date === true) {
      if (o.max.clone().subtract(1, 'days').isBefore(o.min)) {
        throw new Error('`max` must be at least one day after `min`');
      }
    } else if (o.timeInterval * 1000 - o.min % (o.timeInterval * 1000) > o.max - o.min) {
      throw new Error('`min` to `max` range must allow for at least one time option that matches `timeInterval`');
    }
  }
  if (o.dateValidator === no) { o.dateValidator = Function.prototype; }
  if (o.timeValidator === no) { o.timeValidator = Function.prototype; }
  if (o.timeFormat === no) { o.timeFormat = 'HH:mm'; }
  if (o.weekStart === no) { o.weekStart = momentum.moment().weekday(0).day(); }
  if (o.weekdayFormat === no) { o.weekdayFormat = 'min'; }
  if (o.weekdayFormat === 'long') {
    o.weekdayFormat = momentum.moment.weekdays();
  } else if (o.weekdayFormat === 'short') {
    o.weekdayFormat = momentum.moment.weekdaysShort();
  } else if (o.weekdayFormat === 'min') {
    o.weekdayFormat = momentum.moment.weekdaysMin();
  } else {
    throw new Error('`weekdays` must be `min`, `short`, or `long`');
  }
  if (o.monthsInCalendar === no) { o.monthsInCalendar = 1; }
  if (o.monthFormat === no) { o.monthFormat = 'MMMM YYYY'; }
  if (o.dayFormat === no) { o.dayFormat = 'DD'; }
  if (o.styles === no) { o.styles = {}; }

  o.styles._isStylesConfiguration = true;

  var styl = o.styles;
  if (styl.back === no) { styl.back = 'rd-back'; }
  if (styl.container === no) { styl.container = 'rd-container'; }
  if (styl.positioned === no) { styl.positioned = 'rd-container-attachment'; }
  if (styl.date === no) { styl.date = 'rd-date'; }
  if (styl.dayBody === no) { styl.dayBody = 'rd-days-body'; }
  if (styl.dayBodyElem === no) { styl.dayBodyElem = 'rd-day-body'; }
  if (styl.dayPrevMonth === no) { styl.dayPrevMonth = 'rd-day-prev-month'; }
  if (styl.dayNextMonth === no) { styl.dayNextMonth = 'rd-day-next-month'; }
  if (styl.dayDisabled === no) { styl.dayDisabled = 'rd-day-disabled'; }
  if (styl.dayConcealed === no) { styl.dayConcealed = 'rd-day-concealed'; }
  if (styl.dayHead === no) { styl.dayHead = 'rd-days-head'; }
  if (styl.dayHeadElem === no) { styl.dayHeadElem = 'rd-day-head'; }
  if (styl.dayRow === no) { styl.dayRow = 'rd-days-row'; }
  if (styl.dayTable === no) { styl.dayTable = 'rd-days'; }
  if (styl.month === no) { styl.month = 'rd-month'; }
  if (styl.monthLabel === no) { styl.monthLabel = 'rd-month-label'; }
  if (styl.next === no) { styl.next = 'rd-next'; }
  if (styl.selectedDay === no) { styl.selectedDay = 'rd-day-selected'; }
  if (styl.selectedTime === no) { styl.selectedTime = 'rd-time-selected'; }
  if (styl.time === no) { styl.time = 'rd-time'; }
  if (styl.timeList === no) { styl.timeList = 'rd-time-list'; }
  if (styl.timeOption === no) { styl.timeOption = 'rd-time-option'; }

  return o;
}

module.exports = defaults;

},{"./isInput":24,"./momentum":25,"./parse":27}],19:[function(_dereq_,module,exports){
'use strict';

function dom (options) {
  var o = options || {};
  if (!o.type) { o.type = 'div'; }
  var elem = document.createElement(o.type);
  if (o.className) { elem.className = o.className; }
  if (o.text) { elem.innerText = elem.textContent = o.text; }
  if (o.innerHTML) { elem.innerHTML = o.innerHTML; }
  if (o.attributes) {
    Object.keys(o.attributes).forEach(function(key) {
      elem.setAttribute(key, o.attributes[key]);
    });
  }
  if (o.parent) { o.parent.appendChild(elem); }
  return elem;
}

module.exports = dom;

},{}],20:[function(_dereq_,module,exports){
'use strict';

var addEvent = addEventEasy;
var removeEvent = removeEventEasy;

if (!window.addEventListener) {
  addEvent = addEventHard;
}

if (!window.removeEventListener) {
  removeEvent = removeEventHard;
}

function addEventEasy (element, evt, fn) {
  return element.addEventListener(evt, fn);
}

function addEventHard (element, evt, fn) {
  return element.attachEvent('on' + evt, function (ae) {
    var e = ae || window.event;
    e.target = e.target || e.srcElement;
    e.preventDefault  = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    fn.call(element, e);
  });
}

function removeEventEasy (element, evt, fn) {
  return element.removeEventListener(evt, fn);
}

function removeEventHard (element, evt, fn) {
  return element.detachEvent('on' + evt, fn);
}

module.exports = {
  add: addEvent,
  remove: removeEvent
};

},{}],21:[function(_dereq_,module,exports){
'use strict';
var no;
var ikey = 'data-rome-id';
var index = [];

function find (thing) { // can be a DOM element or a number
  if (typeof thing !== 'number' && thing && thing.getAttribute) {
    return find(thing.getAttribute(ikey));
  }
  var existing = index[thing];
  if (existing !== no) {
    return existing;
  }
  return null;
}

function assign (elem, instance) {
  elem.setAttribute(ikey, instance.id = index.push(instance) - 1);
}

module.exports = {
  find: find,
  assign: assign
};

},{}],22:[function(_dereq_,module,exports){
'use strict';

var raf = _dereq_('raf');
var calendar = _dereq_('./calendar');

function inline (elem, calendarOptions) {
  var o = calendarOptions || {};

  o.appendTo = elem;

  var api = calendar(o)
    .on('ready', ready);

  function ready () {
    raf(api.show);
  }

  return api;
}

module.exports = inline;

},{"./calendar":14,"raf":11}],23:[function(_dereq_,module,exports){
'use strict';

var throttle = _dereq_('lodash.throttle');
var raf = _dereq_('raf');
var clone = _dereq_('./clone');
var calendar = _dereq_('./calendar');
var momentum = _dereq_('./momentum');
var classes = _dereq_('./classes');
var events = _dereq_('./events');

function inputCalendar (input, calendarOptions) {
  var o;
  var api = calendar(calendarOptions);
  var throttledTakeInput = throttle(takeInput, 50);
  var throttledPosition = throttle(position, 30);
  var ignoreInvalidation;
  var ignoreShow;

  bindEvents();

  function init (superOptions) {
    o = clone(superOptions);

    classes.add(api.container, o.styles.positioned);
    events.add(api.container, 'mousedown', containerMouseDown);
    events.add(api.container, 'click', containerClick);

    api.getDate = unrequire(api.getDate);
    api.getDateString = unrequire(api.getDateString);
    api.getMoment = unrequire(api.getMoment);

    if (o.initialValue) {
      input.value = o.initialValue.format(o.inputFormat);
    }

    api.on('data', updateInput);
    api.on('show', throttledPosition);

    eventListening();
    throttledTakeInput();
  }

  function destroy () {
    eventListening(true);
    raf(bindEvents);
  }

  function bindEvents () {
    api.once('ready', init);
    api.once('destroyed', destroy);
  }

  function eventListening (remove) {
    var op = remove ? 'remove' : 'add';
    events[op](input, 'click', show);
    events[op](input, 'touchend', show);
    events[op](input, 'focusin', show);
    events[op](input, 'change', throttledTakeInput);
    events[op](input, 'keypress', throttledTakeInput);
    events[op](input, 'keydown', throttledTakeInput);
    events[op](input, 'input', throttledTakeInput);
    if (o.invalidate) { events[op](input, 'blur', invalidateInput); }
    events[op](window, 'resize', throttledPosition);
  }

  function containerClick () {
    ignoreShow = true;
    input.focus();
    ignoreShow = false;
  }

  function containerMouseDown () {
    ignoreInvalidation = true;
    raf(unignore);

    function unignore () {
      ignoreInvalidation = false;
    }
  }

  function invalidateInput () {
    if (!ignoreInvalidation && !isEmpty() && o.autoSelectDate) {
      api.emitValues();
    }
  }

  function show () {
    if (ignoreShow) {
      return;
    }
    api.show();
  }

  function position () {
    var bounds = input.getBoundingClientRect();
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    api.container.style.top  = bounds.top + scrollTop + input.offsetHeight + 'px';
    api.container.style.left = bounds.left + 'px';
  }

  function takeInput () {
    var value = input.value.trim();
    if (isEmpty()) {
      return;
    }
    var date = momentum.moment(value, o.inputFormat);
    api.setValue(date);
  }

  function updateInput (data) {
    input.value = data;
  }

  function isEmpty () {
    return o.required === false && input.value.trim() === '';
  }

  function unrequire (fn) {
    return function maybe () {
      return isEmpty() ? null : fn.apply(this, arguments);
    };
  }

  return api;
}

module.exports = inputCalendar;

},{"./calendar":14,"./classes":15,"./clone":16,"./events":20,"./momentum":25,"lodash.throttle":4,"raf":11}],24:[function(_dereq_,module,exports){
'use strict';

function isInput (elem) {
  return elem && elem.nodeName && elem.nodeName.toLowerCase() === 'input';
}

module.exports = isInput;

},{}],25:[function(_dereq_,module,exports){
'use strict';

function isMoment (value) {
  return value && Object.prototype.hasOwnProperty.call(value, '_isAMomentObject');
}

var api = {
  moment: null,
  isMoment: isMoment
};

module.exports = api;

},{}],26:[function(_dereq_,module,exports){
'use strict';

function noop () {}

module.exports = noop;

},{}],27:[function(_dereq_,module,exports){
'use strict';

var momentum = _dereq_('./momentum');

function raw (date, format) {
  if (typeof date === 'string') {
    return momentum.moment(date, format);
  }
  if (Object.prototype.toString.call(date) === '[object Date]') {
    return momentum.moment(date);
  }
  if (momentum.isMoment(date)) {
    return date.clone();
  }
}

function parse (date, format) {
  var m = raw(date, typeof format === 'string' ? format : null);
  return m && m.isValid() ? m : null;
}

module.exports = parse;

},{"./momentum":25}],28:[function(_dereq_,module,exports){
if (!Array.prototype.every) {
  Array.prototype.every = function (fn, ctx) {
    var context, i;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var source = Object(this);
    var len = source.length >>> 0;

    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function');
    }

    if (arguments.length > 1) {
      context = ctx;
    }

    i = 0;

    while (i < len) {
      if (i in source) {
        var test = fn.call(context, source[i], i, source);
        if (!test) {
          return false;
        }
      }
      i++;
    }
    return true;
  };
}

},{}],29:[function(_dereq_,module,exports){
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fn, ctx) {
    var f = [];
    this.forEach(function (v, i, t) {
      if (fn.call(ctx, v, i, t)) { f.push(v); }
    }, ctx);
    return f;
  };
}

},{}],30:[function(_dereq_,module,exports){
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fn, ctx) {
    if (this === void 0 || this === null || typeof fn !== 'function') {
      throw new TypeError();
    }
    var t = this;
    var len = t.length;
    for (var i = 0; i < len; i++) {
      if (i in t) { fn.call(ctx, t[i], i, t); }
    }
  };
}

},{}],31:[function(_dereq_,module,exports){
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (what, start) {
    if (this === undefined || this === null) {
      throw new TypeError();
    }
    var length = this.length;
    start = +start || 0;
    if (Math.abs(start) === Infinity) {
      start = 0;
    } else if (start < 0) {
      start += length;
      if (start < 0) { start = 0; }
    }
    for (; start < length; start++) {
      if (this[start] === what) {
        return start;
      }
    }
    return -1;
  };
}

},{}],32:[function(_dereq_,module,exports){
Array.isArray || (Array.isArray = function (a) {
  return '' + a !== a && Object.prototype.toString.call(a) === '[object Array]';
});

},{}],33:[function(_dereq_,module,exports){
if (!Array.prototype.map) {
  Array.prototype.map = function (fn, ctx) {
    var context, result, i;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var source = Object(this);
    var len = source.length >>> 0;

    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function');
    }

    if (arguments.length > 1) {
      context = ctx;
    }

    result = new Array(len);
    i = 0;

    while (i < len) {
      if (i in source) {
        result[i] = fn.call(context, source[i], i, source);
      }
      i++;
    }
    return result;
  };
}

},{}],34:[function(_dereq_,module,exports){
if (!Array.prototype.some) {
  Array.prototype.some = function (fn, ctx) {
    var context, i;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var source = Object(this);
    var len = source.length >>> 0;

    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function');
    }

    if (arguments.length > 1) {
      context = ctx;
    }

    i = 0;

    while (i < len) {
      if (i in source) {
        var test = fn.call(context, source[i], i, source);
        if (test) {
          return true;
        }
      }
      i++;
    }
    return false;
  };
}

},{}],35:[function(_dereq_,module,exports){
if (!Function.prototype.bind) {
  Function.prototype.bind = function (context) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    var curried = Array.prototype.slice.call(arguments, 1);
    var original = this;
    var NoOp = function () {};
    var bound = function () {
      var ctx = this instanceof NoOp && context ? this : context;
      var args = curried.concat(Array.prototype.slice.call(arguments));
      return original.apply(ctx, args);
    };
    NoOp.prototype = this.prototype;
    bound.prototype = new NoOp();
    return bound;
  };
}

},{}],36:[function(_dereq_,module,exports){
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
},{}],37:[function(_dereq_,module,exports){
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

},{}],38:[function(_dereq_,module,exports){
'use strict';

// these are only required for IE < 9
// maybe move to IE-specific distro?
_dereq_('./polyfills/function.bind');
_dereq_('./polyfills/array.foreach');
_dereq_('./polyfills/array.map');
_dereq_('./polyfills/array.filter');
_dereq_('./polyfills/array.isarray');
_dereq_('./polyfills/array.indexof');
_dereq_('./polyfills/array.every');
_dereq_('./polyfills/array.some');
_dereq_('./polyfills/string.trim');
_dereq_('./polyfills/object.keys');

var core = _dereq_('./core');
var index = _dereq_('./index');
var use = _dereq_('./use');

core.use = use.bind(core);
core.find = index.find;
core.val = _dereq_('./validators');

module.exports = core;

},{"./core":17,"./index":21,"./polyfills/array.every":28,"./polyfills/array.filter":29,"./polyfills/array.foreach":30,"./polyfills/array.indexof":31,"./polyfills/array.isarray":32,"./polyfills/array.map":33,"./polyfills/array.some":34,"./polyfills/function.bind":35,"./polyfills/object.keys":36,"./polyfills/string.trim":37,"./use":41,"./validators":42}],39:[function(_dereq_,module,exports){
(function (global){
var rome = _dereq_('./rome');
var momentum = _dereq_('./momentum');

rome.use(global.moment);

if (momentum.moment === void 0) {
  throw new Error('rome depends on moment.js, you can get it at http://momentjs.com, or you could use the bundled distribution file instead.');
}

module.exports = rome;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./momentum":25,"./rome":38}],40:[function(_dereq_,module,exports){
'use strict';

function text (elem, value) {
  if (arguments.length === 2) {
    elem.innerText = elem.textContent = value;
  }
  return elem.innerText || elem.textContent;
}

module.exports = text;

},{}],41:[function(_dereq_,module,exports){
'use strict';

var momentum = _dereq_('./momentum');

function use (moment) {
  this.moment = momentum.moment = moment;
}

module.exports = use;

},{"./momentum":25}],42:[function(_dereq_,module,exports){
'use strict';

var index = _dereq_('./index');
var parse = _dereq_('./parse');
var association = _dereq_('./association');

function compareBuilder (compare) {
  return function factory (value) {
    var fixed = parse(value);

    return function validate (date) {
      var cal = index.find(value);
      var left = parse(date);
      var right = fixed || cal && cal.getMoment();
      if (!right) {
        return true;
      }
      if (cal) {
        association.add(this, cal);
      }
      return compare(left, right);
    };
  };
}

function rangeBuilder (how, compare) {
  return function factory (start, end) {
    var dates;
    var len = arguments.length;

    if (Array.isArray(start)) {
      dates = start;
    } else {
      if (len === 1) {
        dates = [start];
      } else if (len === 2) {
        dates = [[start, end]];
      }
    }

    return function validate (date) {
      return dates.map(expand.bind(this))[how](compare.bind(this, date));
    };

    function expand (value) {
      var start, end;
      var cal = index.find(value);
      if (cal) {
        start = end = cal.getMoment();
      } else if (Array.isArray(value)) {
        start = value[0]; end = value[1];
      } else {
        start = end = value;
      }
      if (cal) {
        association.add(cal, this);
      }
      return {
        start: parse(start).startOf('day').toDate(),
        end: parse(end).endOf('day').toDate()
      };
    }
  };
}

var afterEq  = compareBuilder(function (left, right) { return left >= right; });
var after    = compareBuilder(function (left, right) { return left  > right; });
var beforeEq = compareBuilder(function (left, right) { return left <= right; });
var before   = compareBuilder(function (left, right) { return left  < right; });

var except   = rangeBuilder('every', function (left, right) { return right.start  > left || right.end  < left; });
var only     = rangeBuilder('some',  function (left, right) { return right.start <= left && right.end >= left; });

module.exports = {
  afterEq: afterEq,
  after: after,
  beforeEq: beforeEq,
  before: before,
  except: except,
  only: only
};

},{"./association":13,"./index":21,"./parse":27}]},{},[39])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvbm9kZV9tb2R1bGVzL2NvbnRyYS5lbWl0dGVyL2luZGV4LmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvbm9kZV9tb2R1bGVzL2NvbnRyYS5lbWl0dGVyL3NyYy9jb250cmEuZW1pdHRlci5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVib3VuY2UvaW5kZXguanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVib3VuY2Uvbm9kZV9tb2R1bGVzL2xvZGFzaC5ub3cvaW5kZXguanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVib3VuY2Uvbm9kZV9tb2R1bGVzL2xvZGFzaC5ub3cvbm9kZV9tb2R1bGVzL2xvZGFzaC5faXNuYXRpdmUvaW5kZXguanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guaXNmdW5jdGlvbi9pbmRleC5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9pbmRleC5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9ub2RlX21vZHVsZXMvbG9kYXNoLl9vYmplY3R0eXBlcy9pbmRleC5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL25vZGVfbW9kdWxlcy9yYWYvaW5kZXguanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9ub2RlX21vZHVsZXMvcmFmL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9hc3NvY2lhdGlvbi5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9jYWxlbmRhci5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9jbGFzc2VzLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL2Nsb25lLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL2NvcmUuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvZGVmYXVsdHMuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvZG9tLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL2V2ZW50cy5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9pbmxpbmUuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvaW5wdXQuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvaXNJbnB1dC5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9tb21lbnR1bS5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9ub29wLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BhcnNlLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5ldmVyeS5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9wb2x5ZmlsbHMvYXJyYXkuZmlsdGVyLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5mb3JlYWNoLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5pbmRleG9mLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5pc2FycmF5LmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5tYXAuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvcG9seWZpbGxzL2FycmF5LnNvbWUuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvcG9seWZpbGxzL2Z1bmN0aW9uLmJpbmQuanMiLCIvVXNlcnMvU3V6YW5hL1NpdGVzL3RyaXB3b2svYXBwL2Jvd2VyX2NvbXBvbmVudHMvcm9tZS9zcmMvcG9seWZpbGxzL29iamVjdC5rZXlzLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3BvbHlmaWxscy9zdHJpbmcudHJpbS5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy9yb21lLmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3JvbWUuc3RhbmRhbG9uZS5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy90ZXh0LmpzIiwiL1VzZXJzL1N1emFuYS9TaXRlcy90cmlwd29rL2FwcC9ib3dlcl9jb21wb25lbnRzL3JvbWUvc3JjL3VzZS5qcyIsIi9Vc2Vycy9TdXphbmEvU2l0ZXMvdHJpcHdvay9hcHAvYm93ZXJfY29tcG9uZW50cy9yb21lL3NyYy92YWxpZGF0b3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy9jb250cmEuZW1pdHRlci5qcycpO1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbihmdW5jdGlvbiAocm9vdCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgdW5kZWYgPSAnJyArIHVuZGVmaW5lZDtcbiAgZnVuY3Rpb24gYXRvYSAoYSwgbikgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSwgbik7IH1cbiAgZnVuY3Rpb24gZGVib3VuY2UgKGZuLCBhcmdzLCBjdHgpIHsgaWYgKCFmbikgeyByZXR1cm47IH0gdGljayhmdW5jdGlvbiBydW4gKCkgeyBmbi5hcHBseShjdHggfHwgbnVsbCwgYXJncyB8fCBbXSk7IH0pOyB9XG5cbiAgLy8gY3Jvc3MtcGxhdGZvcm0gdGlja2VyXG4gIHZhciBzaSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicsIHRpY2s7XG4gIGlmIChzaSkge1xuICAgIHRpY2sgPSBmdW5jdGlvbiAoZm4pIHsgc2V0SW1tZWRpYXRlKGZuKTsgfTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gdW5kZWYgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgIHRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuICB9IGVsc2Uge1xuICAgIHRpY2sgPSBmdW5jdGlvbiAoZm4pIHsgc2V0VGltZW91dChmbiwgMCk7IH07XG4gIH1cblxuICBmdW5jdGlvbiBfZW1pdHRlciAodGhpbmcsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGV2dCA9IHt9O1xuICAgIGlmICh0aGluZyA9PT0gdW5kZWZpbmVkKSB7IHRoaW5nID0ge307IH1cbiAgICB0aGluZy5vbiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgICAgaWYgKCFldnRbdHlwZV0pIHtcbiAgICAgICAgZXZ0W3R5cGVdID0gW2ZuXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV2dFt0eXBlXS5wdXNoKGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGluZztcbiAgICB9O1xuICAgIHRoaW5nLm9uY2UgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICAgIGZuLl9vbmNlID0gdHJ1ZTsgLy8gdGhpbmcub2ZmKGZuKSBzdGlsbCB3b3JrcyFcbiAgICAgIHRoaW5nLm9uKHR5cGUsIGZuKTtcbiAgICAgIHJldHVybiB0aGluZztcbiAgICB9O1xuICAgIHRoaW5nLm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgaWYgKGMgPT09IDEpIHtcbiAgICAgICAgZGVsZXRlIGV2dFt0eXBlXTtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMCkge1xuICAgICAgICBldnQgPSB7fTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBldCA9IGV2dFt0eXBlXTtcbiAgICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cbiAgICAgICAgZXQuc3BsaWNlKGV0LmluZGV4T2YoZm4pLCAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGluZztcbiAgICB9O1xuICAgIHRoaW5nLmVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGluZy5lbWl0dGVyU25hcHNob3QoYXJncy5zaGlmdCgpKS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICB2YXIgZXQgPSAoZXZ0W3R5cGVdIHx8IFtdKS5zbGljZSgwKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY3R4ID0gdGhpcyB8fCB0aGluZztcbiAgICAgICAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgb3B0cy50aHJvd3MgIT09IGZhbHNlICYmICFldC5sZW5ndGgpIHsgdGhyb3cgYXJncy5sZW5ndGggPT09IDEgPyBhcmdzWzBdIDogYXJnczsgfVxuICAgICAgICBldnRbdHlwZV0gPSBldC5maWx0ZXIoZnVuY3Rpb24gZW1pdHRlciAobGlzdGVuKSB7XG4gICAgICAgICAgaWYgKG9wdHMuYXN5bmMpIHsgZGVib3VuY2UobGlzdGVuLCBhcmdzLCBjdHgpOyB9IGVsc2UgeyBsaXN0ZW4uYXBwbHkoY3R4LCBhcmdzKTsgfVxuICAgICAgICAgIHJldHVybiAhbGlzdGVuLl9vbmNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9XG5cbiAgLy8gY3Jvc3MtcGxhdGZvcm0gZXhwb3J0XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSB1bmRlZiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2VtaXR0ZXI7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5jb250cmEgPSByb290LmNvbnRyYSB8fCB7fTtcbiAgICByb290LmNvbnRyYS5lbWl0dGVyID0gX2VtaXR0ZXI7XG4gIH1cbn0pKHRoaXMpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkZXYUFTSFwiKSkiLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyksXG4gICAgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKTtcblxuLyoqIFVzZWQgYXMgYW4gaW50ZXJuYWwgYF8uZGVib3VuY2VgIG9wdGlvbnMgb2JqZWN0ICovXG52YXIgZGVib3VuY2VPcHRpb25zID0ge1xuICAnbGVhZGluZyc6IGZhbHNlLFxuICAnbWF4V2FpdCc6IDAsXG4gICd0cmFpbGluZyc6IGZhbHNlXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGV4ZWN1dGVkLCB3aWxsIG9ubHkgY2FsbCB0aGUgYGZ1bmNgIGZ1bmN0aW9uXG4gKiBhdCBtb3N0IG9uY2UgcGVyIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFByb3ZpZGUgYW4gb3B0aW9ucyBvYmplY3QgdG9cbiAqIGluZGljYXRlIHRoYXQgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlXG4gKiBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsXG4gKiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgY2FsbC5cbiAqXG4gKiBOb3RlOiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgIGBmdW5jYCB3aWxsIGJlIGNhbGxlZFxuICogb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhlIHRocm90dGxlZCBmdW5jdGlvbiBpc1xuICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGV4ZWN1dGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gYXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZ1xuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCk7XG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBleGVjdXRlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXNcbiAqIGpRdWVyeSgnLmludGVyYWN0aXZlJykub24oJ2NsaWNrJywgXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHtcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgfVxuICBpZiAob3B0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICBsZWFkaW5nID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIGRlYm91bmNlT3B0aW9ucy5sZWFkaW5nID0gbGVhZGluZztcbiAgZGVib3VuY2VPcHRpb25zLm1heFdhaXQgPSB3YWl0O1xuICBkZWJvdW5jZU9wdGlvbnMudHJhaWxpbmcgPSB0cmFpbGluZztcblxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwgZGVib3VuY2VPcHRpb25zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBub3cgPSByZXF1aXJlKCdsb2Rhc2gubm93Jyk7XG5cbi8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBkZWxheSB0aGUgZXhlY3V0aW9uIG9mIGBmdW5jYCB1bnRpbCBhZnRlclxuICogYHdhaXRgIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSBpdCB3YXMgaW52b2tlZC5cbiAqIFByb3ZpZGUgYW4gb3B0aW9ucyBvYmplY3QgdG8gaW5kaWNhdGUgdGhhdCBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb25cbiAqIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gU3Vic2VxdWVudCBjYWxsc1xuICogdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBjYWxsLlxuICpcbiAqIE5vdGU6IElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAgYGZ1bmNgIHdpbGwgYmUgY2FsbGVkXG4gKiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGlzXG4gKiBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IHdhaXQgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XSBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgY2FsbGVkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gYXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eFxuICogdmFyIGxhenlMYXlvdXQgPSBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKTtcbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBsYXp5TGF5b3V0KTtcbiAqXG4gKiAvLyBleGVjdXRlIGBzZW5kTWFpbGAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxsc1xuICogalF1ZXJ5KCcjcG9zdGJveCcpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KTtcbiAqXG4gKiAvLyBlbnN1cmUgYGJhdGNoTG9nYCBpcyBleGVjdXRlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxsc1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogc291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHtcbiAqICAgJ21heFdhaXQnOiAxMDAwXG4gKiB9LCBmYWxzZSk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGFyZ3MsXG4gICAgICBtYXhUaW1lb3V0SWQsXG4gICAgICByZXN1bHQsXG4gICAgICBzdGFtcCxcbiAgICAgIHRoaXNBcmcsXG4gICAgICB0aW1lb3V0SWQsXG4gICAgICB0cmFpbGluZ0NhbGwsXG4gICAgICBsYXN0Q2FsbGVkID0gMCxcbiAgICAgIG1heFdhaXQgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICB9XG4gIHdhaXQgPSBuYXRpdmVNYXgoMCwgd2FpdCkgfHwgMDtcbiAgaWYgKG9wdGlvbnMgPT09IHRydWUpIHtcbiAgICB2YXIgbGVhZGluZyA9IHRydWU7XG4gICAgdHJhaWxpbmcgPSBmYWxzZTtcbiAgfSBlbHNlIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSBvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4V2FpdCA9ICdtYXhXYWl0JyBpbiBvcHRpb25zICYmIChuYXRpdmVNYXgod2FpdCwgb3B0aW9ucy5tYXhXYWl0KSB8fCAwKTtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/IG9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICB2YXIgZGVsYXllZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdygpIC0gc3RhbXApO1xuICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgaWYgKG1heFRpbWVvdXRJZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobWF4VGltZW91dElkKTtcbiAgICAgIH1cbiAgICAgIHZhciBpc0NhbGxlZCA9IHRyYWlsaW5nQ2FsbDtcbiAgICAgIG1heFRpbWVvdXRJZCA9IHRpbWVvdXRJZCA9IHRyYWlsaW5nQ2FsbCA9IHVuZGVmaW5lZDtcbiAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICBsYXN0Q2FsbGVkID0gbm93KCk7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dElkICYmICFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICBhcmdzID0gdGhpc0FyZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChkZWxheWVkLCByZW1haW5pbmcpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbWF4RGVsYXllZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRyYWlsaW5nIHx8IChtYXhXYWl0ICE9PSB3YWl0KSkge1xuICAgICAgbGFzdENhbGxlZCA9IG5vdygpO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dElkICYmICFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICBzdGFtcCA9IG5vdygpO1xuICAgIHRoaXNBcmcgPSB0aGlzO1xuICAgIHRyYWlsaW5nQ2FsbCA9IHRyYWlsaW5nICYmICh0aW1lb3V0SWQgfHwgIWxlYWRpbmcpO1xuXG4gICAgaWYgKG1heFdhaXQgPT09IGZhbHNlKSB7XG4gICAgICB2YXIgbGVhZGluZ0NhbGwgPSBsZWFkaW5nICYmICF0aW1lb3V0SWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghbWF4VGltZW91dElkICYmICFsZWFkaW5nKSB7XG4gICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgIH1cbiAgICAgIHZhciByZW1haW5pbmcgPSBtYXhXYWl0IC0gKHN0YW1wIC0gbGFzdENhbGxlZCksXG4gICAgICAgICAgaXNDYWxsZWQgPSByZW1haW5pbmcgPD0gMDtcblxuICAgICAgaWYgKGlzQ2FsbGVkKSB7XG4gICAgICAgIGlmIChtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICBtYXhUaW1lb3V0SWQgPSBjbGVhclRpbWVvdXQobWF4VGltZW91dElkKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICghbWF4VGltZW91dElkKSB7XG4gICAgICAgIG1heFRpbWVvdXRJZCA9IHNldFRpbWVvdXQobWF4RGVsYXllZCwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzQ2FsbGVkICYmIHRpbWVvdXRJZCkge1xuICAgICAgdGltZW91dElkID0gY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCF0aW1lb3V0SWQgJiYgd2FpdCAhPT0gbWF4V2FpdCkge1xuICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChkZWxheWVkLCB3YWl0KTtcbiAgICB9XG4gICAgaWYgKGxlYWRpbmdDYWxsKSB7XG4gICAgICBpc0NhbGxlZCA9IHRydWU7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIH1cbiAgICBpZiAoaXNDYWxsZWQgJiYgIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICBhcmdzID0gdGhpc0FyZyA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVib3VuY2U7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIFVuaXggZXBvY2hcbiAqICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBzdGFtcCA9IF8ubm93KCk7XG4gKiBfLmRlZmVyKGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApOyB9KTtcbiAqIC8vID0+IGxvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZFxuICovXG52YXIgbm93ID0gaXNOYXRpdmUobm93ID0gRGF0ZS5ub3cpICYmIG5vdyB8fCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBub3c7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZSAqL1xudmFyIHJlTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIFN0cmluZyh0b1N0cmluZylcbiAgICAucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKVxuICAgIC5yZXBsYWNlKC90b1N0cmluZ3wgZm9yIFteXFxdXSsvZywgJy4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicgJiYgcmVOYXRpdmUudGVzdCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNOYXRpdmU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbic7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlIGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0LlxuICogKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgaXMgdGhlIEVDTUFTY3JpcHQgbGFuZ3VhZ2UgdHlwZSBvZiBPYmplY3RcbiAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3g4XG4gIC8vIGFuZCBhdm9pZCBhIFY4IGJ1Z1xuICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxXG4gIHJldHVybiAhISh2YWx1ZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgdmFsdWVdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIE9iamVjdCAqL1xudmFyIG9iamVjdFR5cGVzID0ge1xuICAnYm9vbGVhbic6IGZhbHNlLFxuICAnZnVuY3Rpb24nOiB0cnVlLFxuICAnb2JqZWN0JzogdHJ1ZSxcbiAgJ251bWJlcic6IGZhbHNlLFxuICAnc3RyaW5nJzogZmFsc2UsXG4gICd1bmRlZmluZWQnOiBmYWxzZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUeXBlcztcbiIsInZhciBub3cgPSByZXF1aXJlKCdwZXJmb3JtYW5jZS1ub3cnKVxuICAsIGdsb2JhbCA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8ge30gOiB3aW5kb3dcbiAgLCB2ZW5kb3JzID0gWydtb3onLCAnd2Via2l0J11cbiAgLCBzdWZmaXggPSAnQW5pbWF0aW9uRnJhbWUnXG4gICwgcmFmID0gZ2xvYmFsWydyZXF1ZXN0JyArIHN1ZmZpeF1cbiAgLCBjYWYgPSBnbG9iYWxbJ2NhbmNlbCcgKyBzdWZmaXhdIHx8IGdsb2JhbFsnY2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgaXNOYXRpdmUgPSB0cnVlXG5cbmZvcih2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhcmFmOyBpKyspIHtcbiAgcmFmID0gZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnUmVxdWVzdCcgKyBzdWZmaXhdXG4gIGNhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ0NhbmNlbCcgKyBzdWZmaXhdXG4gICAgICB8fCBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cbn1cblxuLy8gU29tZSB2ZXJzaW9ucyBvZiBGRiBoYXZlIHJBRiBidXQgbm90IGNBRlxuaWYoIXJhZiB8fCAhY2FmKSB7XG4gIGlzTmF0aXZlID0gZmFsc2VcblxuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYoIWNwW2ldLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIE1hdGgucm91bmQobmV4dCkpXG4gICAgfVxuICAgIHF1ZXVlLnB1c2goe1xuICAgICAgaGFuZGxlOiArK2lkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY2FuY2VsbGVkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBjYWYgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHF1ZXVlW2ldLmhhbmRsZSA9PT0gaGFuZGxlKSB7XG4gICAgICAgIHF1ZXVlW2ldLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbikge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgaWYoIWlzTmF0aXZlKSB7XG4gICAgcmV0dXJuIHJhZi5jYWxsKGdsb2JhbCwgZm4pXG4gIH1cbiAgcmV0dXJuIHJhZi5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKSB7XG4gICAgdHJ5e1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdGhyb3cgZSB9LCAwKVxuICAgIH1cbiAgfSlcbn1cbm1vZHVsZS5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICBjYWYuYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpXG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXBlcmZvcm1hbmNlLW5vdy5tYXBcbiovXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiRldhQVNIXCIpKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzSW5wdXQgPSByZXF1aXJlKCcuL2lzSW5wdXQnKTtcbnZhciBiaW5kaW5ncyA9IHt9O1xuXG5mdW5jdGlvbiBoYXMgKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHZhciBiaW5kaW5nID0gYmluZGluZ3Nbc291cmNlLmlkXTtcbiAgcmV0dXJuIGJpbmRpbmcgJiYgYmluZGluZ1t0YXJnZXQuaWRdO1xufVxuXG5mdW5jdGlvbiBpbnNlcnQgKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHZhciBiaW5kaW5nID0gYmluZGluZ3Nbc291cmNlLmlkXTtcbiAgaWYgKCFiaW5kaW5nKSB7XG4gICAgYmluZGluZyA9IGJpbmRpbmdzW3NvdXJjZS5pZF0gPSB7fTtcbiAgfVxuICB2YXIgaW52YWxpZGF0ZSA9IGludmFsaWRhdG9yKHRhcmdldCk7XG4gIGJpbmRpbmdbdGFyZ2V0LmlkXSA9IGludmFsaWRhdGU7XG4gIHNvdXJjZS5vbignZGF0YScsIGludmFsaWRhdGUpO1xuICBzb3VyY2Uub24oJ2Rlc3Ryb3llZCcsIHJlbW92ZS5iaW5kKG51bGwsIHNvdXJjZSwgdGFyZ2V0KSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoc291cmNlLCB0YXJnZXQpIHtcbiAgdmFyIGJpbmRpbmcgPSBiaW5kaW5nc1tzb3VyY2UuaWRdO1xuICBpZiAoIWJpbmRpbmcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGludmFsaWRhdGUgPSBiaW5kaW5nW3RhcmdldC5pZF07XG4gIHNvdXJjZS5vZmYoJ2RhdGEnLCBpbnZhbGlkYXRlKTtcbiAgZGVsZXRlIGJpbmRpbmdbdGFyZ2V0LmlkXTtcbn1cblxuZnVuY3Rpb24gaW52YWxpZGF0b3IgKHRhcmdldCkge1xuICByZXR1cm4gZnVuY3Rpb24gaW52YWxpZGF0ZSAoKSB7XG4gICAgdGFyZ2V0LnJlZnJlc2goKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkIChzb3VyY2UsIHRhcmdldCkge1xuICBpZiAoaXNJbnB1dCh0YXJnZXQuYXNzb2NpYXRlZCkgfHwgaGFzKHNvdXJjZSwgdGFyZ2V0KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbnNlcnQoc291cmNlLCB0YXJnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGQsXG4gIHJlbW92ZTogcmVtb3ZlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW1pdHRlciA9IHJlcXVpcmUoJ2NvbnRyYS5lbWl0dGVyJyk7XG52YXIgcmFmID0gcmVxdWlyZSgncmFmJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb20nKTtcbnZhciB0ZXh0ID0gcmVxdWlyZSgnLi90ZXh0Jyk7XG52YXIgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuL2Nsb25lJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgbm9vcCA9IHJlcXVpcmUoJy4vbm9vcCcpO1xudmFyIG5vO1xuXG5mdW5jdGlvbiBjYWxlbmRhciAoY2FsZW5kYXJPcHRpb25zKSB7XG4gIHZhciBvO1xuICB2YXIgYXBpID0gZW1pdHRlcih7fSk7XG4gIHZhciByZWY7XG4gIHZhciByZWZDYWw7XG4gIHZhciBjb250YWluZXI7XG4gIHZhciByZW5kZXJlZCA9IGZhbHNlO1xuICB2YXIgc2VsZWN0ZWRNb250aDtcbiAgdmFyIHNlbGVjdGVkWWVhcjtcbiAgdmFyIGludGVydmFsRGF0ZXMgPSBjYWxlbmRhck9wdGlvbnMuaW50ZXJ2YWxEYXRlcyB8fCBbXTtcblxuICAvLyBkYXRlIHZhcmlhYmxlc1xuICB2YXIgbW9udGhPZmZzZXRBdHRyaWJ1dGUgPSAnZGF0YS1yb21lLW9mZnNldCc7XG4gIHZhciB3ZWVrZGF5cztcbiAgdmFyIHdlZWtkYXlDb3VudDtcbiAgdmFyIGNhbGVuZGFyTW9udGhzID0gW107XG4gIHZhciBsYXN0WWVhcjtcbiAgdmFyIGxhc3RNb250aDtcbiAgdmFyIGxhc3REYXk7XG4gIHZhciBsYXN0RGF5RWxlbWVudDtcbiAgdmFyIGRhdGV3cmFwcGVyO1xuICB2YXIgYmFjaztcbiAgdmFyIG5leHQ7XG5cbiAgLy8gdGltZSB2YXJpYWJsZXNcbiAgdmFyIHNlY29uZHNJbkRheSA9IDYwICogNjAgKiAyNDtcbiAgdmFyIHRpbWU7XG4gIHZhciB0aW1lbGlzdDtcblxuICBkZXN0cm95KHRydWUpO1xuXG4gIHJhZihmdW5jdGlvbiAoKSB7XG4gICAgaW5pdCgpO1xuICB9KTtcblxuICBmdW5jdGlvbiBuYXBpICgpIHsgcmV0dXJuIGFwaTsgfVxuXG4gIGZ1bmN0aW9uIGluaXQgKGluaXRPcHRpb25zKSB7XG4gICAgbyA9IGRlZmF1bHRzKGluaXRPcHRpb25zIHx8IGNhbGVuZGFyT3B0aW9ucywgYXBpKTtcbiAgICBpZiAoIWNvbnRhaW5lcikgeyBjb250YWluZXIgPSBkb20oeyBjbGFzc05hbWU6IG8uc3R5bGVzLmNvbnRhaW5lciB9KTsgfVxuICAgIHdlZWtkYXlzID0gby53ZWVrZGF5Rm9ybWF0O1xuICAgIHdlZWtkYXlDb3VudCA9IHdlZWtkYXlzLmxlbmd0aDtcbiAgICBsYXN0TW9udGggPSBubztcbiAgICBsYXN0WWVhciA9IG5vO1xuICAgIGxhc3REYXkgPSBubztcbiAgICBsYXN0RGF5RWxlbWVudCA9IG5vO1xuICAgIG8uYXBwZW5kVG8uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAgIHJlbW92ZUNoaWxkcmVuKGNvbnRhaW5lcik7XG4gICAgcmVuZGVyZWQgPSBmYWxzZTtcbiAgICByZWYgPSBvLmluaXRpYWxWYWx1ZSA/IG8uaW5pdGlhbFZhbHVlIDogbW9tZW50dW0ubW9tZW50KCk7XG4gICAgaWYgKG8uaW5pdGlhbFZhbHVlKXtcbiAgICAgIHJlZiA9IG8uaW5pdGlhbFZhbHVlO1xuICAgICAgc3RvcmVEYXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZiA9IG1vbWVudHVtLm1vbWVudCgpO1xuICAgIH1cbiAgICByZWZDYWwgPSByZWYuY2xvbmUoKTtcblxuICAgIGFwaS5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgYXBpLmRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIGFwaS5kZXN0cm95ID0gZGVzdHJveS5iaW5kKGFwaSwgZmFsc2UpO1xuICAgIGFwaS5lbWl0VmFsdWVzID0gZW1pdFZhbHVlcztcbiAgICBhcGkuZ2V0RGF0ZSA9IGdldERhdGU7XG4gICAgYXBpLmdldERhdGVTdHJpbmcgPSBnZXREYXRlU3RyaW5nO1xuICAgIGFwaS5nZXRNb21lbnQgPSBnZXRNb21lbnQ7XG4gICAgYXBpLmhpZGUgPSBoaWRlO1xuICAgIGFwaS5vcHRpb25zID0gY2hhbmdlT3B0aW9ucztcbiAgICBhcGkub3B0aW9ucy5yZXNldCA9IHJlc2V0T3B0aW9ucztcbiAgICBhcGkucmVmcmVzaCA9IHJlZnJlc2g7XG4gICAgYXBpLnJlc3RvcmUgPSBuYXBpO1xuICAgIGFwaS5zZXRWYWx1ZSA9IHNldFZhbHVlO1xuICAgIGFwaS5zaG93ID0gc2hvdztcbiAgICBhcGkuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgaGlkZUNhbGVuZGFyKCk7XG4gICAgZXZlbnRMaXN0ZW5pbmcoKTtcblxuICAgIGFwaS5lbWl0KCdyZWFkeScsIGNsb25lKG8pKTtcblxuICAgIHJldHVybiBhcGk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95IChzaWxlbnQpIHtcbiAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICBjb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xuICAgIH1cblxuICAgIGlmIChvKSB7XG4gICAgICBldmVudExpc3RlbmluZyh0cnVlKTtcbiAgICB9XG5cbiAgICBhcGkuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICBhcGkuZGVzdHJveSA9IG5hcGk7XG4gICAgYXBpLmVtaXRWYWx1ZXMgPSBuYXBpO1xuICAgIGFwaS5nZXREYXRlID0gbm9vcDtcbiAgICBhcGkuZ2V0RGF0ZVN0cmluZyA9IG5vb3A7XG4gICAgYXBpLmdldE1vbWVudCA9IG5vb3A7XG4gICAgYXBpLmhpZGUgPSBuYXBpO1xuICAgIGFwaS5vcHRpb25zID0gbmFwaTtcbiAgICBhcGkub3B0aW9ucy5yZXNldCA9IG5hcGk7XG4gICAgYXBpLnJlZnJlc2ggPSBuYXBpO1xuICAgIGFwaS5yZXN0b3JlID0gaW5pdDtcbiAgICBhcGkuc2V0VmFsdWUgPSBuYXBpO1xuICAgIGFwaS5zaG93ID0gbmFwaTtcbiAgICBhcGkuaGlnaGxpZ2h0ID0gbmFwaTtcblxuICAgIGlmIChzaWxlbnQgIT09IHRydWUpIHtcbiAgICAgIGFwaS5lbWl0KCdkZXN0cm95ZWQnKTtcbiAgICB9XG4gICAgYXBpLm9mZigpO1xuXG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50TGlzdGVuaW5nIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIGlmIChvLmF1dG9IaWRlT25CbHVyKSB7IGV2ZW50c1tvcF0oZG9jdW1lbnQsICdmb2N1c2luJywgaGlkZU9uQmx1cik7IH1cbiAgICBpZiAoby5hdXRvSGlkZU9uQ2xpY2spIHsgZXZlbnRzW29wXShkb2N1bWVudCwgJ2NsaWNrJywgaGlkZU9uQ2xpY2spOyB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VPcHRpb25zIChvcHRpb25zKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBjbG9uZShvKTtcbiAgICB9XG4gICAgZGVzdHJveSgpO1xuICAgIGluaXQob3B0aW9ucyk7XG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0T3B0aW9ucyAoKSB7XG4gICAgcmV0dXJuIGNoYW5nZU9wdGlvbnMoe30pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyICgpIHtcbiAgICBpZiAocmVuZGVyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVuZGVyZWQgPSB0cnVlO1xuICAgIHJlbmRlckRhdGVzKCk7XG4gICAgcmVuZGVyVGltZSgpO1xuICAgIGFwaS5lbWl0KCdyZW5kZXInKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckRhdGVzICgpIHtcbiAgICBpZiAoIW8uZGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICBjYWxlbmRhck1vbnRocyA9IFtdO1xuXG4gICAgZGF0ZXdyYXBwZXIgPSBkb20oeyBjbGFzc05hbWU6IG8uc3R5bGVzLmRhdGUsIHBhcmVudDogY29udGFpbmVyIH0pO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG8ubW9udGhzSW5DYWxlbmRhcjsgaSsrKSB7XG4gICAgICByZW5kZXJNb250aChpKTtcbiAgICB9XG5cbiAgICBldmVudHMuYWRkKGJhY2ssICdjbGljaycsIHN1YnRyYWN0TW9udGgpO1xuICAgIGV2ZW50cy5hZGQobmV4dCwgJ2NsaWNrJywgYWRkTW9udGgpO1xuICAgIGV2ZW50cy5hZGQoZGF0ZXdyYXBwZXIsICdjbGljaycsIHBpY2tEYXkpO1xuXG4gICAgZnVuY3Rpb24gcmVuZGVyTW9udGggKGkpIHtcbiAgICAgIHZhciBtb250aCA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMubW9udGgsIHBhcmVudDogZGF0ZXdyYXBwZXIgfSk7XG4gICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICBiYWNrID0gZG9tKHsgdHlwZTogJ3NwYW4nLCBjbGFzc05hbWU6IG8uc3R5bGVzLmJhY2ssIHBhcmVudDogbW9udGgsIGlubmVySFRNTDogby5odG1sLmJhY2sgfSk7XG4gICAgICB9XG4gICAgICBpZiAoaSA9PT0gby5tb250aHNJbkNhbGVuZGFyIC0xKSB7XG4gICAgICAgIG5leHQgPSBkb20oeyB0eXBlOiAnc3BhbicsIGNsYXNzTmFtZTogby5zdHlsZXMubmV4dCwgcGFyZW50OiBtb250aCwgaW5uZXJIVE1MOiBvLmh0bWwubmV4dCB9KTtcbiAgICAgIH1cbiAgICAgIHZhciBsYWJlbCA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMubW9udGhMYWJlbCwgcGFyZW50OiBtb250aCB9KTtcbiAgICAgIHZhciBkYXRlID0gZG9tKHsgdHlwZTogJ3RhYmxlJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlUYWJsZSwgcGFyZW50OiBtb250aCB9KTtcbiAgICAgIHZhciBkYXRlaGVhZCA9IGRvbSh7IHR5cGU6ICd0aGVhZCcsIGNsYXNzTmFtZTogby5zdHlsZXMuZGF5SGVhZCwgcGFyZW50OiBkYXRlIH0pO1xuICAgICAgdmFyIGRhdGVoZWFkcm93ID0gZG9tKHsgdHlwZTogJ3RyJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlSb3csIHBhcmVudDogZGF0ZWhlYWQgfSk7XG4gICAgICB2YXIgZGF0ZWJvZHkgPSBkb20oeyB0eXBlOiAndGJvZHknLCBjbGFzc05hbWU6IG8uc3R5bGVzLmRheUJvZHksIHBhcmVudDogZGF0ZSB9KTtcbiAgICAgIHZhciBqO1xuXG4gICAgICBmb3IgKGogPSAwOyBqIDwgd2Vla2RheUNvdW50OyBqKyspIHtcbiAgICAgICAgZG9tKHsgdHlwZTogJ3RoJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlIZWFkRWxlbSwgcGFyZW50OiBkYXRlaGVhZHJvdywgdGV4dDogd2Vla2RheXNbd2Vla2RheShqKV0gfSk7XG4gICAgICB9XG5cbiAgICAgIGRhdGVib2R5LnNldEF0dHJpYnV0ZShtb250aE9mZnNldEF0dHJpYnV0ZSwgaSk7XG4gICAgICBjYWxlbmRhck1vbnRocy5wdXNoKHtcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBib2R5OiBkYXRlYm9keVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyVGltZSAoKSB7XG4gICAgaWYgKCFvLnRpbWUgfHwgIW8udGltZUludGVydmFsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1ld3JhcHBlciA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMudGltZSwgcGFyZW50OiBjb250YWluZXIgfSk7XG4gICAgdGltZSA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMuc2VsZWN0ZWRUaW1lLCBwYXJlbnQ6IHRpbWV3cmFwcGVyLCB0ZXh0OiByZWYuZm9ybWF0KG8udGltZUZvcm1hdCkgfSk7XG4gICAgZXZlbnRzLmFkZCh0aW1lLCAnY2xpY2snLCB0b2dnbGVUaW1lTGlzdCk7XG4gICAgdGltZWxpc3QgPSBkb20oeyBjbGFzc05hbWU6IG8uc3R5bGVzLnRpbWVMaXN0LCBwYXJlbnQ6IHRpbWV3cmFwcGVyIH0pO1xuICAgIGV2ZW50cy5hZGQodGltZWxpc3QsICdjbGljaycsIHBpY2tUaW1lKTtcbiAgICB2YXIgbmV4dCA9IG1vbWVudHVtLm1vbWVudCgnMDA6MDA6MDAnLCAnSEg6bW06c3MnKTtcbiAgICB2YXIgbGF0ZXN0ID0gbmV4dC5jbG9uZSgpLmFkZCgxLCAnZGF5cycpO1xuICAgIHdoaWxlIChuZXh0LmlzQmVmb3JlKGxhdGVzdCkpIHtcbiAgICAgIGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMudGltZU9wdGlvbiwgcGFyZW50OiB0aW1lbGlzdCwgdGV4dDogbmV4dC5mb3JtYXQoby50aW1lRm9ybWF0KSB9KTtcbiAgICAgIG5leHQuYWRkKG8udGltZUludGVydmFsLCAnc2Vjb25kcycpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdlZWtkYXkgKGluZGV4LCBiYWNrd2FyZHMpIHtcbiAgICB2YXIgZmFjdG9yID0gYmFja3dhcmRzID8gLTEgOiAxO1xuICAgIHZhciBvZmZzZXQgPSBpbmRleCArIG8ud2Vla1N0YXJ0ICogZmFjdG9yO1xuICAgIGlmIChvZmZzZXQgPj0gd2Vla2RheUNvdW50IHx8IG9mZnNldCA8IDApIHtcbiAgICAgIG9mZnNldCArPSB3ZWVrZGF5Q291bnQgKiAtZmFjdG9yO1xuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVZhbGlkVGltZXNPbmx5ICgpIHtcbiAgICBpZiAoIW8udGltZSB8fCAhcmVuZGVyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVzID0gdGltZWxpc3QuY2hpbGRyZW47XG4gICAgdmFyIGxlbmd0aCA9IHRpbWVzLmxlbmd0aDtcbiAgICB2YXIgZGF0ZTtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgaXRlbTtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGl0ZW0gPSB0aW1lc1tpXTtcbiAgICAgIHRpbWUgPSBtb21lbnR1bS5tb21lbnQodGV4dChpdGVtKSwgby50aW1lRm9ybWF0KTtcbiAgICAgIGRhdGUgPSBzZXRUaW1lKHJlZi5jbG9uZSgpLCB0aW1lKTtcbiAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9IGlzSW5SYW5nZShkYXRlLCBmYWxzZSwgby50aW1lVmFsaWRhdG9yKSA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlVGltZUxpc3QgKHNob3cpIHtcbiAgICB2YXIgZGlzcGxheSA9IHR5cGVvZiBzaG93ID09PSAnYm9vbGVhbicgPyBzaG93IDogdGltZWxpc3Quc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xuICAgIGlmIChkaXNwbGF5KSB7XG4gICAgICBzaG93VGltZUxpc3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZVRpbWVMaXN0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvd1RpbWVMaXN0ICgpIHsgaWYgKHRpbWVsaXN0KSB7IHRpbWVsaXN0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOyB9IH1cbiAgZnVuY3Rpb24gaGlkZVRpbWVMaXN0ICgpIHsgaWYgKHRpbWVsaXN0KSB7IHRpbWVsaXN0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH0gfVxuICBmdW5jdGlvbiBzaG93Q2FsZW5kYXIgKCkge1xuICAgIGNsYXNzZXMucmVtb3ZlKGNvbnRhaW5lciwgby5zdHlsZXMuaGlkZGVuQ29udGFpbmVyQ2xhc3MpO1xuICAgIGNsYXNzZXMuYWRkKGNvbnRhaW5lciwgby5zdHlsZXMudmlzaWJsZUNvbnRhaW5lckNsYXNzKTtcbiAgICBhcGkuZW1pdCgnc2hvdycpO1xuICB9XG4gIGZ1bmN0aW9uIGhpZGVDYWxlbmRhciAoKSB7XG4gICAgY2xhc3Nlcy5hZGQoY29udGFpbmVyLCBvLnN0eWxlcy5oaWRkZW5Db250YWluZXJDbGFzcyk7XG4gICAgY2xhc3Nlcy5yZW1vdmUoY29udGFpbmVyLCBvLnN0eWxlcy52aXNpYmxlQ29udGFpbmVyQ2xhc3MpO1xuICAgIGFwaS5lbWl0KCdoaWRlJyk7IH1cblxuICBmdW5jdGlvbiBzaG93ICgpIHtcbiAgICByZW5kZXIoKTtcbiAgICByZWZyZXNoKCk7XG4gICAgdG9nZ2xlVGltZUxpc3QoIW8uZGF0ZSk7XG4gICAgc2hvd0NhbGVuZGFyKCk7XG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZGUgKCkge1xuICAgIGhpZGVUaW1lTGlzdCgpO1xuICAgIHJhZihoaWRlQ2FsZW5kYXIpO1xuICAgIHJldHVybiBhcGk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWdobGlnaHQgKGRhdGVzKSB7XG4gICAgaW50ZXJ2YWxEYXRlcyA9IGRhdGVzO1xuICAgIHVwZGF0ZSh0cnVlKTtcbiAgICByZXR1cm4gYXBpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlkZUNvbmRpdGlvbmFsbHkgKCkge1xuICAgIGhpZGVUaW1lTGlzdCgpO1xuXG4gICAgdmFyIHBvcyA9IGNsYXNzZXMuY29udGFpbnMoY29udGFpbmVyLCBvLnN0eWxlcy5wb3NpdGlvbmVkKTtcbiAgICBpZiAocG9zKSB7XG4gICAgICByYWYoaGlkZUNhbGVuZGFyKTtcbiAgICB9XG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGVuZGFyRXZlbnRUYXJnZXQgKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKHRhcmdldCA9PT0gby50cmlnZ2VyIHx8IGlzRGVzY2VuZGFudChvLnRyaWdnZXIsIHRhcmdldCkgfHwgaXNEZXNjZW5kYW50KGNvbnRhaW5lciwgdGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgPT09IGFwaS5hc3NvY2lhdGVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlT25CbHVyIChlKSB7XG4gICAgaWYgKGNhbGVuZGFyRXZlbnRUYXJnZXQoZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGlkZUNvbmRpdGlvbmFsbHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZGVPbkNsaWNrIChlKSB7XG4gICAgaWYgKGNhbGVuZGFyRXZlbnRUYXJnZXQoZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGlkZUNvbmRpdGlvbmFsbHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRGVzY2VuZGFudChwYXJlbnQsIGNoaWxkKSB7XG4gICAgIHZhciBub2RlID0gY2hpbGQucGFyZW50Tm9kZTtcbiAgICAgd2hpbGUgKG5vZGUgIT0gbnVsbCkge1xuICAgICAgaWYgKG5vZGUgPT0gcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgfVxuICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBzdWJ0cmFjdE1vbnRoICgpIHsgY2hhbmdlTW9udGgoJ3N1YnRyYWN0Jyk7IH1cbiAgZnVuY3Rpb24gYWRkTW9udGggKCkgeyBjaGFuZ2VNb250aCgnYWRkJyk7IH1cbiAgZnVuY3Rpb24gY2hhbmdlTW9udGggKG9wKSB7XG4gICAgdmFyIGJvdW5kO1xuICAgIHZhciBkaXJlY3Rpb24gPSBvcCA9PT0gJ2FkZCcgPyAtMSA6IDE7XG4gICAgdmFyIG9mZnNldCA9IG8ubW9udGhzSW5DYWxlbmRhciArIGRpcmVjdGlvbiAqIGdldE1vbnRoT2Zmc2V0KGxhc3REYXlFbGVtZW50KTtcbiAgICByZWZDYWxbb3BdKCdtb250aHMnLCBvZmZzZXQpO1xuICAgIGJvdW5kID0gaW5SYW5nZShyZWZDYWwuY2xvbmUoKSk7XG4gICAgcmVmID0gYm91bmQgfHwgcmVmO1xuICAgIGlmIChib3VuZCkgeyByZWZDYWwgPSBib3VuZC5jbG9uZSgpOyB9XG4gICAgdXBkYXRlKCFvLmF1dG9TZWxlY3REYXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZSAoc2lsZW50KSB7XG4gICAgdXBkYXRlQ2FsZW5kYXIoKTtcbiAgICB1cGRhdGVUaW1lKCk7XG4gICAgaWYgKHNpbGVudCAhPT0gdHJ1ZSkgeyBlbWl0VmFsdWVzKCk7IH1cbiAgICBkaXNwbGF5VmFsaWRUaW1lc09ubHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhbGVuZGFyICgpIHtcbiAgICBpZiAoIW8uZGF0ZSB8fCAhcmVuZGVyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHkgPSByZWZDYWwueWVhcigpO1xuICAgIHZhciBtID0gcmVmQ2FsLm1vbnRoKCk7XG4gICAgdmFyIGQgPSByZWZDYWwuZGF0ZSgpO1xuICAgIGlmIChkID09PSBsYXN0RGF5ICYmIG0gPT09IGxhc3RNb250aCAmJiB5ID09PSBsYXN0WWVhcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY2FuU3RheSA9IGlzRGlzcGxheWVkKCk7XG4gICAgbGFzdERheSA9IHJlZkNhbC5kYXRlKCk7XG4gICAgbGFzdE1vbnRoID0gcmVmQ2FsLm1vbnRoKCk7XG4gICAgbGFzdFllYXIgPSByZWZDYWwueWVhcigpO1xuICAgIGlmIChjYW5TdGF5KSB7IHVwZGF0ZUNhbGVuZGFyU2VsZWN0aW9uKCk7IHJldHVybjsgfVxuICAgIGNhbGVuZGFyTW9udGhzLmZvckVhY2godXBkYXRlTW9udGgpO1xuICAgIHJlbmRlckFsbERheXMoKTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vbnRoIChtb250aCwgaSkge1xuICAgICAgdmFyIG9mZnNldENhbCA9IHJlZkNhbC5jbG9uZSgpLmFkZChpLCAnbW9udGhzJyk7XG4gICAgICB0ZXh0KG1vbnRoLmxhYmVsLCBvZmZzZXRDYWwuZm9ybWF0KG8ubW9udGhGb3JtYXQpKTtcbiAgICAgIHJlbW92ZUNoaWxkcmVuKG1vbnRoLmJvZHkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhbGVuZGFyU2VsZWN0aW9uICgpIHtcbiAgICB2YXIgZGF5ID0gcmVmQ2FsLmRhdGUoKSAtIDE7XG4gICAgLy8gc2VsZWN0RGF5RWxlbWVudChmYWxzZSk7XG4gICAgY2FsZW5kYXJNb250aHMuZm9yRWFjaChmdW5jdGlvbiAoY2FsKSB7XG4gICAgICB2YXIgZGF5cztcbiAgICAgIGlmIChzYW1lQ2FsZW5kYXJNb250aChjYWwuZGF0ZSwgcmVmQ2FsKSkge1xuICAgICAgICBkYXlzID0gY2FzdChjYWwuYm9keS5jaGlsZHJlbikubWFwKGFnZ3JlZ2F0ZSk7XG4gICAgICAgIGRheXMgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBkYXlzKS5maWx0ZXIoaW5zaWRlKTtcbiAgICAgICAgLy8gc2VsZWN0RGF5RWxlbWVudChkYXlzW2RheV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gY2FzdCAobGlrZSkge1xuICAgICAgdmFyIGRlc3QgPSBbXTtcbiAgICAgIHZhciBpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxpa2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVzdC5wdXNoKGxpa2VbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWdncmVnYXRlIChjaGlsZCkge1xuICAgICAgcmV0dXJuIGNhc3QoY2hpbGQuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2lkZSAoY2hpbGQpIHtcbiAgICAgIHJldHVybiAhY2xhc3Nlcy5jb250YWlucyhjaGlsZCwgby5zdHlsZXMuZGF5UHJldk1vbnRoKSAmJlxuICAgICAgICAgICAgICFjbGFzc2VzLmNvbnRhaW5zKGNoaWxkLCBvLnN0eWxlcy5kYXlOZXh0TW9udGgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRGlzcGxheWVkICgpIHtcbiAgICByZXR1cm4gY2FsZW5kYXJNb250aHMuc29tZShtYXRjaGVzKTtcblxuICAgIGZ1bmN0aW9uIG1hdGNoZXMgKGNhbCkge1xuICAgICAgaWYgKCFsYXN0WWVhcikgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIHJldHVybiBzYW1lQ2FsZW5kYXJNb250aChjYWwuZGF0ZSwgcmVmQ2FsKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYW1lQ2FsZW5kYXJNb250aCAobGVmdCwgcmlnaHQpIHtcbiAgICByZXR1cm4gbGVmdCAmJiByaWdodCAmJiBsZWZ0LnllYXIoKSA9PT0gcmlnaHQueWVhcigpICYmIGxlZnQubW9udGgoKSA9PT0gcmlnaHQubW9udGgoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVRpbWUgKCkge1xuICAgIGlmICghby50aW1lIHx8ICFyZW5kZXJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0ZXh0KHRpbWUsIHJlZi5mb3JtYXQoby50aW1lRm9ybWF0KSk7XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0VmFsdWVzICgpIHtcbiAgICBzdG9yZURhdGUoKTtcbiAgICBhcGkuZW1pdCgnZGF0YScsIGdldERhdGVTdHJpbmcoKSk7XG4gICAgYXBpLmVtaXQoJ3llYXInLCByZWYueWVhcigpKTtcbiAgICBhcGkuZW1pdCgnbW9udGgnLCByZWYubW9udGgoKSk7XG4gICAgYXBpLmVtaXQoJ2RheScsIHJlZi5kYXkoKSk7XG4gICAgYXBpLmVtaXQoJ3RpbWUnLCByZWYuZm9ybWF0KG8udGltZUZvcm1hdCkpO1xuXG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3JlRGF0ZSAoKSB7XG4gICAgc2VsZWN0ZWRNb250aCA9IHJlZi5tb250aCgpO1xuICAgIHNlbGVjdGVkWWVhciA9IHJlZi55ZWFyKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZWZyZXNoICgpIHtcbiAgICBsYXN0WWVhciA9IGZhbHNlO1xuICAgIGxhc3RNb250aCA9IGZhbHNlO1xuICAgIGxhc3REYXkgPSBmYWxzZTtcbiAgICB1cGRhdGUodHJ1ZSk7XG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFZhbHVlICh2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gcGFyc2UodmFsdWUsIG8uaW5wdXRGb3JtYXQpO1xuICAgIGlmIChkYXRlID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlZiA9IGluUmFuZ2UoZGF0ZSkgfHwgcmVmO1xuICAgIHJlZkNhbCA9IHJlZi5jbG9uZSgpO1xuICAgIHVwZGF0ZSh0cnVlKTtcblxuICAgIHJldHVybiBhcGk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbiAoZWxlbSwgc2VsZikge1xuICAgIHdoaWxlIChlbGVtICYmIGVsZW0uZmlyc3RDaGlsZCkge1xuICAgICAgZWxlbS5yZW1vdmVDaGlsZChlbGVtLmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBpZiAoc2VsZiA9PT0gdHJ1ZSkge1xuICAgICAgZWxlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckFsbERheXMgKCkge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBvLm1vbnRoc0luQ2FsZW5kYXI7IGkrKykge1xuICAgICAgcmVuZGVyRGF5cyhpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJEYXlzIChvZmZzZXQpIHtcbiAgICB2YXIgbW9udGggPSBjYWxlbmRhck1vbnRoc1tvZmZzZXRdO1xuICAgIHZhciBvZmZzZXRDYWwgPSByZWZDYWwuY2xvbmUoKS5hZGQob2Zmc2V0LCAnbW9udGhzJyk7XG4gICAgdmFyIHRvdGFsID0gb2Zmc2V0Q2FsLmRheXNJbk1vbnRoKCk7XG4gICAgdmFyIGN1cnJlbnQgPSBvZmZzZXRDYWwubW9udGgoKSAhPT0gcmVmLm1vbnRoKCkgPyAtMSA6IHJlZi5kYXRlKCk7IC8vIC0xIDogMS4uMzFcbiAgICB2YXIgZmlyc3QgPSBvZmZzZXRDYWwuY2xvbmUoKS5kYXRlKDEpO1xuICAgIHZhciBmaXJzdERheSA9IHdlZWtkYXkoZmlyc3QuZGF5KCksIHRydWUpOyAvLyAwLi42XG4gICAgdmFyIHRyID0gZG9tKHsgdHlwZTogJ3RyJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlSb3csIHBhcmVudDogbW9udGguYm9keSB9KTtcbiAgICB2YXIgcHJldk1vbnRoID0gaGlkZGVuV2hlbihvZmZzZXQgIT09IDAsIFtvLnN0eWxlcy5kYXlCb2R5RWxlbSwgby5zdHlsZXMuZGF5UHJldk1vbnRoXSk7XG4gICAgdmFyIG5leHRNb250aCA9IGhpZGRlbldoZW4ob2Zmc2V0ICE9PSBvLm1vbnRoc0luQ2FsZW5kYXIgLSAxLCBbby5zdHlsZXMuZGF5Qm9keUVsZW0sIG8uc3R5bGVzLmRheU5leHRNb250aF0pO1xuICAgIHZhciBkaXNhYmxlZCA9IG8uc3R5bGVzLmRheURpc2FibGVkO1xuICAgIHZhciBsYXN0RGF5O1xuXG4gICAgcGFydCh7XG4gICAgICBiYXNlOiBmaXJzdC5jbG9uZSgpLnN1YnRyYWN0KGZpcnN0RGF5LCAnZGF5cycpLFxuICAgICAgbGVuZ3RoOiBmaXJzdERheSxcbiAgICAgIGNlbGw6IHByZXZNb250aFxuICAgIH0pO1xuXG4gICAgcGFydCh7XG4gICAgICBiYXNlOiBmaXJzdC5jbG9uZSgpLFxuICAgICAgbGVuZ3RoOiB0b3RhbCxcbiAgICAgIGNlbGw6IFtvLnN0eWxlcy5kYXlCb2R5RWxlbV0sXG4gICAgICBzZWxlY3RhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBsYXN0RGF5ID0gZmlyc3QuY2xvbmUoKS5hZGQodG90YWwsICdkYXlzJyk7XG5cbiAgICBwYXJ0KHtcbiAgICAgIGJhc2U6IGxhc3REYXksXG4gICAgICBsZW5ndGg6IHdlZWtkYXlDb3VudCAtIHRyLmNoaWxkcmVuLmxlbmd0aCxcbiAgICAgIGNlbGw6IG5leHRNb250aFxuICAgIH0pO1xuXG4gICAgYmFjay5kaXNhYmxlZCA9ICFpc0luUmFuZ2UoZmlyc3QsIHRydWUpO1xuICAgIG5leHQuZGlzYWJsZWQgPSAhaXNJblJhbmdlKGxhc3REYXksIHRydWUpO1xuICAgIG1vbnRoLmRhdGUgPSBvZmZzZXRDYWwuY2xvbmUoKTtcblxuICAgIGZ1bmN0aW9uIHBhcnQgKGRhdGEpIHtcbiAgICAgIHZhciBpLCBkYXksIG5vZGU7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHIuY2hpbGRyZW4ubGVuZ3RoID09PSB3ZWVrZGF5Q291bnQpIHtcbiAgICAgICAgICB0ciA9IGRvbSh7IHR5cGU6ICd0cicsIGNsYXNzTmFtZTogby5zdHlsZXMuZGF5Um93LCBwYXJlbnQ6IG1vbnRoLmJvZHkgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZGF5ID0gZGF0YS5iYXNlLmNsb25lKCkuYWRkKGksICdkYXlzJyk7XG4gICAgICAgIG5vZGUgPSBkb20oe1xuICAgICAgICAgIHR5cGU6ICd0ZCcsXG4gICAgICAgICAgcGFyZW50OiB0cixcbiAgICAgICAgICB0ZXh0OiBkYXkuZm9ybWF0KG8uZGF5Rm9ybWF0KSxcbiAgICAgICAgICBjbGFzc05hbWU6IHZhbGlkYXRpb25UZXN0KGRheSwgZGF0YS5jZWxsLmpvaW4oJyAnKS5zcGxpdCgnICcpKS5qb2luKCcgJylcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGlvblRlc3QgKGRheSwgY2VsbCkge1xuICAgICAgaWYgKGludGVydmFsRGF0ZXNbMF0gIT09IG51bGwgJiYgaW50ZXJ2YWxEYXRlc1sxXSAhPT0gbnVsbCApe1xuICAgICAgICBkYXkgPSBkYXkuc3RhcnRPZignZGF5Jyk7XG4gICAgICAgIGlmIChkYXkuaXNBZnRlcihpbnRlcnZhbERhdGVzWzBdKSAmJiBkYXkuaXNCZWZvcmUoaW50ZXJ2YWxEYXRlc1sxXSkpIHtcbiAgICAgICAgICBjZWxsLnB1c2goJ3JkLWRheS1zZWxlY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXkuZGlmZihpbnRlcnZhbERhdGVzWzBdLCAnZGF5cycpID09PSAwICB8fCBpbnRlcnZhbERhdGVzWzFdLmRpZmYoZGF5LCAnZGF5cycpID09PSAwKSB7XG4gICAgICAgICAgY2VsbC5wdXNoKCdyZC1kYXktc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpc0luUmFuZ2UoZGF5LCB0cnVlLCBvLmRhdGVWYWxpZGF0b3IpKSB7IGNlbGwucHVzaChkaXNhYmxlZCk7IH1cbiAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpZGRlbldoZW4gKHZhbHVlLCBjZWxsKSB7XG4gICAgICBpZiAodmFsdWUpIHsgY2VsbC5wdXNoKG8uc3R5bGVzLmRheUNvbmNlYWxlZCk7IH1cbiAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5SYW5nZSAoZGF0ZSwgYWxsZGF5LCB2YWxpZGF0b3IpIHtcbiAgICB2YXIgbWluID0gIW8ubWluID8gZmFsc2UgOiAoYWxsZGF5ID8gby5taW4uY2xvbmUoKS5zdGFydE9mKCdkYXknKSA6IG8ubWluKTtcbiAgICB2YXIgbWF4ID0gIW8ubWF4ID8gZmFsc2UgOiAoYWxsZGF5ID8gby5tYXguY2xvbmUoKS5lbmRPZignZGF5JykgOiBvLm1heCk7XG4gICAgaWYgKG1pbiAmJiBkYXRlLmlzQmVmb3JlKG1pbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG1heCAmJiBkYXRlLmlzQWZ0ZXIobWF4KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgdmFsaWQgPSAodmFsaWRhdG9yIHx8IEZ1bmN0aW9uLnByb3RvdHlwZSkuY2FsbChhcGksIGRhdGUudG9EYXRlKCkpO1xuICAgIHJldHVybiB2YWxpZCAhPT0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBpblJhbmdlIChkYXRlKSB7XG4gICAgaWYgKG8ubWluICYmIGRhdGUuaXNCZWZvcmUoby5taW4pKSB7XG4gICAgICByZXR1cm4gaW5SYW5nZShvLm1pbi5jbG9uZSgpKTtcbiAgICB9IGVsc2UgaWYgKG8ubWF4ICYmIGRhdGUuaXNBZnRlcihvLm1heCkpIHtcbiAgICAgIHJldHVybiBpblJhbmdlKG8ubWF4LmNsb25lKCkpO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSBkYXRlLmNsb25lKCkuc3VidHJhY3QoMSwgJ2RheXMnKTtcbiAgICBpZiAodmFsaWRhdGVUb3dhcmRzKHZhbHVlLCBkYXRlLCAnYWRkJykpIHtcbiAgICAgIHJldHVybiBpblRpbWVSYW5nZSh2YWx1ZSk7XG4gICAgfVxuICAgIHZhbHVlID0gZGF0ZS5jbG9uZSgpO1xuICAgIGlmICh2YWxpZGF0ZVRvd2FyZHModmFsdWUsIGRhdGUsICdzdWJ0cmFjdCcpKSB7XG4gICAgICByZXR1cm4gaW5UaW1lUmFuZ2UodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluVGltZVJhbmdlICh2YWx1ZSkge1xuICAgIHZhciBjb3B5ID0gdmFsdWUuY2xvbmUoKS5zdWJ0cmFjdChvLnRpbWVJbnRlcnZhbCwgJ3NlY29uZHMnKTtcbiAgICB2YXIgdGltZXMgPSBNYXRoLmNlaWwoc2Vjb25kc0luRGF5IC8gby50aW1lSW50ZXJ2YWwpO1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aW1lczsgaSsrKSB7XG4gICAgICBjb3B5LmFkZChvLnRpbWVJbnRlcnZhbCwgJ3NlY29uZHMnKTtcbiAgICAgIGlmIChjb3B5LmRhdGUoKSA+IHZhbHVlLmRhdGUoKSkge1xuICAgICAgICBjb3B5LnN1YnRyYWN0KDEsICdkYXlzJyk7XG4gICAgICB9XG4gICAgICBpZiAoby50aW1lVmFsaWRhdG9yLmNhbGwoYXBpLCBjb3B5LnRvRGF0ZSgpKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVUb3dhcmRzICh2YWx1ZSwgZGF0ZSwgb3ApIHtcbiAgICB2YXIgdmFsaWQgPSBmYWxzZTtcbiAgICB3aGlsZSAodmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICB2YWx1ZVtvcF0oMSwgJ2RheXMnKTtcbiAgICAgIGlmICh2YWx1ZS5tb250aCgpICE9PSBkYXRlLm1vbnRoKCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YWxpZCA9IG8uZGF0ZVZhbGlkYXRvci5jYWxsKGFwaSwgdmFsdWUudG9EYXRlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQgIT09IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gcGlja0RheSAoZSkge1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICBpZiAoY2xhc3Nlcy5jb250YWlucyh0YXJnZXQsIG8uc3R5bGVzLmRheURpc2FibGVkKSB8fCAhY2xhc3Nlcy5jb250YWlucyh0YXJnZXQsIG8uc3R5bGVzLmRheUJvZHlFbGVtKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZGF5ID0gcGFyc2VJbnQodGV4dCh0YXJnZXQpLCAxMCk7XG4gICAgdmFyIHByZXYgPSBjbGFzc2VzLmNvbnRhaW5zKHRhcmdldCwgby5zdHlsZXMuZGF5UHJldk1vbnRoKTtcbiAgICB2YXIgbmV4dCA9IGNsYXNzZXMuY29udGFpbnModGFyZ2V0LCBvLnN0eWxlcy5kYXlOZXh0TW9udGgpO1xuICAgIHZhciBvZmZzZXQgPSBnZXRNb250aE9mZnNldCh0YXJnZXQpIC0gZ2V0TW9udGhPZmZzZXQobGFzdERheUVsZW1lbnQpO1xuICAgIHJlZi5hZGQob2Zmc2V0LCAnbW9udGhzJyk7XG4gICAgaWYgKHByZXYgfHwgbmV4dCkge1xuICAgICAgcmVmLmFkZChwcmV2ID8gLTEgOiAxLCAnbW9udGhzJyk7XG4gICAgfVxuICAgIC8vIHNlbGVjdERheUVsZW1lbnQodGFyZ2V0KTtcbiAgICByZWYuZGF0ZShkYXkpOyAvLyBtdXN0IHJ1biBhZnRlciBzZXR0aW5nIHRoZSBtb250aFxuICAgIHNldFRpbWUocmVmLCBpblJhbmdlKHJlZikgfHwgcmVmKTtcbiAgICByZWZDYWwgPSByZWYuY2xvbmUoKTtcbiAgICBpZiAoby5hdXRvQ2xvc2UpIHsgaGlkZUNvbmRpdGlvbmFsbHkoKTsgfVxuICAgIHVwZGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VsZWN0RGF5RWxlbWVudCAobm9kZSkge1xuICAgIGlmIChub2RlKSB7XG4gICAgICBjbGFzc2VzLmFkZChub2RlLCBvLnN0eWxlcy5zZWxlY3RlZERheSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TW9udGhPZmZzZXQgKGVsZW0pIHtcbiAgICB2YXIgb2Zmc2V0O1xuICAgIHdoaWxlIChlbGVtICYmIGVsZW0uZ2V0QXR0cmlidXRlKSB7XG4gICAgICBvZmZzZXQgPSBlbGVtLmdldEF0dHJpYnV0ZShtb250aE9mZnNldEF0dHJpYnV0ZSk7XG4gICAgICBpZiAodHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KG9mZnNldCwgMTApO1xuICAgICAgfVxuICAgICAgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRUaW1lICh0bywgZnJvbSkge1xuICAgIHRvLmhvdXIoZnJvbS5ob3VyKCkpLm1pbnV0ZShmcm9tLm1pbnV0ZSgpKS5zZWNvbmQoZnJvbS5zZWNvbmQoKSk7XG4gICAgcmV0dXJuIHRvO1xuICB9XG5cbiAgZnVuY3Rpb24gcGlja1RpbWUgKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKCFjbGFzc2VzLmNvbnRhaW5zKHRhcmdldCwgby5zdHlsZXMudGltZU9wdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gbW9tZW50dW0ubW9tZW50KHRleHQodGFyZ2V0KSwgby50aW1lRm9ybWF0KTtcbiAgICBzZXRUaW1lKHJlZiwgdmFsdWUpO1xuICAgIHJlZkNhbCA9IHJlZi5jbG9uZSgpO1xuICAgIGVtaXRWYWx1ZXMoKTtcbiAgICB1cGRhdGVUaW1lKCk7XG4gICAgaWYgKCFvLmRhdGUgJiYgby5hdXRvQ2xvc2UpIHtcbiAgICAgIGhpZGVDb25kaXRpb25hbGx5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpZGVUaW1lTGlzdCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERhdGUgKCkge1xuICAgIHJldHVybiByZWYudG9EYXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXREYXRlU3RyaW5nIChmb3JtYXQpIHtcbiAgICByZXR1cm4gcmVmLmZvcm1hdChmb3JtYXQgfHwgby5pbnB1dEZvcm1hdCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNb21lbnQgKCkge1xuICAgIHJldHVybiByZWYuY2xvbmUoKTtcbiAgfVxuXG4gIHJldHVybiBhcGk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FsZW5kYXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0cmltID0gL15cXHMrfFxccyskL2c7XG52YXIgd2hpdGVzcGFjZSA9IC9cXHMrLztcblxuZnVuY3Rpb24gY2xhc3NlcyAobm9kZSkge1xuICBpZiAodHlwZW9mIG5vZGUuY2xhc3NOYW1lID09ICdzdHJpbmcnKXtcbiAgICByZXR1cm4gbm9kZS5jbGFzc05hbWUucmVwbGFjZSh0cmltLCAnJykuc3BsaXQod2hpdGVzcGFjZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0IChub2RlLCB2YWx1ZSkge1xuICBub2RlLmNsYXNzTmFtZSA9IHZhbHVlLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gYWRkIChub2RlLCB2YWx1ZSkge1xuICB2YXIgdmFsdWVzID0gcmVtb3ZlKG5vZGUsIHZhbHVlKTtcbiAgdmFsdWVzLnB1c2godmFsdWUpO1xuICBzZXQobm9kZSwgdmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlIChub2RlLCB2YWx1ZSkge1xuICB2YXIgdmFsdWVzID0gY2xhc3Nlcyhub2RlKTtcbiAgdmFyIGkgPSB2YWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gIGlmIChpICE9PSAtMSkge1xuICAgIHZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgc2V0KG5vZGUsIHZhbHVlcyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZnVuY3Rpb24gY29udGFpbnMgKG5vZGUsIHZhbHVlKSB7XG4gIGlmICghY2xhc3Nlcyhub2RlKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuIGNsYXNzZXMobm9kZSkuaW5kZXhPZih2YWx1ZSkgIT09IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGQsXG4gIHJlbW92ZTogcmVtb3ZlLFxuICBjb250YWluczogY29udGFpbnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtb21lbnR1bSA9IHJlcXVpcmUoJy4vbW9tZW50dW0nKTtcblxuLy8gbmHDr3ZlIGltcGxlbWVudGF0aW9uLCBzcGVjaWZpY2FsbHkgbWVhbnQgdG8gY2xvbmUgYG9wdGlvbnNgIG9iamVjdHNcbmZ1bmN0aW9uIGNsb25lICh0aGluZykge1xuICB2YXIgY29weSA9IHt9O1xuICB2YXIgdmFsdWU7XG5cbiAgZm9yICh2YXIga2V5IGluIHRoaW5nKSB7XG4gICAgdmFsdWUgPSB0aGluZ1trZXldO1xuXG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgY29weVtrZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChtb21lbnR1bS5pc01vbWVudCh2YWx1ZSkpIHtcbiAgICAgIGNvcHlba2V5XSA9IHZhbHVlLmNsb25lKCk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5faXNTdHlsZXNDb25maWd1cmF0aW9uKSB7XG4gICAgICBjb3B5W2tleV0gPSBjbG9uZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb3B5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5kZXggPSByZXF1aXJlKCcuL2luZGV4Jyk7XG52YXIgaW5wdXQgPSByZXF1aXJlKCcuL2lucHV0Jyk7XG52YXIgaW5saW5lID0gcmVxdWlyZSgnLi9pbmxpbmUnKTtcbnZhciBpc0lucHV0ID0gcmVxdWlyZSgnLi9pc0lucHV0Jyk7XG5cbmZ1bmN0aW9uIGNvcmUgKGVsZW0sIG9wdGlvbnMpIHtcbiAgdmFyIGNhbDtcbiAgdmFyIGV4aXN0aW5nID0gaW5kZXguZmluZChlbGVtKTtcbiAgaWYgKGV4aXN0aW5nKSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nO1xuICB9XG5cbiAgaWYgKGlzSW5wdXQoZWxlbSkpIHtcbiAgICBjYWwgPSBpbnB1dChlbGVtLCBvcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICBjYWwgPSBpbmxpbmUoZWxlbSwgb3B0aW9ucyk7XG4gIH1cbiAgY2FsLmFzc29jaWF0ZWQgPSBlbGVtO1xuICBpbmRleC5hc3NpZ24oZWxlbSwgY2FsKTtcblxuICByZXR1cm4gY2FsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKTtcbnZhciBpc0lucHV0ID0gcmVxdWlyZSgnLi9pc0lucHV0Jyk7XG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG5cbmZ1bmN0aW9uIGRlZmF1bHRzIChvcHRpb25zLCBjYWwpIHtcbiAgdmFyIHRlbXA7XG4gIHZhciBubztcbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoby5hdXRvSGlkZU9uQ2xpY2sgPT09IG5vKSB7IG8uYXV0b0hpZGVPbkNsaWNrID0gdHJ1ZTsgfVxuICBpZiAoby5hdXRvSGlkZU9uQmx1ciA9PT0gbm8pIHsgby5hdXRvSGlkZU9uQmx1ciA9IHRydWU7IH1cbiAgaWYgKG8uYXV0b0Nsb3NlID09PSBubykgeyBvLmF1dG9DbG9zZSA9IHRydWU7IH1cbiAgaWYgKG8uYXV0b1NlbGVjdERhdGUgPT09IG5vKSB7IG8uYXV0b1NlbGVjdERhdGUgPSB0cnVlOyB9XG4gIGlmIChvLmFwcGVuZFRvID09PSBubykgeyBvLmFwcGVuZFRvID0gZG9jdW1lbnQuYm9keTsgfVxuICBpZiAoby5hcHBlbmRUbyA9PT0gJ3BhcmVudCcpIHtcbiAgICBpZiAoaXNJbnB1dChjYWwuYXNzb2NpYXRlZCkpIHtcbiAgICAgIG8uYXBwZW5kVG8gPSBjYWwuYXNzb2NpYXRlZC5wYXJlbnROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lubGluZSBjYWxlbmRhcnMgbXVzdCBiZSBhcHBlbmRlZCB0byBhIHBhcmVudCBub2RlIGV4cGxpY2l0bHkuJyk7XG4gICAgfVxuICB9XG4gIGlmIChvLmludmFsaWRhdGUgPT09IG5vKSB7IG8uaW52YWxpZGF0ZSA9IHRydWU7IH1cbiAgaWYgKG8ucmVxdWlyZWQgPT09IG5vKSB7IG8ucmVxdWlyZWQgPSBmYWxzZTsgfVxuICBpZiAoby5kYXRlID09PSBubykgeyBvLmRhdGUgPSB0cnVlOyB9XG4gIGlmIChvLnRpbWUgPT09IG5vKSB7IG8udGltZSA9IHRydWU7IH1cbiAgaWYgKG8uZGF0ZSA9PT0gZmFsc2UgJiYgby50aW1lID09PSBmYWxzZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0F0IGxlYXN0IG9uZSBvZiBgZGF0ZWAgb3IgYHRpbWVgIG11c3QgYmUgYHRydWVgLicpOyB9XG4gIGlmIChvLmlucHV0Rm9ybWF0ID09PSBubykge1xuICAgIGlmIChvLmRhdGUgJiYgby50aW1lKSB7XG4gICAgICBvLmlucHV0Rm9ybWF0ID0gJ1lZWVktTU0tREQgSEg6bW0nO1xuICAgIH0gZWxzZSBpZiAoby5kYXRlKSB7XG4gICAgICBvLmlucHV0Rm9ybWF0ID0gJ1lZWVktTU0tREQnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvLmlucHV0Rm9ybWF0ID0gJ0hIOm1tJztcbiAgICB9XG4gIH1cbiAgaWYgKG8uaW5pdGlhbFZhbHVlID09PSBubykge1xuICAgIG8uaW5pdGlhbFZhbHVlID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBvLmluaXRpYWxWYWx1ZSA9IHBhcnNlKG8uaW5pdGlhbFZhbHVlLCBvLmlucHV0Rm9ybWF0KTtcbiAgfVxuICBpZiAoby5taW4gPT09IG5vKSB7IG8ubWluID0gbnVsbDsgfSBlbHNlIHsgby5taW4gPSBwYXJzZShvLm1pbiwgby5pbnB1dEZvcm1hdCk7IH1cbiAgaWYgKG8ubWF4ID09PSBubykgeyBvLm1heCA9IG51bGw7IH0gZWxzZSB7IG8ubWF4ID0gcGFyc2Uoby5tYXgsIG8uaW5wdXRGb3JtYXQpOyB9XG4gIGlmIChvLnRpbWVJbnRlcnZhbCA9PT0gbm8pIHsgby50aW1lSW50ZXJ2YWwgPSA2MCAqIDMwOyB9IC8vIDMwIG1pbnV0ZXMgYnkgZGVmYXVsdFxuICBpZiAoby5taW4gJiYgby5tYXgpIHtcbiAgICBpZiAoby5tYXguaXNCZWZvcmUoby5taW4pKSB7XG4gICAgICB0ZW1wID0gby5tYXg7XG4gICAgICBvLm1heCA9IG8ubWluO1xuICAgICAgby5taW4gPSB0ZW1wO1xuICAgIH1cbiAgICBpZiAoby5kYXRlID09PSB0cnVlKSB7XG4gICAgICBpZiAoby5tYXguY2xvbmUoKS5zdWJ0cmFjdCgxLCAnZGF5cycpLmlzQmVmb3JlKG8ubWluKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BtYXhgIG11c3QgYmUgYXQgbGVhc3Qgb25lIGRheSBhZnRlciBgbWluYCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoby50aW1lSW50ZXJ2YWwgKiAxMDAwIC0gby5taW4gJSAoby50aW1lSW50ZXJ2YWwgKiAxMDAwKSA+IG8ubWF4IC0gby5taW4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYG1pbmAgdG8gYG1heGAgcmFuZ2UgbXVzdCBhbGxvdyBmb3IgYXQgbGVhc3Qgb25lIHRpbWUgb3B0aW9uIHRoYXQgbWF0Y2hlcyBgdGltZUludGVydmFsYCcpO1xuICAgIH1cbiAgfVxuICBpZiAoby5kYXRlVmFsaWRhdG9yID09PSBubykgeyBvLmRhdGVWYWxpZGF0b3IgPSBGdW5jdGlvbi5wcm90b3R5cGU7IH1cbiAgaWYgKG8udGltZVZhbGlkYXRvciA9PT0gbm8pIHsgby50aW1lVmFsaWRhdG9yID0gRnVuY3Rpb24ucHJvdG90eXBlOyB9XG4gIGlmIChvLnRpbWVGb3JtYXQgPT09IG5vKSB7IG8udGltZUZvcm1hdCA9ICdISDptbSc7IH1cbiAgaWYgKG8ud2Vla1N0YXJ0ID09PSBubykgeyBvLndlZWtTdGFydCA9IG1vbWVudHVtLm1vbWVudCgpLndlZWtkYXkoMCkuZGF5KCk7IH1cbiAgaWYgKG8ud2Vla2RheUZvcm1hdCA9PT0gbm8pIHsgby53ZWVrZGF5Rm9ybWF0ID0gJ21pbic7IH1cbiAgaWYgKG8ud2Vla2RheUZvcm1hdCA9PT0gJ2xvbmcnKSB7XG4gICAgby53ZWVrZGF5Rm9ybWF0ID0gbW9tZW50dW0ubW9tZW50LndlZWtkYXlzKCk7XG4gIH0gZWxzZSBpZiAoby53ZWVrZGF5Rm9ybWF0ID09PSAnc2hvcnQnKSB7XG4gICAgby53ZWVrZGF5Rm9ybWF0ID0gbW9tZW50dW0ubW9tZW50LndlZWtkYXlzU2hvcnQoKTtcbiAgfSBlbHNlIGlmIChvLndlZWtkYXlGb3JtYXQgPT09ICdtaW4nKSB7XG4gICAgby53ZWVrZGF5Rm9ybWF0ID0gbW9tZW50dW0ubW9tZW50LndlZWtkYXlzTWluKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgd2Vla2RheXNgIG11c3QgYmUgYG1pbmAsIGBzaG9ydGAsIG9yIGBsb25nYCcpO1xuICB9XG4gIGlmIChvLm1vbnRoc0luQ2FsZW5kYXIgPT09IG5vKSB7IG8ubW9udGhzSW5DYWxlbmRhciA9IDE7IH1cbiAgaWYgKG8ubW9udGhGb3JtYXQgPT09IG5vKSB7IG8ubW9udGhGb3JtYXQgPSAnTU1NTSBZWVlZJzsgfVxuICBpZiAoby5kYXlGb3JtYXQgPT09IG5vKSB7IG8uZGF5Rm9ybWF0ID0gJ0REJzsgfVxuICBpZiAoby5zdHlsZXMgPT09IG5vKSB7IG8uc3R5bGVzID0ge307IH1cblxuICBvLnN0eWxlcy5faXNTdHlsZXNDb25maWd1cmF0aW9uID0gdHJ1ZTtcblxuICB2YXIgc3R5bCA9IG8uc3R5bGVzO1xuICBpZiAoc3R5bC5iYWNrID09PSBubykgeyBzdHlsLmJhY2sgPSAncmQtYmFjayc7IH1cbiAgaWYgKHN0eWwuY29udGFpbmVyID09PSBubykgeyBzdHlsLmNvbnRhaW5lciA9ICdyZC1jb250YWluZXInOyB9XG4gIGlmIChzdHlsLnBvc2l0aW9uZWQgPT09IG5vKSB7IHN0eWwucG9zaXRpb25lZCA9ICdyZC1jb250YWluZXItYXR0YWNobWVudCc7IH1cbiAgaWYgKHN0eWwuZGF0ZSA9PT0gbm8pIHsgc3R5bC5kYXRlID0gJ3JkLWRhdGUnOyB9XG4gIGlmIChzdHlsLmRheUJvZHkgPT09IG5vKSB7IHN0eWwuZGF5Qm9keSA9ICdyZC1kYXlzLWJvZHknOyB9XG4gIGlmIChzdHlsLmRheUJvZHlFbGVtID09PSBubykgeyBzdHlsLmRheUJvZHlFbGVtID0gJ3JkLWRheS1ib2R5JzsgfVxuICBpZiAoc3R5bC5kYXlQcmV2TW9udGggPT09IG5vKSB7IHN0eWwuZGF5UHJldk1vbnRoID0gJ3JkLWRheS1wcmV2LW1vbnRoJzsgfVxuICBpZiAoc3R5bC5kYXlOZXh0TW9udGggPT09IG5vKSB7IHN0eWwuZGF5TmV4dE1vbnRoID0gJ3JkLWRheS1uZXh0LW1vbnRoJzsgfVxuICBpZiAoc3R5bC5kYXlEaXNhYmxlZCA9PT0gbm8pIHsgc3R5bC5kYXlEaXNhYmxlZCA9ICdyZC1kYXktZGlzYWJsZWQnOyB9XG4gIGlmIChzdHlsLmRheUNvbmNlYWxlZCA9PT0gbm8pIHsgc3R5bC5kYXlDb25jZWFsZWQgPSAncmQtZGF5LWNvbmNlYWxlZCc7IH1cbiAgaWYgKHN0eWwuZGF5SGVhZCA9PT0gbm8pIHsgc3R5bC5kYXlIZWFkID0gJ3JkLWRheXMtaGVhZCc7IH1cbiAgaWYgKHN0eWwuZGF5SGVhZEVsZW0gPT09IG5vKSB7IHN0eWwuZGF5SGVhZEVsZW0gPSAncmQtZGF5LWhlYWQnOyB9XG4gIGlmIChzdHlsLmRheVJvdyA9PT0gbm8pIHsgc3R5bC5kYXlSb3cgPSAncmQtZGF5cy1yb3cnOyB9XG4gIGlmIChzdHlsLmRheVRhYmxlID09PSBubykgeyBzdHlsLmRheVRhYmxlID0gJ3JkLWRheXMnOyB9XG4gIGlmIChzdHlsLm1vbnRoID09PSBubykgeyBzdHlsLm1vbnRoID0gJ3JkLW1vbnRoJzsgfVxuICBpZiAoc3R5bC5tb250aExhYmVsID09PSBubykgeyBzdHlsLm1vbnRoTGFiZWwgPSAncmQtbW9udGgtbGFiZWwnOyB9XG4gIGlmIChzdHlsLm5leHQgPT09IG5vKSB7IHN0eWwubmV4dCA9ICdyZC1uZXh0JzsgfVxuICBpZiAoc3R5bC5zZWxlY3RlZERheSA9PT0gbm8pIHsgc3R5bC5zZWxlY3RlZERheSA9ICdyZC1kYXktc2VsZWN0ZWQnOyB9XG4gIGlmIChzdHlsLnNlbGVjdGVkVGltZSA9PT0gbm8pIHsgc3R5bC5zZWxlY3RlZFRpbWUgPSAncmQtdGltZS1zZWxlY3RlZCc7IH1cbiAgaWYgKHN0eWwudGltZSA9PT0gbm8pIHsgc3R5bC50aW1lID0gJ3JkLXRpbWUnOyB9XG4gIGlmIChzdHlsLnRpbWVMaXN0ID09PSBubykgeyBzdHlsLnRpbWVMaXN0ID0gJ3JkLXRpbWUtbGlzdCc7IH1cbiAgaWYgKHN0eWwudGltZU9wdGlvbiA9PT0gbm8pIHsgc3R5bC50aW1lT3B0aW9uID0gJ3JkLXRpbWUtb3B0aW9uJzsgfVxuXG4gIHJldHVybiBvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBkb20gKG9wdGlvbnMpIHtcbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoIW8udHlwZSkgeyBvLnR5cGUgPSAnZGl2JzsgfVxuICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoby50eXBlKTtcbiAgaWYgKG8uY2xhc3NOYW1lKSB7IGVsZW0uY2xhc3NOYW1lID0gby5jbGFzc05hbWU7IH1cbiAgaWYgKG8udGV4dCkgeyBlbGVtLmlubmVyVGV4dCA9IGVsZW0udGV4dENvbnRlbnQgPSBvLnRleHQ7IH1cbiAgaWYgKG8uaW5uZXJIVE1MKSB7IGVsZW0uaW5uZXJIVE1MID0gby5pbm5lckhUTUw7IH1cbiAgaWYgKG8uYXR0cmlidXRlcykge1xuICAgIE9iamVjdC5rZXlzKG8uYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGVsZW0uc2V0QXR0cmlidXRlKGtleSwgby5hdHRyaWJ1dGVzW2tleV0pO1xuICAgIH0pO1xuICB9XG4gIGlmIChvLnBhcmVudCkgeyBvLnBhcmVudC5hcHBlbmRDaGlsZChlbGVtKTsgfVxuICByZXR1cm4gZWxlbTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb207XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhZGRFdmVudCA9IGFkZEV2ZW50RWFzeTtcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcblxuaWYgKCF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICBhZGRFdmVudCA9IGFkZEV2ZW50SGFyZDtcbn1cblxuaWYgKCF3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50SGFyZDtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRFYXN5IChlbGVtZW50LCBldnQsIGZuKSB7XG4gIHJldHVybiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbik7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50SGFyZCAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZ0LCBmdW5jdGlvbiAoYWUpIHtcbiAgICB2YXIgZSA9IGFlIHx8IHdpbmRvdy5ldmVudDtcbiAgICBlLnRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBlLnByZXZlbnREZWZhdWx0ICA9IGUucHJldmVudERlZmF1bHQgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZm4uY2FsbChlbGVtZW50LCBlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgZm4pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2dCwgZm4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRFdmVudCxcbiAgcmVtb3ZlOiByZW1vdmVFdmVudFxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBubztcbnZhciBpa2V5ID0gJ2RhdGEtcm9tZS1pZCc7XG52YXIgaW5kZXggPSBbXTtcblxuZnVuY3Rpb24gZmluZCAodGhpbmcpIHsgLy8gY2FuIGJlIGEgRE9NIGVsZW1lbnQgb3IgYSBudW1iZXJcbiAgaWYgKHR5cGVvZiB0aGluZyAhPT0gJ251bWJlcicgJiYgdGhpbmcgJiYgdGhpbmcuZ2V0QXR0cmlidXRlKSB7XG4gICAgcmV0dXJuIGZpbmQodGhpbmcuZ2V0QXR0cmlidXRlKGlrZXkpKTtcbiAgfVxuICB2YXIgZXhpc3RpbmcgPSBpbmRleFt0aGluZ107XG4gIGlmIChleGlzdGluZyAhPT0gbm8pIHtcbiAgICByZXR1cm4gZXhpc3Rpbmc7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGFzc2lnbiAoZWxlbSwgaW5zdGFuY2UpIHtcbiAgZWxlbS5zZXRBdHRyaWJ1dGUoaWtleSwgaW5zdGFuY2UuaWQgPSBpbmRleC5wdXNoKGluc3RhbmNlKSAtIDEpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmluZDogZmluZCxcbiAgYXNzaWduOiBhc3NpZ25cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByYWYgPSByZXF1aXJlKCdyYWYnKTtcbnZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vY2FsZW5kYXInKTtcblxuZnVuY3Rpb24gaW5saW5lIChlbGVtLCBjYWxlbmRhck9wdGlvbnMpIHtcbiAgdmFyIG8gPSBjYWxlbmRhck9wdGlvbnMgfHwge307XG5cbiAgby5hcHBlbmRUbyA9IGVsZW07XG5cbiAgdmFyIGFwaSA9IGNhbGVuZGFyKG8pXG4gICAgLm9uKCdyZWFkeScsIHJlYWR5KTtcblxuICBmdW5jdGlvbiByZWFkeSAoKSB7XG4gICAgcmFmKGFwaS5zaG93KTtcbiAgfVxuXG4gIHJldHVybiBhcGk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5saW5lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKTtcbnZhciByYWYgPSByZXF1aXJlKCdyYWYnKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJy4vY2xvbmUnKTtcbnZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vY2FsZW5kYXInKTtcbnZhciBtb21lbnR1bSA9IHJlcXVpcmUoJy4vbW9tZW50dW0nKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnLi9jbGFzc2VzJyk7XG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcblxuZnVuY3Rpb24gaW5wdXRDYWxlbmRhciAoaW5wdXQsIGNhbGVuZGFyT3B0aW9ucykge1xuICB2YXIgbztcbiAgdmFyIGFwaSA9IGNhbGVuZGFyKGNhbGVuZGFyT3B0aW9ucyk7XG4gIHZhciB0aHJvdHRsZWRUYWtlSW5wdXQgPSB0aHJvdHRsZSh0YWtlSW5wdXQsIDUwKTtcbiAgdmFyIHRocm90dGxlZFBvc2l0aW9uID0gdGhyb3R0bGUocG9zaXRpb24sIDMwKTtcbiAgdmFyIGlnbm9yZUludmFsaWRhdGlvbjtcbiAgdmFyIGlnbm9yZVNob3c7XG5cbiAgYmluZEV2ZW50cygpO1xuXG4gIGZ1bmN0aW9uIGluaXQgKHN1cGVyT3B0aW9ucykge1xuICAgIG8gPSBjbG9uZShzdXBlck9wdGlvbnMpO1xuXG4gICAgY2xhc3Nlcy5hZGQoYXBpLmNvbnRhaW5lciwgby5zdHlsZXMucG9zaXRpb25lZCk7XG4gICAgZXZlbnRzLmFkZChhcGkuY29udGFpbmVyLCAnbW91c2Vkb3duJywgY29udGFpbmVyTW91c2VEb3duKTtcbiAgICBldmVudHMuYWRkKGFwaS5jb250YWluZXIsICdjbGljaycsIGNvbnRhaW5lckNsaWNrKTtcblxuICAgIGFwaS5nZXREYXRlID0gdW5yZXF1aXJlKGFwaS5nZXREYXRlKTtcbiAgICBhcGkuZ2V0RGF0ZVN0cmluZyA9IHVucmVxdWlyZShhcGkuZ2V0RGF0ZVN0cmluZyk7XG4gICAgYXBpLmdldE1vbWVudCA9IHVucmVxdWlyZShhcGkuZ2V0TW9tZW50KTtcblxuICAgIGlmIChvLmluaXRpYWxWYWx1ZSkge1xuICAgICAgaW5wdXQudmFsdWUgPSBvLmluaXRpYWxWYWx1ZS5mb3JtYXQoby5pbnB1dEZvcm1hdCk7XG4gICAgfVxuXG4gICAgYXBpLm9uKCdkYXRhJywgdXBkYXRlSW5wdXQpO1xuICAgIGFwaS5vbignc2hvdycsIHRocm90dGxlZFBvc2l0aW9uKTtcblxuICAgIGV2ZW50TGlzdGVuaW5nKCk7XG4gICAgdGhyb3R0bGVkVGFrZUlucHV0KCk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgICBldmVudExpc3RlbmluZyh0cnVlKTtcbiAgICByYWYoYmluZEV2ZW50cyk7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRXZlbnRzICgpIHtcbiAgICBhcGkub25jZSgncmVhZHknLCBpbml0KTtcbiAgICBhcGkub25jZSgnZGVzdHJveWVkJywgZGVzdHJveSk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudExpc3RlbmluZyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICBldmVudHNbb3BdKGlucHV0LCAnY2xpY2snLCBzaG93KTtcbiAgICBldmVudHNbb3BdKGlucHV0LCAndG91Y2hlbmQnLCBzaG93KTtcbiAgICBldmVudHNbb3BdKGlucHV0LCAnZm9jdXNpbicsIHNob3cpO1xuICAgIGV2ZW50c1tvcF0oaW5wdXQsICdjaGFuZ2UnLCB0aHJvdHRsZWRUYWtlSW5wdXQpO1xuICAgIGV2ZW50c1tvcF0oaW5wdXQsICdrZXlwcmVzcycsIHRocm90dGxlZFRha2VJbnB1dCk7XG4gICAgZXZlbnRzW29wXShpbnB1dCwgJ2tleWRvd24nLCB0aHJvdHRsZWRUYWtlSW5wdXQpO1xuICAgIGV2ZW50c1tvcF0oaW5wdXQsICdpbnB1dCcsIHRocm90dGxlZFRha2VJbnB1dCk7XG4gICAgaWYgKG8uaW52YWxpZGF0ZSkgeyBldmVudHNbb3BdKGlucHV0LCAnYmx1cicsIGludmFsaWRhdGVJbnB1dCk7IH1cbiAgICBldmVudHNbb3BdKHdpbmRvdywgJ3Jlc2l6ZScsIHRocm90dGxlZFBvc2l0aW9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnRhaW5lckNsaWNrICgpIHtcbiAgICBpZ25vcmVTaG93ID0gdHJ1ZTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICAgIGlnbm9yZVNob3cgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnRhaW5lck1vdXNlRG93biAoKSB7XG4gICAgaWdub3JlSW52YWxpZGF0aW9uID0gdHJ1ZTtcbiAgICByYWYodW5pZ25vcmUpO1xuXG4gICAgZnVuY3Rpb24gdW5pZ25vcmUgKCkge1xuICAgICAgaWdub3JlSW52YWxpZGF0aW9uID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW52YWxpZGF0ZUlucHV0ICgpIHtcbiAgICBpZiAoIWlnbm9yZUludmFsaWRhdGlvbiAmJiAhaXNFbXB0eSgpICYmIG8uYXV0b1NlbGVjdERhdGUpIHtcbiAgICAgIGFwaS5lbWl0VmFsdWVzKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvdyAoKSB7XG4gICAgaWYgKGlnbm9yZVNob3cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXBpLnNob3coKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc2l0aW9uICgpIHtcbiAgICB2YXIgYm91bmRzID0gaW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdmFyIHNjcm9sbFRvcCA9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG4gICAgYXBpLmNvbnRhaW5lci5zdHlsZS50b3AgID0gYm91bmRzLnRvcCArIHNjcm9sbFRvcCArIGlucHV0Lm9mZnNldEhlaWdodCArICdweCc7XG4gICAgYXBpLmNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gYm91bmRzLmxlZnQgKyAncHgnO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFrZUlucHV0ICgpIHtcbiAgICB2YXIgdmFsdWUgPSBpbnB1dC52YWx1ZS50cmltKCk7XG4gICAgaWYgKGlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZGF0ZSA9IG1vbWVudHVtLm1vbWVudCh2YWx1ZSwgby5pbnB1dEZvcm1hdCk7XG4gICAgYXBpLnNldFZhbHVlKGRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlSW5wdXQgKGRhdGEpIHtcbiAgICBpbnB1dC52YWx1ZSA9IGRhdGE7XG4gIH1cblxuICBmdW5jdGlvbiBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gby5yZXF1aXJlZCA9PT0gZmFsc2UgJiYgaW5wdXQudmFsdWUudHJpbSgpID09PSAnJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHVucmVxdWlyZSAoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gbWF5YmUgKCkge1xuICAgICAgcmV0dXJuIGlzRW1wdHkoKSA/IG51bGwgOiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gYXBpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0Q2FsZW5kYXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGlzSW5wdXQgKGVsZW0pIHtcbiAgcmV0dXJuIGVsZW0gJiYgZWxlbS5ub2RlTmFtZSAmJiBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbnB1dDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaXNNb21lbnQgKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdfaXNBTW9tZW50T2JqZWN0Jyk7XG59XG5cbnZhciBhcGkgPSB7XG4gIG1vbWVudDogbnVsbCxcbiAgaXNNb21lbnQ6IGlzTW9tZW50XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5vb3A7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtb21lbnR1bSA9IHJlcXVpcmUoJy4vbW9tZW50dW0nKTtcblxuZnVuY3Rpb24gcmF3IChkYXRlLCBmb3JtYXQpIHtcbiAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBtb21lbnR1bS5tb21lbnQoZGF0ZSwgZm9ybWF0KTtcbiAgfVxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpID09PSAnW29iamVjdCBEYXRlXScpIHtcbiAgICByZXR1cm4gbW9tZW50dW0ubW9tZW50KGRhdGUpO1xuICB9XG4gIGlmIChtb21lbnR1bS5pc01vbWVudChkYXRlKSkge1xuICAgIHJldHVybiBkYXRlLmNsb25lKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2UgKGRhdGUsIGZvcm1hdCkge1xuICB2YXIgbSA9IHJhdyhkYXRlLCB0eXBlb2YgZm9ybWF0ID09PSAnc3RyaW5nJyA/IGZvcm1hdCA6IG51bGwpO1xuICByZXR1cm4gbSAmJiBtLmlzVmFsaWQoKSA/IG0gOiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuIiwiaWYgKCFBcnJheS5wcm90b3R5cGUuZXZlcnkpIHtcbiAgQXJyYXkucHJvdG90eXBlLmV2ZXJ5ID0gZnVuY3Rpb24gKGZuLCBjdHgpIHtcbiAgICB2YXIgY29udGV4dCwgaTtcblxuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2UgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbiA9IHNvdXJjZS5sZW5ndGggPj4+IDA7XG5cbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgY29udGV4dCA9IGN0eDtcbiAgICB9XG5cbiAgICBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICBpZiAoaSBpbiBzb3VyY2UpIHtcbiAgICAgICAgdmFyIHRlc3QgPSBmbi5jYWxsKGNvbnRleHQsIHNvdXJjZVtpXSwgaSwgc291cmNlKTtcbiAgICAgICAgaWYgKCF0ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufVxuIiwiaWYgKCFBcnJheS5wcm90b3R5cGUuZmlsdGVyKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgIHZhciBmID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpLCB0KSB7XG4gICAgICBpZiAoZm4uY2FsbChjdHgsIHYsIGksIHQpKSB7IGYucHVzaCh2KTsgfVxuICAgIH0sIGN0eCk7XG4gICAgcmV0dXJuIGY7XG4gIH07XG59XG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGZuLCBjdHgpIHtcbiAgICBpZiAodGhpcyA9PT0gdm9pZCAwIHx8IHRoaXMgPT09IG51bGwgfHwgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciB0ID0gdGhpcztcbiAgICB2YXIgbGVuID0gdC5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGkgaW4gdCkgeyBmbi5jYWxsKGN0eCwgdFtpXSwgaSwgdCk7IH1cbiAgICB9XG4gIH07XG59XG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKHdoYXQsIHN0YXJ0KSB7XG4gICAgaWYgKHRoaXMgPT09IHVuZGVmaW5lZCB8fCB0aGlzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICBzdGFydCA9ICtzdGFydCB8fCAwO1xuICAgIGlmIChNYXRoLmFicyhzdGFydCkgPT09IEluZmluaXR5KSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfSBlbHNlIGlmIChzdGFydCA8IDApIHtcbiAgICAgIHN0YXJ0ICs9IGxlbmd0aDtcbiAgICAgIGlmIChzdGFydCA8IDApIHsgc3RhcnQgPSAwOyB9XG4gICAgfVxuICAgIGZvciAoOyBzdGFydCA8IGxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKHRoaXNbc3RhcnRdID09PSB3aGF0KSB7XG4gICAgICAgIHJldHVybiBzdGFydDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuIiwiQXJyYXkuaXNBcnJheSB8fCAoQXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uIChhKSB7XG4gIHJldHVybiAnJyArIGEgIT09IGEgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xufSk7XG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5tYXApIHtcbiAgQXJyYXkucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChmbiwgY3R4KSB7XG4gICAgdmFyIGNvbnRleHQsIHJlc3VsdCwgaTtcblxuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2UgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbiA9IHNvdXJjZS5sZW5ndGggPj4+IDA7XG5cbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgY29udGV4dCA9IGN0eDtcbiAgICB9XG5cbiAgICByZXN1bHQgPSBuZXcgQXJyYXkobGVuKTtcbiAgICBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICBpZiAoaSBpbiBzb3VyY2UpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gZm4uY2FsbChjb250ZXh0LCBzb3VyY2VbaV0sIGksIHNvdXJjZSk7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5zb21lKSB7XG4gIEFycmF5LnByb3RvdHlwZS5zb21lID0gZnVuY3Rpb24gKGZuLCBjdHgpIHtcbiAgICB2YXIgY29udGV4dCwgaTtcblxuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2UgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbiA9IHNvdXJjZS5sZW5ndGggPj4+IDA7XG5cbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgY29udGV4dCA9IGN0eDtcbiAgICB9XG5cbiAgICBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICBpZiAoaSBpbiBzb3VyY2UpIHtcbiAgICAgICAgdmFyIHRlc3QgPSBmbi5jYWxsKGNvbnRleHQsIHNvdXJjZVtpXSwgaSwgc291cmNlKTtcbiAgICAgICAgaWYgKHRlc3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG59XG4iLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuICAgIHZhciBjdXJyaWVkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgb3JpZ2luYWwgPSB0aGlzO1xuICAgIHZhciBOb09wID0gZnVuY3Rpb24gKCkge307XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGN0eCA9IHRoaXMgaW5zdGFuY2VvZiBOb09wICYmIGNvbnRleHQgPyB0aGlzIDogY29udGV4dDtcbiAgICAgIHZhciBhcmdzID0gY3VycmllZC5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gb3JpZ2luYWwuYXBwbHkoY3R4LCBhcmdzKTtcbiAgICB9O1xuICAgIE5vT3AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgYm91bmQucHJvdG90eXBlID0gbmV3IE5vT3AoKTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG59XG4iLCJpZiAoIU9iamVjdC5rZXlzKSB7XG4gIE9iamVjdC5rZXlzID0gKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgICAgICBoYXNEb250RW51bUJ1ZyA9ICEoeyB0b1N0cmluZzogbnVsbCB9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcbiAgICAgICAgZG9udEVudW1zID0gW1xuICAgICAgICAgICd0b1N0cmluZycsXG4gICAgICAgICAgJ3RvTG9jYWxlU3RyaW5nJyxcbiAgICAgICAgICAndmFsdWVPZicsXG4gICAgICAgICAgJ2hhc093blByb3BlcnR5JyxcbiAgICAgICAgICAnaXNQcm90b3R5cGVPZicsXG4gICAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcbiAgICAgICAgICAnY29uc3RydWN0b3InXG4gICAgICAgIF0sXG4gICAgICAgIGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgKHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzdWx0ID0gW10sIHByb3AsIGk7XG5cbiAgICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHByb3ApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNEb250RW51bUJ1Zykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0oKSk7XG59IiwiaWYgKCFTdHJpbmcucHJvdG90eXBlLnRyaW0pIHtcbiAgU3RyaW5nLnByb3RvdHlwZS50cmltID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gdGhlc2UgYXJlIG9ubHkgcmVxdWlyZWQgZm9yIElFIDwgOVxuLy8gbWF5YmUgbW92ZSB0byBJRS1zcGVjaWZpYyBkaXN0cm8/XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9mdW5jdGlvbi5iaW5kJyk7XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9hcnJheS5mb3JlYWNoJyk7XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9hcnJheS5tYXAnKTtcbnJlcXVpcmUoJy4vcG9seWZpbGxzL2FycmF5LmZpbHRlcicpO1xucmVxdWlyZSgnLi9wb2x5ZmlsbHMvYXJyYXkuaXNhcnJheScpO1xucmVxdWlyZSgnLi9wb2x5ZmlsbHMvYXJyYXkuaW5kZXhvZicpO1xucmVxdWlyZSgnLi9wb2x5ZmlsbHMvYXJyYXkuZXZlcnknKTtcbnJlcXVpcmUoJy4vcG9seWZpbGxzL2FycmF5LnNvbWUnKTtcbnJlcXVpcmUoJy4vcG9seWZpbGxzL3N0cmluZy50cmltJyk7XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9vYmplY3Qua2V5cycpO1xuXG52YXIgY29yZSA9IHJlcXVpcmUoJy4vY29yZScpO1xudmFyIGluZGV4ID0gcmVxdWlyZSgnLi9pbmRleCcpO1xudmFyIHVzZSA9IHJlcXVpcmUoJy4vdXNlJyk7XG5cbmNvcmUudXNlID0gdXNlLmJpbmQoY29yZSk7XG5jb3JlLmZpbmQgPSBpbmRleC5maW5kO1xuY29yZS52YWwgPSByZXF1aXJlKCcuL3ZhbGlkYXRvcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIHJvbWUgPSByZXF1aXJlKCcuL3JvbWUnKTtcbnZhciBtb21lbnR1bSA9IHJlcXVpcmUoJy4vbW9tZW50dW0nKTtcblxucm9tZS51c2UoZ2xvYmFsLm1vbWVudCk7XG5cbmlmIChtb21lbnR1bS5tb21lbnQgPT09IHZvaWQgMCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3JvbWUgZGVwZW5kcyBvbiBtb21lbnQuanMsIHlvdSBjYW4gZ2V0IGl0IGF0IGh0dHA6Ly9tb21lbnRqcy5jb20sIG9yIHlvdSBjb3VsZCB1c2UgdGhlIGJ1bmRsZWQgZGlzdHJpYnV0aW9uIGZpbGUgaW5zdGVhZC4nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByb21lO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gdGV4dCAoZWxlbSwgdmFsdWUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICBlbGVtLmlubmVyVGV4dCA9IGVsZW0udGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gZWxlbS5pbm5lclRleHQgfHwgZWxlbS50ZXh0Q29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZXh0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG5cbmZ1bmN0aW9uIHVzZSAobW9tZW50KSB7XG4gIHRoaXMubW9tZW50ID0gbW9tZW50dW0ubW9tZW50ID0gbW9tZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4ID0gcmVxdWlyZSgnLi9pbmRleCcpO1xudmFyIHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpO1xudmFyIGFzc29jaWF0aW9uID0gcmVxdWlyZSgnLi9hc3NvY2lhdGlvbicpO1xuXG5mdW5jdGlvbiBjb21wYXJlQnVpbGRlciAoY29tcGFyZSkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFjdG9yeSAodmFsdWUpIHtcbiAgICB2YXIgZml4ZWQgPSBwYXJzZSh2YWx1ZSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdmFsaWRhdGUgKGRhdGUpIHtcbiAgICAgIHZhciBjYWwgPSBpbmRleC5maW5kKHZhbHVlKTtcbiAgICAgIHZhciBsZWZ0ID0gcGFyc2UoZGF0ZSk7XG4gICAgICB2YXIgcmlnaHQgPSBmaXhlZCB8fCBjYWwgJiYgY2FsLmdldE1vbWVudCgpO1xuICAgICAgaWYgKCFyaWdodCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWwpIHtcbiAgICAgICAgYXNzb2NpYXRpb24uYWRkKHRoaXMsIGNhbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29tcGFyZShsZWZ0LCByaWdodCk7XG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmFuZ2VCdWlsZGVyIChob3csIGNvbXBhcmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkgKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgZGF0ZXM7XG4gICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFydCkpIHtcbiAgICAgIGRhdGVzID0gc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChsZW4gPT09IDEpIHtcbiAgICAgICAgZGF0ZXMgPSBbc3RhcnRdO1xuICAgICAgfSBlbHNlIGlmIChsZW4gPT09IDIpIHtcbiAgICAgICAgZGF0ZXMgPSBbW3N0YXJ0LCBlbmRdXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdmFsaWRhdGUgKGRhdGUpIHtcbiAgICAgIHJldHVybiBkYXRlcy5tYXAoZXhwYW5kLmJpbmQodGhpcykpW2hvd10oY29tcGFyZS5iaW5kKHRoaXMsIGRhdGUpKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZXhwYW5kICh2YWx1ZSkge1xuICAgICAgdmFyIHN0YXJ0LCBlbmQ7XG4gICAgICB2YXIgY2FsID0gaW5kZXguZmluZCh2YWx1ZSk7XG4gICAgICBpZiAoY2FsKSB7XG4gICAgICAgIHN0YXJ0ID0gZW5kID0gY2FsLmdldE1vbWVudCgpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBzdGFydCA9IHZhbHVlWzBdOyBlbmQgPSB2YWx1ZVsxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXJ0ID0gZW5kID0gdmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoY2FsKSB7XG4gICAgICAgIGFzc29jaWF0aW9uLmFkZChjYWwsIHRoaXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQ6IHBhcnNlKHN0YXJ0KS5zdGFydE9mKCdkYXknKS50b0RhdGUoKSxcbiAgICAgICAgZW5kOiBwYXJzZShlbmQpLmVuZE9mKCdkYXknKS50b0RhdGUoKVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBhZnRlckVxICA9IGNvbXBhcmVCdWlsZGVyKGZ1bmN0aW9uIChsZWZ0LCByaWdodCkgeyByZXR1cm4gbGVmdCA+PSByaWdodDsgfSk7XG52YXIgYWZ0ZXIgICAgPSBjb21wYXJlQnVpbGRlcihmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHsgcmV0dXJuIGxlZnQgID4gcmlnaHQ7IH0pO1xudmFyIGJlZm9yZUVxID0gY29tcGFyZUJ1aWxkZXIoZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7IHJldHVybiBsZWZ0IDw9IHJpZ2h0OyB9KTtcbnZhciBiZWZvcmUgICA9IGNvbXBhcmVCdWlsZGVyKGZ1bmN0aW9uIChsZWZ0LCByaWdodCkgeyByZXR1cm4gbGVmdCAgPCByaWdodDsgfSk7XG5cbnZhciBleGNlcHQgICA9IHJhbmdlQnVpbGRlcignZXZlcnknLCBmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHsgcmV0dXJuIHJpZ2h0LnN0YXJ0ICA+IGxlZnQgfHwgcmlnaHQuZW5kICA8IGxlZnQ7IH0pO1xudmFyIG9ubHkgICAgID0gcmFuZ2VCdWlsZGVyKCdzb21lJywgIGZ1bmN0aW9uIChsZWZ0LCByaWdodCkgeyByZXR1cm4gcmlnaHQuc3RhcnQgPD0gbGVmdCAmJiByaWdodC5lbmQgPj0gbGVmdDsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZnRlckVxOiBhZnRlckVxLFxuICBhZnRlcjogYWZ0ZXIsXG4gIGJlZm9yZUVxOiBiZWZvcmVFcSxcbiAgYmVmb3JlOiBiZWZvcmUsXG4gIGV4Y2VwdDogZXhjZXB0LFxuICBvbmx5OiBvbmx5XG59O1xuIl19
(39)
});
