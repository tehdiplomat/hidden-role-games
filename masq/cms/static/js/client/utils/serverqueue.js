/**
 * ServerQueue attempts to maintain SOAP server calls
 * for loading and saving objects
 */

//Server information. Implements a singleton as seen in:
// http://www.yuiblog.com/blog/2007/06/12/module-pattern/

var ServerQueue = (function() {
	var __queue__ = new Array();
	var functions = new Array();
	var parameters = new Array();
	return {
		toString: function(){
			var retval = "ServerQueue: <br /><br />";
			for (var x in __queue__) {
				retval = retval + __queue__[x] + "<br />";
			}
			return retval + "<br />";
		},
		isEmpty: function() {
			return __queue__.length == 0;
		},
		pushCall: function(call) {
			__queue__.unshift(call);
		},
		popCall: function() {
			var call = __queue__.shift();
			if (this.isEmpty()) {
				ServerQueue.executeFunctions();
			}
			return call;
		},
		whenDone: function(func, params){
			if (ServerQueue.isEmpty()){
				if (func instanceof Function){
					func(params);
				}
			} else {
				functions.push(func);
				parameters.push(params);
			}
		},
		executeFunctions: function() {
			var copyfuncs=functions;
			var copyparams=parameters;
			functions = new Array();
			params = new Array();
			for (var x = 0; x < copyfuncs.length; x++) {
				var func = copyfuncs[x];
				var params = copyparams[x];
				func(params);
			}
			return null;
		}
	}
})();