!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.traversonAngular=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
var indexOf = _dereq_('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":3}],3:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],4:[function(_dereq_,module,exports){
'use strict';

// TODO Replace by a proper lightweight logging module, suited for the browser

var enabled = false;
function Logger(id) {
  if (id == null) {
    id = '';
  }
  this.id = id;
}

Logger.prototype.enable = function() {
  this.enabled = true;
};

Logger.prototype.debug = function(message) {
  if (enabled) {
    console.log(this.id + '/debug: ' + message);
  }
};

Logger.prototype.info = function(message) {
  if (enabled) {
    console.log(this.id + '/info: ' + message);
  }
};

Logger.prototype.warn = function(message) {
  if (enabled) {
    console.log(this.id + '/warn: ' + message);
  }
};

Logger.prototype.error = function(message) {
  if (enabled) {
    console.log(this.id + '/error: ' + message);
  }
};

function minilog(id) {
  return new Logger(id);
}

minilog.enable = function() {
  enabled = true;
};

module.exports = minilog;

},{}],5:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  isArray: function(o) {
    if (o == null) {
      return false;
    }
    return Object.prototype.toString.call(o) === '[object Array]';
  }
};

},{}],6:[function(_dereq_,module,exports){
'use strict';

var superagent = _dereq_('superagent');

function Request() {
}

Request.prototype.get = function(uri, options, callback) {
  return mapRequest(superagent.get(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.post = function(uri, options, callback) {
  return mapRequest(superagent.post(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.put = function(uri, options, callback) {
  return mapRequest(superagent.put(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.patch = function(uri, options, callback) {
  return mapRequest(superagent.patch(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.del = function(uri, options, callback) {
  return mapRequest(superagent.del(uri), options)
    .end(handleResponse(callback));
};

function mapRequest(superagentRequest, options) {
  options = options || {};
  mapQuery(superagentRequest, options);
  mapHeaders(superagentRequest, options);
  mapAuth(superagentRequest, options);
  mapBody(superagentRequest, options);
  mapForm(superagentRequest, options);
  return superagentRequest;
}

function mapQuery(superagentRequest, options) {
  var qs = options.qs;
  if (qs != null) {
    superagentRequest = superagentRequest.query(qs);
  }
}

function mapHeaders(superagentRequest, options) {
  var headers = options.headers;
  if (headers != null) {
    superagentRequest = superagentRequest.set(headers);
  }
}

function mapAuth(superagentRequest, options) {
  var auth = options.auth;
  if (auth != null) {
    superagentRequest = superagentRequest.auth(
      auth.user || auth.username,
      auth.pass || auth.password
    );
  }
}

function mapBody(superagentRequest, options) {
  if (options != null) {
    var body = options.body;
    if (body != null) {
      superagentRequest = superagentRequest.send(body);
    }
  }
}

function mapForm(superagentRequest, options) {
  if (options != null) {
    var form = options.form;
    if (form != null) {
      superagentRequest = superagentRequest.send(form);
      superagentRequest = superagentRequest.set('Content-Type',
          'application/x-www-form-urlencoded');
    }
  }
}

// map XHR response object properties to Node.js request lib's response object
// properties
function mapResponse(response) {
  response.body = response.text;
  response.statusCode = response.status;
  return response;
}

function handleResponse(callback) {
  return function(error, response) {
    if (error) {
      return callback(error);
    } else {
      callback(null, mapResponse(response));
    }
  };
}

module.exports = new Request();

},{"superagent":19}],7:[function(_dereq_,module,exports){
'use strict';

/*
 * Copied from underscore.string module. Just the functions we need, to reduce
 * the browserified size.
 */

var _s = {
  startsWith: function(str, starts) {
    if (starts === '') return true;
    if (str == null || starts == null) return false;
    str = String(str); starts = String(starts);
    return str.length >= starts.length && str.slice(0, starts.length) === starts;
  },

  endsWith: function(str, ends){
    if (ends === '') return true;
    if (str == null || ends == null) return false;
    str = String(str); ends = String(ends);
    return str.length >= ends.length &&
      str.slice(str.length - ends.length) === ends;
  },

  splice: function(str, i, howmany, substr){
    var arr = _s.chars(str);
    arr.splice(~~i, ~~howmany, substr);
    return arr.join('');
  },

  contains: function(str, needle){
    if (needle === '') return true;
    if (str == null) return false;
    return String(str).indexOf(needle) !== -1;
  },

  chars: function(str) {
    if (str == null) return [];
    return String(str).split('');
  }
};

module.exports = _s;

},{}],8:[function(_dereq_,module,exports){
'use strict';

var resolveUrl = _dereq_('resolve-url');

exports.resolve = function(from, to) {
  return resolveUrl(from, to);
};

},{"resolve-url":18}],9:[function(_dereq_,module,exports){
'use strict';

var minilog = _dereq_('minilog')
  , standardRequest = _dereq_('request')
  , util = _dereq_('util');

var FinalAction = _dereq_('./final_action')
  , mediaTypeRegistry = _dereq_('./media_type_registry')
  , Walker = _dereq_('./walker')
  , mediaTypes = _dereq_('./media_types')
  , mergeRecursive = _dereq_('./merge_recursive');

var log = minilog('traverson');

// Maintenance notice: The constructor is usually called without arguments, the
// mediaType parameter is only used when cloning the request builder in
// newRequest().
function Builder(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  var adapter = this._createAdapter(this.mediaType);
  this.walker = new Walker(adapter);
  this.request = this.walker.request = standardRequest;
  this.finalAction = new FinalAction(this.walker);
}

Builder.prototype._createAdapter = function(mediaType) {
  var AdapterType = mediaTypeRegistry.get(mediaType);
  if (!AdapterType) {
    throw new Error('Unknown or unsupported media type: ' + mediaType);
  }
  log.debug('creating new ' + AdapterType.name);
  return new AdapterType(log);
};

/**
 * Returns a new builder instance which is basically a clone of this builder
 * instance. This allows you to initiate a new request but keeping all the setup
 * (start URL, template parameters, request options, body parser, ...).
 */
Builder.prototype.newRequest = function() {
  var clonedRequestBuilder = new Builder(this.getMediaType());
  clonedRequestBuilder.walker.contentNegotiation =
    this.doesContentNegotiation();
  clonedRequestBuilder.from(shallowCloneArray(this.getFrom()));
  clonedRequestBuilder.withTemplateParameters(
    cloneArrayOrObject(this.getTemplateParameters()));
  clonedRequestBuilder.withRequestOptions(
    cloneArrayOrObject(this.getRequestOptions()));
  clonedRequestBuilder.withRequestLibrary(this.getRequestLibrary());
  clonedRequestBuilder.parseResponseBodiesWith(this.getJsonParser());
  clonedRequestBuilder.resolveRelative(this.doesResolveRelative());
  return clonedRequestBuilder;
};

/**
 * Disables content negotiation and forces the use of a given media type.
 * The media type has to be registered at Traverson's media type registry
 * before via traverson.registerMediaType (except for media type
 * application/json, which is traverson.mediaTypes.JSON).
 */
Builder.prototype.setMediaType = function(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  this.walker.adapter = this._createAdapter(mediaType);
  this.walker.contentNegotiation =
    (mediaType === mediaTypes.CONTENT_NEGOTIATION);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON);
 */
Builder.prototype.json = function() {
  this.setMediaType(mediaTypes.JSON);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON_HAL);
 */
Builder.prototype.jsonHal = function() {
  this.setMediaType(mediaTypes.JSON_HAL);
  return this;
};

/**
 * Enables content negotiation (content negotiation is enabled by default, this
 * method can be used to enable it after a call to setMediaType disabled it).
 */
Builder.prototype.useContentNegotiation = function() {
  this.setMediaType(mediaTypes.CONTENT_NEGOTIATION);
  this.walker.contentNegotiation = true;
  return this;
};

/**
 * Set the root URL of the API, that is, where the link traversal begins.
 */
Builder.prototype.from = function(url) {
  this.walker.startUri = url;
  return this;
};

/**
 * Provides the list of link relations to follow
 */
Builder.prototype.follow = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.walker.links = arguments[0];
  } else {
    this.walker.links = Array.prototype.slice.apply(arguments);
  }
  return this;
};

/**
 * Alias for follow.
 */
Builder.prototype.walk = Builder.prototype.follow;

/**
 * Provide template parameters for URI template substitution.
 */
Builder.prototype.withTemplateParameters = function(parameters) {
  this.walker.templateParameters = parameters;
  return this;
};

/**
 * Provide options for HTTP requests (additional HTTP headers, for example).
 * This function resets any request options, that had been set previously, that
 * is, multiple calls to withRequestOptions are not cumulative. Use
 * addRequestOptions to add request options in a cumulative way.
 *
 * Options can either be passed as an object or an array. If an object is
 * passed, the options will be used for each HTTP request. If an array is
 * passed, each element should be an options object and the first array element
 * will be used for the first request, the second element for the second request
 * and so on. null elements are allowed.
 */
Builder.prototype.withRequestOptions = function(options) {
  this.walker.requestOptions = options;
  return this;
};

/**
 * Adds options for HTTP requests (additional HTTP headers, for example) on top
 * of existing options, if any. To reset all request options and set new ones
 * without keeping the old ones, you can use withRequestOptions.
 *
 * Options can either be passed as an object or an array. If an object is
 * passed, the options will be used for each HTTP request. If an array is
 * passed, each element should be an options object and the first array element
 * will be used for the first request, the second element for the second request
 * and so on. null elements are allowed.
 *
 * When called after a call to withRequestOptions or when combining multiple
 * addRequestOptions calls, some with objects and some with arrays, a multitude
 * of interesting situations can occur:
 *
 * 1) The existing request options are an object and the new options passed into
 * this method are also an object. Outcome: Both objects are merged and all
 * options are applied to all requests.
 *
 * 2) The existing options are an array and the new options passed into this
 * method are also an array. Outcome: Each array element is merged individually.
 * The combined options from the n-th array element in the existing options
 * array and the n-th array element in the given array are applied to the n-th
 * request.
 *
 * 3) The existing options are an object and the new options passed into this
 * method are an array. Outcome: A new options array will be created. For each
 * element, a clone of the existing options object will be merged with an
 * element from the given options array.
 *
 * Note that if the given array has less elements than the number of steps in
 * the link traversal (usually the number of steps is derived from the number
 * of link relations given to the follow method), only the first n http
 * requests will use options at all, where n is the number of elements in the
 * given array. HTTP request n + 1 and all following HTTP requests will use an
 * empty options object. This is due to the fact, that at the time of creating
 * the new options array, we can not know with certainty how many steps the
 * link traversal will have.
 *
 * 4) The existing options are an array and the new options passed into this
 * method are an object. Outcome: A clone of the given options object will be
 * merged into into each array element of the existing options.
 */
Builder.prototype.addRequestOptions = function(options) {

  // case 2: both the present options and the new options are arrays.
  // => merge each array element individually
  if (util.isArray(this.walker.requestOptions) && util.isArray(options)) {
    mergeArrayElements(this.walker.requestOptions, options);

  // case 3: there is an options object the new options are an array.
  // => create a new array, each element is a merge of the existing base object
  // and the array element from the new options array.
  } else if (typeof this.walker.requestOptions === 'object' &&
             util.isArray(options)) {
    this.walker.requestOptions =
      mergeBaseObjectWithArrayElements(this.walker.requestOptions, options);

  // case 4: there is an options array and the new options are an object.
  // => merge the new object into each array element.
  } else if (util.isArray(this.walker.requestOptions) &&
             typeof options === 'object') {
    mergeOptionObjectIntoEachArrayElement(this.walker.requestOptions, options);

  // case 1: both are objects
  // => merge both objects
  } else {
    mergeRecursive(this.walker.requestOptions, options);
  }
  return this;
};

function mergeArrayElements(existingOptions, newOptions) {
  for (var i = 0;
       i < Math.max(existingOptions.length, newOptions.length);
       i++) {
    existingOptions[i] =
      mergeRecursive(existingOptions[i], newOptions[i]);
  }
}

function mergeBaseObjectWithArrayElements(existingOptions, newOptions) {
  var newOptArray = [];
  for (var i = 0;
       i < newOptions.length;
       i++) {
    newOptArray[i] =
      mergeRecursive(newOptions[i], existingOptions);
  }
  return newOptArray;
}

function mergeOptionObjectIntoEachArrayElement(existingOptions, newOptions) {
  for (var i = 0;
       i < existingOptions.length;
       i++) {
    mergeRecursive(existingOptions[i], newOptions);
  }
}

/**
 * Injects a custom request library. When using this method, you should not
 * call withRequestOptions or addRequestOptions but instead pre-configure the
 * injected request library instance before passing it to withRequestLibrary.
 */
Builder.prototype.withRequestLibrary = function(request) {
  this.walker.request = this.request = request;
  return this;
};

/**
 * Injects a custom JSON parser.
 */
Builder.prototype.parseResponseBodiesWith = function(parser) {
  this.walker.parseJson = parser;
  return this;
};

/**
 * Switches URL resolution to relative (default is absolute) or back to
 * absolute.
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), URL resolution is switched to relative, otherwise the argument is
 * interpreted as a boolean flag. If it is a truthy value, URL resolution is
 * switched to relative, if it is a falsy value, URL resolution is switched to
 * absolute.
 */
Builder.prototype.resolveRelative = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.walker.resolveRelative = !!flag;
  return this;
};

/**
 * Returns the current media type. If no media type is enforced but content type
 * detection is used, the string `content-negotiation` is returned.
 */
Builder.prototype.getMediaType = function() {
  return this.mediaType;
};

/**
 * Returns the URL set by the from(url) method, that is, the root URL of the
 * API.
 */
Builder.prototype.getFrom = function() {
  return this.walker.startUri;
};

/**
 * Returns the template parameters set by the withTemplateParameters.
 */
Builder.prototype.getTemplateParameters = function() {
  return this.walker.templateParameters;
};

/**
 * Returns the request options set by the withRequestOptions or
 * addRequestOptions.
 */
Builder.prototype.getRequestOptions = function() {
  return this.walker.requestOptions;
};

/**
 * Returns the custom request library instance set by withRequestLibrary or the
 * standard request library instance, if a custom one has not been set.
 */
Builder.prototype.getRequestLibrary = function() {
  return this.walker.request;
};

/**
 * Returns the custom JSON parser function set by parseResponseBodiesWith or the
 * standard parser function, if a custom one has not been set.
 */
Builder.prototype.getJsonParser = function() {
  return this.walker.parseJson;
};

/**
 * Returns the flag controlling if URLs are resolved relative or absolute.
 * A return value of true means that URLs are resolved relative, false means
 * absolute.
 */
Builder.prototype.doesResolveRelative = function() {
  return this.walker.resolveRelative;
};

/**
 * Returns true if content negotiation is enabled and false if a particular
 * media type is forced.
 */
Builder.prototype.doesContentNegotiation = function() {
  return this.walker.contentNegotiation;
};

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
Builder.prototype.get = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }
    self.finalAction.get(nextStep, callback);
  });
  return createTraversalHandle(this);
};

/**
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
Builder.prototype.getResource = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }
    self.finalAction.getResource(nextStep, callback);
  });
  return createTraversalHandle(this);
};

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */
Builder.prototype.getUri = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }
    self.finalAction.getUri(nextStep, callback);
  });
  return createTraversalHandle(this);
};

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
Builder.prototype.post = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.getRequestOptions(),
      this.request.post, callback);
  return createTraversalHandle(this);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
Builder.prototype.put = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.getRequestOptions(),
      this.request.put, callback);
  return createTraversalHandle(this);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
Builder.prototype.patch = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.getRequestOptions(),
      this.request.patch, callback);
  return createTraversalHandle(this);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
Builder.prototype.delete = function(callback) {
  this.finalAction.walkAndExecute(null, this.request, this.getRequestOptions(),
      this.request.del, callback);
  return createTraversalHandle(this);
};

/**
 * Alias for delete.
 */
Builder.prototype.del = Builder.prototype.delete;

function createTraversalHandle(self) {
  return {
    abort: function() {
      self.walker.abort();
    }
  };
}

function cloneArrayOrObject(thing) {
  if (util.isArray(thing)) {
    return shallowCloneArray(thing);
  } else if (typeof thing === 'object') {
    return deepCloneObject(thing);
  } else {
    return thing;
  }
}

function deepCloneObject(object) {
  return mergeRecursive(null, object);
}

function shallowCloneArray(array) {
  if (!array) {
    return array;
  }
  return array.slice(0);
}

module.exports = Builder;

},{"./final_action":10,"./media_type_registry":12,"./media_types":13,"./merge_recursive":14,"./walker":16,"minilog":4,"request":6,"util":5}],10:[function(_dereq_,module,exports){
'use strict';

var minilog = _dereq_('minilog')
  , log = minilog('traverson')
  , util = _dereq_('util');

function FinalAction(walker) {
  this.walker = walker;
}

FinalAction.prototype.get = function(nextStep, callback) {
  log.debug('next step: ' + JSON.stringify(nextStep, null, 2));
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned');
    if (err) {
      return callback(err,
        step ? step.response : null,
        step ? step.uri : null);
    }
    if (!step.response && step.doc) {
      log.debug('faking HTTP response for embedded resource');
      step.response = {
        statusCode: 200,
        body: JSON.stringify(step.doc),
        remark: 'This is not an actual HTTP response. The resource you ' +
          'requested was an embedded resource, so no HTTP request was ' +
          'made to acquire it.'
      };
    }
    callback(null, step.response);
  });
};

FinalAction.prototype.getResource = function(nextStep, callback) {
  // TODO Remove duplication: This duplicates the get/checkHttpStatus/parse
  // sequence from the Walker's walk method.
  var self = this;
  log.debug('next step: ' + JSON.stringify(nextStep));
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned');
    if (err) {
      return callback(err,
        step ? step.response : null,
        step ? step.uri : null);
    }
    if (step.doc) {
      // return an embedded doc immediately
      return callback(null, step.doc);
    }

    var resource;
    try {
      self.walker.checkHttpStatus(step);
      resource = self.walker.parse(step);
      return callback(null, resource);
    } catch (e) {
      return callback(e, e.doc);
    }
  });
};

FinalAction.prototype.getUri = function(nextStep, callback) {
  var self = this;
  log.debug('returning uri');
  if (nextStep.uri) {
    return callback(null, nextStep.uri);
  } else if (nextStep.doc &&
    // TODO actually this is very HAL specific :-/
    nextStep.doc._links &&
    nextStep.doc._links.self &&
    nextStep.doc._links.self.href) {
    return callback(null, self.walker.startUri +
        nextStep.doc._links.self.href);
  } else {
    return callback(new Error('You requested an URI but the last ' +
        'resource is an embedded resource and has no URI of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
};

// TODO Please refactor me!! Pretty please?
/* jshint maxcomplexity: 10 */
FinalAction.prototype.walkAndExecute = function(body, request, requestOptions,
    method, callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }

    log.debug('aborted: ' + self.walker.aborted);
    if (self.walker.aborted) {
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(new Error('Link traversal process has been aborted.'),
            lastStep ? lastStep.response : null,
            lastStep ? lastStep.uri : null);
      }
    }


    var options = requestOptions;
    if (util.isArray(requestOptions)) {
      options = requestOptions[nextStep.index] || {};
    }
    log.debug('executing final request with step: ' + JSON.stringify(nextStep));
    log.debug('options: ' + JSON.stringify(options));
    self.executeRequest(nextStep.uri, request, options, method, body,
      callback);
  });
};

/* jshint maxparams: 6 */
FinalAction.prototype.executeRequest = function(uri, request, requestOptions,
    method, body, callback) {
  var self = this;
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }
  log.debug('request to ' + uri + ' with options ' +
      JSON.stringify(requestOptions));

  this.walker.currentRequest =
  method.call(request, uri, requestOptions, function(err, response) {
    log.debug('request to ' + uri + ' succeeded');
    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      if (err.message && err.message === 'timeout of undefinedms exceeded' &&
          !self.walker.callbackHasBeenCalledAfterAbort) {
          self.walker.callbackHasBeenCalledAfterAbort = true;
          return callback(
            new Error('Link traversal process has been aborted.'));
      } else {
        return callback(err, response, uri);
      }
    }
    return callback(null, response, uri);
  });
  this.walker.registerAbortListener(callback);
};

module.exports = FinalAction;

},{"minilog":4,"util":5}],11:[function(_dereq_,module,exports){
'use strict';

var jsonpathLib = _dereq_('JSONPath')
  , minilog = _dereq_('minilog')
  , _s = _dereq_('underscore.string');

/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = jsonpathLib.eval;
/* jshint +W061 */

function JsonAdapter(log) {
  this.log = log;
}

JsonAdapter.prototype.findNextStep = function(doc, link) {
  this.log.debug('extracting link ' + link + ' from ' + JSON.stringify(doc));
  var uri;
  if (this.testJSONPath(link)) {
    return { uri: this.resolveJSONPath(link, doc) };
  } else if (doc[link]) {
    return { uri : doc[link] };
  } else {
    throw new Error('Could not find property ' + link +
        ' in document:\n' + JSON.stringify(doc));
  }
};

JsonAdapter.prototype.testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

JsonAdapter.prototype.resolveJSONPath = function(link, doc) {
  var matches = jsonpath(doc, link);
  if (matches.length === 1) {
    var uri = matches[0];
    if (!uri) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc));
    }
    return uri;
  } else if (matches.length > 1) {
    // ambigious match
    throw new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc));
  } else {
    // no match at all
    throw new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc));
  }
};

module.exports = JsonAdapter;

},{"JSONPath":17,"minilog":4,"underscore.string":7}],12:[function(_dereq_,module,exports){
'use strict';

var mediaTypes = _dereq_('./media_types');

var registry = {};

exports.register = function register(contentType, constructor) {
  registry[contentType] = constructor;
};

exports.get = function get(contentType) {
  return registry[contentType];
};

exports.register(mediaTypes.CONTENT_NEGOTIATION,
    _dereq_('./negotiation_adapter'));
exports.register(mediaTypes.JSON, _dereq_('./json_adapter'));

},{"./json_adapter":11,"./media_types":13,"./negotiation_adapter":15}],13:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  CONTENT_NEGOTIATION: 'content-negotiation',
  JSON: 'application/json',
  JSON_HAL: 'application/hal+json',
};

},{}],14:[function(_dereq_,module,exports){
'use strict';

// TODO Maybe replace with https://github.com/Raynos/xtend
// check browser build size, though.
function mergeRecursive(obj1, obj2) {
  /* jshint maxcomplexity: 8 */
  if (!obj1 && obj2) {
    obj1 = {};
  }
  for (var key in obj2) {
    if (!obj2.hasOwnProperty(key)) {
      continue;
    }
    if (typeof obj2[key] === 'object') {
      // if it is an object (that is, a non-leave in the tree),
      // and it is not present in obj1
      if (!obj1[key] || typeof obj1[key] !== 'object') {
        // ... we create an empty object in obj1
        obj1[key] = {};
      }
      // and we recurse deeper into the structure
      mergeRecursive(obj1[key], obj2[key]);
    } else if (typeof obj2[key] !== 'function') {
      // if it is primitive (string, number, boolean), we overwrite/add it to
      // obj1
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

module.exports = mergeRecursive;

},{}],15:[function(_dereq_,module,exports){
'use strict';

function NegotiationAdapter(log) {}

NegotiationAdapter.prototype.findNextStep = function(doc, link) {
  throw new Error('Content negotiation did not happen');
};

module.exports = NegotiationAdapter;

},{}],16:[function(_dereq_,module,exports){
'use strict';

var minilog = _dereq_('minilog')
  , _s = _dereq_('underscore.string')
  , uriTemplate = _dereq_('url-template')
  , url = _dereq_('url')
  , util = _dereq_('util');

var NegotiationAdapter = _dereq_('./negotiation_adapter')
  , mediaTypeRegistry = _dereq_('./media_type_registry')
  , mergeRecursive = _dereq_('./merge_recursive');

var log = minilog('traverson');

var protocolRegEx = /https?:\/\//i;

/**
 * Creates a new Walker with the given media type adapter.
 */
function Walker(adapter) {
  this.adapter = adapter || new NegotiationAdapter(log);
  this.contentNegotiation = true;
  this.links = [];
  this.requestOptions = {};
  this.parseJson = JSON.parse;
  this.resolveRelative = false;
  this.aborted = false;
  this.callbackHasBeenCalledAfterAbort = false;
}

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
Walker.prototype.walk = function(callback) {
  var self = this;
  var nextStep = {
    uri: this.resolveUriTemplate(this.startUri, this.templateParameters, 0),
    index: 0,
  };
  var finalStep = nextStep;

  log.debug('starting to follow links');

  function executeNextStep() {
    if (nextStep.index < self.links.length && !self.aborted) {

      // Trigger execution of next step. In most cases that is an HTTP get to
      // the next URI.
      self.process(nextStep, function(err, lastStep) {
        finalStep = lastStep;
        if (err) {
          log.debug('error while processing step ' + JSON.stringify(lastStep));
          log.error(err);
          return callback(err, nextStep, lastStep);
        }
        log.debug('successfully processed step');

        // check HTTP status code
        try {
          self.checkHttpStatus(lastStep);
        } catch (e) {
          log.error('unexpected http status code');
          log.error(e);
          return callback(e, nextStep, lastStep);
        }

        // parse JSON from last response
        var doc;
        try {
          doc = self.parse(lastStep);
        } catch (e) {
          log.error('parsing failed');
          log.error(e);
          return callback(e, nextStep, lastStep);
        }

        // extract next link to follow from last response
        var link = self.links[lastStep.index];
        log.debug('next link: ' + link);

        try {
          nextStep = self.adapter.findNextStep(doc, link);
          nextStep.index = lastStep.index + 1;
        } catch (e) {
          log.error('could not find next step');
          log.error(e);
          return callback(e, nextStep, lastStep);
        }

        // URI template has to be resolved before post processing the URL,
        // because we do url.resolve with it (in json_hal) and this would URI-
        // encode curly braces.
        if (nextStep.uri) {
          // next link found in last response, might be a URI template
          nextStep.uri = self.resolveUriTemplate(nextStep.uri,
              self.templateParameters, nextStep.index);
        }

        // turn relative URI into absolute URI or whatever else is required
        self.postProcessStep(nextStep, lastStep);
        log.debug('next step: ' + JSON.stringify(nextStep, null, 2));

        // follow next link
        executeNextStep();
      });
    } else if (self.aborted) {
      // the link traversal has been aborted in mid-flight
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(new Error('Link traversal process has been aborted.'),
          nextStep, finalStep);
      }
    } else {
      // link array is exhausted, we are done and return the last response
      // and uri to the callback the client passed into the walk method.
      log.debug('link array exhausted, calling callback');
      return callback(null, nextStep, finalStep);
    }
  }

  // this is the initial call of executeNextStep which starts the link rel
  // walking process
  executeNextStep();
};

Walker.prototype.process = function(step, callback) {
  log.debug('processing next step (' + step.index + '): ' +
      JSON.stringify(step, null, 2));
  if (step.uri) {
    this.get(step, callback);
  } else if (step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    callback(null, step);
  } else {
    throw new Error('Can not process next step: ' + JSON.stringify(step));
  }
};

Walker.prototype.get = function(step, callback) {
  log.debug('request to ' + step.uri);
  var self = this;
  // TODO check if request options are an array. If so, use the ones for this
  // step like in URI template resolution. If not, pass the options object as a
  // whole.
  var options = this.requestOptions;
  if (util.isArray(this.requestOptions)) {
    options = this.requestOptions[step.index] || {};
  }
  log.debug('options: ' + JSON.stringify(options));
  this.currentRequest =
    this.request.get(step.uri,
                     options,
                     function(err, response, body) {
    log.debug('request.get returned');
    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      if (err.message && err.message === 'timeout of undefinedms exceeded' &&
          !self.callbackHasBeenCalledAfterAbort) {
          self.callbackHasBeenCalledAfterAbort = true;
          return callback(
            new Error('Link traversal process has been aborted.'));
      } else {
        return callback(err, step);
      }
    }
    if (body && !response.body) {
      response.body = body;
    }
    if (self.contentNegotiation &&
        response &&
        response.headers &&
        response.headers['content-type']) {
      var contentType = response.headers['content-type'].split(/[; ]/)[0];
      var AdapterType = mediaTypeRegistry.get(contentType);
      if (!AdapterType) {
        return callback(new Error('Unknown content type for content ' +
            'negotiation: ' + contentType, step));
      }
      // switch to new Adapter depending on Content-Type header of server
      self.adapter = new AdapterType(log);
    }
    log.debug('request to ' + step.uri + ' finished (' + response.statusCode +
        ')');
    step.response = response;
    return callback(null, step);
  });
  this.registerAbortListener(callback);
};

Walker.prototype.registerAbortListener = function(callback) {
  var self = this;
  if (this.currentRequest) {
    this.currentRequest.on('abort', function(a, b, c) {
      // the link traversal has been aborted in mid-flight
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(new Error('Link traversal process has been aborted.'));
      }
    });
  }
};

Walker.prototype.checkHttpStatus = function(step) {
  if (!step.response && step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = step.response.statusCode;
  if (httpStatus < 200 || httpStatus >= 300) {
    throw httpError(step.uri, httpStatus, step.response.body);
  }
};

Walker.prototype.parse = function(step) {
  if (step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return step.doc;
  }

  try {
    return this.parseJson(step.response.body);
  } catch (e) {
    if (e.name === 'SyntaxError') {
      throw jsonError(step.uri, step.response.body);
    }
    throw e;
  }
};

Walker.prototype.postProcessStep = function(nextStep, lastStep) {
  // default behaviour: resolve full/absolute/relative url via url.resolve
  if (nextStep.uri) {
    // TODO Might want to replace all this with a proper URL resolve lib,
    // see https://github.com/basti1302/traverson/issues/22
    if (nextStep.uri.search(protocolRegEx) !== 0) {
      if (this.resolveRelative && lastStep && lastStep.uri) {
        if (_s.startsWith(nextStep.uri, '/') &&
          _s.endsWith(lastStep.uri, '/')) {
          nextStep.uri = _s.splice(nextStep.uri, 0, 1);
        }
        nextStep.uri = lastStep.uri + nextStep.uri;
      } else {
        nextStep.uri = url.resolve(this.startUri, nextStep.uri);
      }
    }
  }
};

Walker.prototype.resolveUriTemplate = function(uri, templateParams,
    templateIndex) {
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[templateIndex];
  }

  if (!templateParams) {
    templateParams = {};
  }

  if (_s.contains(uri, '{')) {
    var template = uriTemplate.parse(uri);
    return template.expand(templateParams);
  } else {
    return uri;
  }
};

Walker.prototype.abort = function() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

function httpError(uri, httpStatus, body) {
  var error = new Error('HTTP GET for ' + uri +
      ' resulted in HTTP status code ' + httpStatus + '.');
  error.name = 'HTTPError';
  error.uri = uri;
  error.httpStatus = httpStatus;
  error.body = body;
  try {
    error.doc = JSON.parse(body);
  } catch (e) {
    // ignore
  }
  return error;
}

function jsonError(uri, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.uri = uri;
  error.body = body;
  return error;
}

module.exports = Walker;

},{"./media_type_registry":12,"./merge_recursive":14,"./negotiation_adapter":15,"minilog":4,"underscore.string":7,"url":8,"url-template":22,"util":5}],17:[function(_dereq_,module,exports){
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

var isNode = false;
(function(exports, _dereq_) {

// Keep compatibility with old browsers
if (!Array.isArray) {
  Array.isArray = function(vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example.
var isNode = typeof module !== 'undefined' && !!module.exports;

var vm = isNode ?
    _dereq_('vm') : {
      runInNewContext: function(expr, context) { with (context) return eval(expr); }
    };
exports.eval = jsonPath;

var cache = {};

function push(arr, elem) { arr = arr.slice(); arr.push(elem); return arr; }
function unshift(elem, arr) { arr = arr.slice(); arr.unshift(elem); return arr; }

function jsonPath(obj, expr, arg) {
   var P = {
      resultType: arg && arg.resultType || "VALUE",
      flatten: arg && arg.flatten || false,
      wrap: (arg && arg.hasOwnProperty('wrap')) ? arg.wrap : true,
      sandbox: (arg && arg.sandbox) ? arg.sandbox : {},
      normalize: function(expr) {
         if (cache[expr]) return cache[expr];
         var subx = [];
         var normalized = expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
                     .replace(/'?\.'?|\['?/g, ";")
                     .replace(/(;)?(\^+)(;)?/g, function(_, front, ups, back) { return ';' + ups.split('').join(';') + ';'; })
                     .replace(/;;;|;;/g, ";..;")
                     .replace(/;$|'?\]|'$/g, "");
         var exprList = normalized.split(';').map(function(expr) {
            var match = expr.match(/#([0-9]+)/);
            return !match || !match[1] ? expr : subx[match[1]];
         })
         return cache[expr] = exprList;
      },
      asPath: function(path) {
         var x = path, p = "$";
         for (var i=1,n=x.length; i<n; i++)
            p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
         return p;
      },
      trace: function(expr, val, path) {
         // no expr to follow? return path and value as the result of this trace branch
         if (!expr.length) return [{path: path, value: val}];

         var loc = expr[0], x = expr.slice(1);
         // the parent sel computation is handled in the frame above using the
         // ancestor object of val
         if (loc === '^') return path.length ? [{path: path.slice(0,-1), expr: x, isParentSelector: true}] : [];

         // we need to gather the return value of recursive trace calls in order to
         // do the parent sel computation.
         var ret = [];
         function addRet(elems) { ret = ret.concat(elems); }

         if (val && val.hasOwnProperty(loc)) // simple case, directly follow property
            addRet(P.trace(x, val[loc], push(path, loc)));
         else if (loc === "*") { // any property
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               addRet(P.trace(unshift(m, x), v, p)); });
         }
         else if (loc === "..") { // all chid properties
            addRet(P.trace(x, val, path));
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               if (typeof v[m] === "object")
                  addRet(P.trace(unshift("..", x), v[m], push(p, m)));
            });
         }
         else if (loc[0] === '(') { // [(expr)]
            addRet(P.trace(unshift(P.eval(loc, val, path[path.length], path),x), val, path));
         }
         else if (loc.indexOf('?(') === 0) { // [?(expr)]
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m, path))
                  addRet(P.trace(unshift(m,x),v,p));
            });
         }
         else if (loc.indexOf(',') > -1) { // [name1,name2,...]
            for (var parts = loc.split(','), i = 0; i < parts.length; i++)
               addRet(P.trace(unshift(parts[i], x), val, path));
         }
         else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  python slice syntax
            addRet(P.slice(loc, x, val, path));
         }

         // we check the resulting values for parent selections. for parent
         // selections we discard the value object and continue the trace with the
         // current val object
         return ret.reduce(function(all, ea) {
            return all.concat(ea.isParentSelector ? P.trace(ea.expr, val, ea.path) : [ea]);
         }, []);
      },
      walk: function(loc, expr, val, path, f) {
         if (Array.isArray(val))
            for (var i = 0, n = val.length; i < n; i++)
               f(i, loc, expr, val, path);
         else if (typeof val === "object")
            for (var m in val)
               if (val.hasOwnProperty(m))
                  f(m, loc, expr, val, path);
      },
      slice: function(loc, expr, val, path) {
         if (!Array.isArray(val)) return;
         var len = val.length, parts = loc.split(':'),
             start = (parts[0] && parseInt(parts[0])) || 0,
             end = (parts[1] && parseInt(parts[1])) || len,
             step = (parts[2] && parseInt(parts[2])) || 1;
         start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
         end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
         var ret = [];
         for (var i = start; i < end; i += step)
            ret = ret.concat(P.trace(unshift(i,expr), val, path));
         return ret;
      },
      eval: function(code, _v, _vname, path) {
         if (!$ || !_v) return false;
         if (code.indexOf("@path") > -1) {
            P.sandbox["_path"] = P.asPath(path.concat([_vname]));
            code = code.replace(/@path/g, "_path");
         }
         if (code.indexOf("@") > -1) {
            P.sandbox["_v"] = _v;
            code = code.replace(/@/g, "_v");
         }
         try {
             return vm.runInNewContext(code, P.sandbox);
         }
         catch(e) {
             console.log(e);
             throw new Error("jsonPath: " + e.message + ": " + code);
         }
      }
   };

   var $ = obj;
   var resultType = P.resultType.toLowerCase();
   if (expr && obj && (resultType == "value" || resultType == "path")) {
      var exprList = P.normalize(expr);
      if (exprList[0] === "$" && exprList.length > 1) exprList.shift();
      var result = P.trace(exprList, obj, ["$"]);
      result = result.filter(function(ea) { return ea && !ea.isParentSelector; });
      if (!result.length) return P.wrap ? [] : false;
      if (result.length === 1 && !P.wrap && !Array.isArray(result[0].value)) return result[0][resultType] || false;
      return result.reduce(function(result, ea) {
         var valOrPath = ea[resultType];
         if (resultType === 'path') valOrPath = P.asPath(valOrPath);
         if (P.flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
         } else {
            result.push(valOrPath);
         }
         return result;
      }, []);
   }
}
})(typeof exports === 'undefined' ? this['jsonPath'] = {} : exports, typeof _dereq_ == "undefined" ? null : _dereq_);

},{"vm":2}],18:[function(_dereq_,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],19:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Emitter = _dereq_('emitter');
var reduce = _dereq_('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.req.method !='HEAD' 
     ? this.xhr.responseText 
     : null;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self); 
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
    }

    self.callback(err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":20,"reduce":21}],20:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],21:[function(_dereq_,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],22:[function(_dereq_,module,exports){
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.urltemplate = factory();
    }
}(this, function () {
  /**
   * @constructor
   */
  function UrlTemplate() {
  }

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part);
      }
      return part;
    }).join('');
  };

  /**
   * @private
   * @param {string} operator
   * @param {string} value
   * @param {string} key
   * @return {string}
   */
  UrlTemplate.prototype.encodeValue = function (operator, value, key) {
    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : encodeURIComponent(value);

    if (key) {
      return encodeURIComponent(key) + '=' + value;
    } else {
      return value;
    }
  };

  /**
   * @private
   * @param {*} value
   * @return {boolean}
   */
  UrlTemplate.prototype.isDefined = function (value) {
    return value !== undefined && value !== null;
  };

  /**
   * @private
   * @param {string}
   * @return {boolean}
   */
  UrlTemplate.prototype.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
  };

  /**
   * @private
   * @param {Object} context
   * @param {string} operator
   * @param {string} key
   * @param {string} modifier
   */
  UrlTemplate.prototype.getValues = function (context, operator, key, modifier) {
    var value = context[key],
        result = [];

    if (this.isDefined(value) && value !== '') {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        value = value.toString();

        if (modifier && modifier !== '*') {
          value = value.substring(0, parseInt(modifier, 10));
        }

        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
      } else {
        if (modifier === '*') {
          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                result.push(this.encodeValue(operator, value[k], k));
              }
            }, this);
          }
        } else {
          var tmp = [];

          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              tmp.push(this.encodeValue(operator, value));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                tmp.push(encodeURIComponent(k));
                tmp.push(this.encodeValue(operator, value[k].toString()));
              }
            }, this);
          }

          if (this.isKeyOperator(operator)) {
            result.push(encodeURIComponent(key) + '=' + tmp.join(','));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(','));
          }
        }
      }
    } else {
      if (operator === ';') {
        result.push(encodeURIComponent(key));
      } else if (value === '' && (operator === '&' || operator === '?')) {
        result.push(encodeURIComponent(key) + '=');
      } else if (value === '') {
        result.push('');
      }
    }
    return result;
  };

  /**
   * @param {string} template
   * @return {function(Object):string}
   */
  UrlTemplate.prototype.parse = function (template) {
    var that = this;
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    return {
      expand: function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
          if (expression) {
            var operator = null,
                values = [];

            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }

            expression.split(/,/g).forEach(function (variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push.apply(values, that.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
            });

            if (operator && operator !== '+') {
              var separator = ',';

              if (operator === '?') {
                separator = '&';
              } else if (operator !== '#') {
                separator = operator;
              }
              return (values.length !== 0 ? operator : '') + values.join(separator);
            } else {
              return values.join(',');
            }
          } else {
            return that.encodeReserved(literal);
          }
        });
      }
    };
  };

  return new UrlTemplate();
}));

},{}],23:[function(_dereq_,module,exports){
'use strict';

var minilog = _dereq_('minilog')
  , mediaTypes = _dereq_('./lib/media_types')
  , Builder = _dereq_('./lib/builder')
  , mediaTypes = _dereq_('./lib/media_types')
  , mediaTypeRegistry = _dereq_('./lib/media_type_registry');

// activate this line to enable logging
// require('minilog').enable();

// export builder for traverson-angular
exports._Builder = Builder;

/**
 * Creates a new request builder instance.
 */
exports.newRequest = function newRequest() {
  return new Builder();
};

/**
 * Creates a new request builder instance with the given root URL.
 */
exports.from = function from(url) {
  var builder = new Builder();
  builder.from(url);
  return builder;
};

// Provided for backward compatibility with pre-1.0.0 versions.
// The preferred way is to use newRequest() or from() to create a request
// builder and either set the media type explicitly by calling json() on the
// request builder instance - or use content negotiation.
exports.json = {
  from: function(url) {
    var builder = new Builder();
    builder.from(url);
    builder.setMediaType(mediaTypes.JSON);
    return builder;
  }
},

// Provided for backward compatibility with pre-1.0.0 versions.
// The preferred way is to use newRequest() or from() to create a request
// builder and then either set the media type explicitly by calling jsonHal() on
// the request builder instance - or use content negotiation.
exports.jsonHal = {
  from: function(url) {
    if (!mediaTypeRegistry.get(mediaTypes.JSON_HAL)) {
      throw new Error('JSON HAL adapter is not registered. From version ' +
        '1.0.0 on, Traverson has no longer built-in support for ' +
        'application/hal+json. HAL support was moved to a separate, optional ' +
        'plug-in. See https://github.com/basti1302/traverson-hal');
    }
    var builder = new Builder();
    builder.from(url);
    builder.setMediaType(mediaTypes.JSON_HAL);
    return builder;
  }
};

// expose media type registry so that media type plug-ins can register
// themselves
exports.registerMediaType = mediaTypeRegistry.register;

// export media type constants
exports.mediaTypes = mediaTypes;

},{"./lib/builder":9,"./lib/media_type_registry":12,"./lib/media_types":13,"minilog":4}],24:[function(_dereq_,module,exports){
/* global angular */
'use strict';

var traverson = _dereq_('traverson');

var ng;
if (typeof angular !== 'undefined') {
  // angular is defined globally, use this
  ng = angular;
} else {
  // angular is not defined globally, try to require it
  ng = _dereq_('angular');
  if (typeof ng.module !== 'function') {
    throw new Error('angular has either to be provided globally or made ' +
        'available as a shim for browserify. (Also, if the angular module on ' +
        'npm would actually be a proper CommonJS module, this error ' +
        'wouldn\'t be a thing.)');
  }
}

var traversonAngular = ng.module('traverson', []);

traversonAngular.factory('traverson', ['$q', function traversonFactory($q) {
  var Builder = traverson._Builder;
  var originalMethods = {
    get: Builder.prototype.get,
    getResource: Builder.prototype.getResource,
    getUri: Builder.prototype.getUri,
    post: Builder.prototype.post,
    put: Builder.prototype.put,
    patch: Builder.prototype.patch,
    delete: Builder.prototype.delete,
  };

  function promisify(that, originalMethod, argsArray) {
    var deferred = $q.defer();

    argsArray = argsArray || [];

    var callback = function(err, result, uri) {
      if (err) {
        err.result = result;
        err.uri = uri;
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    };

    argsArray.push(callback);

    var traversal = originalMethod.apply(that, argsArray);

    // TODO What we actually want is
    // return {
    //   result: deferred.promise,
    //   abort: traversal.abort;
    // };
    //
    // - that is, return an object that only has two properties
    // (result: the promise, abort: the function to abort the traversal) but
    // that would break clients, which rely on the returned value being the
    // promise. Have to wait until next breaking relase (2.0.0) to change that.
    // For now, we return the promise directly, but also tack the properties
    // result (again, the promise, attached to itself) and abort (the function
    // to abort the traversal) to it.
    var returnValue = deferred.promise;
    returnValue.result = deferred.promise;
    returnValue.abort = traversal.abort;
    return returnValue;
  }

  Builder.prototype.get = function() {
    return promisify(this, originalMethods.get);
  };

  Builder.prototype.getResource = function() {
    return promisify(this, originalMethods.getResource);
  };

  Builder.prototype.getUri = function() {
    return promisify(this, originalMethods.getUri);
  };

  Builder.prototype.post = function(body) {
    return promisify(this, originalMethods.post, [body]);
  };

  Builder.prototype.put = function(body) {
    return promisify(this, originalMethods.put, [body]);
  };

  Builder.prototype.patch = function(body) {
    return promisify(this, originalMethods.patch, [body]);
  };

  Builder.prototype.delete = Builder.prototype.del = function() {
    return promisify(this, originalMethods.delete);
  };

  return traverson;
}]);


traversonAngular.factory('$httpTraversonAdapter', [
  '$http', function $httpTraversonAdapterFactory($http) {

    function Request() { }

    Request.prototype.get = function(uri, options, callback) {
      return $http.get(uri, mapOptions(options))
        .then(handleResponse(callback))
        .catch(handleError(callback));
    };

    Request.prototype.post = function(uri, options, callback) {
      return $http.post(uri, mapOptions(options))
        .then(handleResponse(callback))
        .catch(handleError(callback));
    };

    Request.prototype.put = function(uri, options, callback) {
      return $http.put(uri, mapOptions(options))
        .then(handleResponse(callback))
        .catch(handleError(callback));
    };

    Request.prototype.patch = function(uri, options, callback) {
      return $http.patch(uri, mapOptions(options))
        .then(handleResponse(callback))
        .catch(handleError(callback));
    };

    Request.prototype.del = function(uri, options, callback) {
      return $http.delete(uri, mapOptions(options))
        .then(handleResponse(callback))
        .catch(handleError(callback));
    };

    function mapOptions(options) {
      options = options || {};
      var newOptions = {};
      mapQuery(newOptions, options);
      mapHeaders(newOptions, options);
      mapAuth(newOptions, options);
      mapBody(newOptions, options);
      mapForm(newOptions, options);
      return newOptions;
    }

    function mapQuery(newOptions, options) {
      newOptions.params = options.query;
    }

    function mapHeaders(newOptions, options) {
      newOptions.headers || (newOptions.headers = {});
    }

    function mapAuth(newOptions, options) {
      var auth = options.auth;
      if (auth) {
        var username = auth.user || auth.username;
        var password = auth.pass || auth.password;
        newOptions.headers || (newOptions.headers = {});
        newOptions.headers.Authorization = 'Basic ' + username + ':' + password;
      }
    }

    function mapBody(newOptions, options) {
      var body = options.body;
      if (body) {
        newOptions.data = body;
      }
    }

    function mapForm(newOptions, options) {
      var form = options.form;
      if (form) {
        newOptions.data = form;
        newOptions.headers || (newOptions.headers = {});
        newOptions.headers['Content-Type'] =
          'application/x-www-form-urlencoded';
      }
    }

    function mapResponse(response) {
      var data = response.data;
      if (typeof data === 'object') {
        response.body = JSON.stringify(response.data);
      } else {
        response.body = data;
      }

      response.statusCode = response.status;
      response.headers = response.headers();
      return response;
    }

    function handleResponse(callback) {
      return function(response) {
        return callback(null, mapResponse(response));
      };
    }

    function handleError(callback) {
      return function(err) {
        return callback(err);
      };
    }

    return new Request();

  }
]);

module.exports = traversonAngular;

},{"angular":1,"traverson":23}]},{},[24])
(24)
});