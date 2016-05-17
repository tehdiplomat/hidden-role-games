String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.decapitalize = function() {
	return this.charAt(0).toLowerCase() + this.slice(1);
};

//h/t to http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
String.prototype.toCamel = function(){
	return this.replace(/([\-_][a-z])/g, function($1){return $1.toUpperCase().replace('-','').replace('_','');});
};

String.prototype.format = function() {
	var args = arguments;
	return this.replace(/\{(\d+)\}/g, function(match, number) {
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};

jQuery.fn.condClass = function(className, cond) {
	if (cond) {
		return this.addClass(className);
	} else {
		return this.removeClass(className);
	}
};

//taken from http://stackoverflow.com/a/841121/1058609
jQuery.fn.selectRange = function(start, end) {
	if(!end) end = start;
	return this.each(function() {
		if (this.setSelectionRange) {
			this.focus();
			this.setSelectionRange(start, end);
		} else if (this.createTextRange) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		}
	});
};

//polyfilling transform to include vendor prefixes if necessary
//http://api.jquery.com/jQuery.cssHooks/
(function($) {
	if ( !$.cssHooks ) {
		throw("jQuery 1.4.3+ is needed for this plugin to work");
		return;
	}

	function styleSupport( prop, altProps ) {
		var vendorProp, supportedProp,
		capProp = prop.capitalize(),
		prefixes = [ "Moz", "Webkit", "O", "ms" ],
		div = document.createElement( "div" );

		if ( prop in div.style ) {
			supportedProp = prop;
		} else {
			var i = 0;
			for ( ; i < prefixes.length; i++ ) {
				vendorProp = prefixes[i] + capProp;
				if ( vendorProp in div.style ) {
					supportedProp = vendorProp;
					break;
				}
			}
			if (!supportedProp && altProps) {
				for ( ; i < altProps.length; i++ ) {
					vendorProp = altProps[i];
					if ( vendorProp in div.style ) {
						supportedProp = vendorProp;
						break;
					}
				}
			}
		}

		div = null;
		$.support[ prop ] = supportedProp;
		return supportedProp;
	}

	var transform = styleSupport( "transform" );

	// Set cssHooks only for browsers that
	// support a vendor-prefixed transform
	if ( transform && transform !== "transform" ) {
		$.cssHooks.transform = {
			get: function( elem, computed, extra ) {
				return $.css( elem, transform );
			},
			set: function( elem, value ) {
				elem.style[ transform ] = value;
			}
		};
	}

	var flex = styleSupport("flex", ["WebkitBox-flex", "MozBox-flex"]),
		flexGrow = styleSupport("flexGrow", (flex ? [flex] : [])),
		flexBasis = styleSupport("flexBasis", (flex ? [flex] : []));

	if (flex && flex !== "flex") {
		$.cssHooks.flex = {
			get: function( elem, computed, extra ) {
				return $.css( elem, flex );
			},
			set: function( elem, value ) {
				elem.style[ flex ] = value;
			}
		};
	}

	$.cssNumber.flexGrow = true;
	if (flexGrow && flexGrow !== "flexGrow") {
		if (flexGrow.substr(-4).toLowerCase() === "flex") {
			$.cssHooks.flexGrow = {
				get: function( elem, computed, extra ) {
					return $.css( elem, flexGrow ).split(" ")[0];
				},
				set: function( elem, value ) {
					var prev = $.css( elem, flexGrow ),
						arr = prev.split(" ");
					arr[0] = value;
					elem.style[ flexGrow ] = arr.join(" ");
				}
			};
		} else {
			$.cssHooks.flexGrow = {
				get: function( elem, computed, extra ) {
					return $.css( elem, flexGrow );
				},
				set: function( elem, value ) {
					elem.style[ flexGrow ] = value;
				}
			};
		}
	}

	if (flexBasis && flexBasis !== "flexBasis") {
		if (flexBasis.substr(-8).toLowerCase() === "Box-flex") {
			$.cssHooks.flexBasis = {
				get: function( elem, computed, extra ) {
					return $(elem).width();
				},
				set: function( elem, value ) {
					elem.style.width = value;
				}
			};
		} else if (flexBasis.substr(-4).toLowerCase() === "flex") {
			$.cssHooks.flexBasis = {
				get: function( elem, computed, extra ) {
					return $.css( elem, flexBasis ).split(" ")[2];
				},
				set: function( elem, value ) {
					var prev = $.css( elem, flexBasis ),
						arr = prev.split(" ");
					arr[2] = value;
					elem.style[ flexBasis ] = arr.join(" ");
				}
			};
		} else {
			$.cssHooks.flexBasis = {
				get: function( elem, computed, extra ) {
					return $.css( elem, flexBasis );
				},
				set: function( elem, value ) {
					elem.style[ flexBasis ] = value;
				}
			};
		}
	}
})(jQuery);

// provide support for RequestAnimationFrame ("polyfill")
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

//standardize Date.now
(function() {
	if (!Date.now) {
		Date.now = function now() {
			return +(new Date());
		};
	}
})();

//provide support for substr negative indexing
//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substr
(function() {
	// only run when the substr function is broken
	if ('ab'.substr(-1) != 'b')
	{
		/**
		*  Get the substring of a string
		*  @param  {integer}  start   where to start the substring
		*  @param  {integer}  length  how many characters to return
		*  @return {string}
		*/
		String.prototype.substr = function(substr) {
			return function(start, length) {
				// did we get a negative start, calculate how much it is from the beginning of the string
				if (start < 0) start = this.length + start;

				// call the original function
				return substr.call(this, start, length);
			};
		}(String.prototype.substr);
	}
})();

$(document).ajaxSend(function(event, xhr, settings) {
	function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	function sameOrigin(url) {
		// url could be relative or scheme relative or absolute
		var host = document.location.host; // host + port
		var protocol = document.location.protocol;
		var sr_origin = '//' + host;
		var origin = protocol + sr_origin;
		// Allow absolute or scheme relative URLs to same origin
		return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
			(url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
			// or any other URL that isn't scheme relative or absolute i.e relative.
			!(/^(\/\/|http:|https:).*/.test(url));
	}
	function safeMethod(method) {
		return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}

	if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
		xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
	}
});

function Utils_parseIDFromString(string, afterString){
	var temp = null;
	if(afterString){
		var regex = new RegExp(afterString + "(\\d+)", "gi");
		temp = regex.exec(string);//selects first occurrence of a number after specified string
	}else {
		if(string)
			temp = string.match(/\d+/g);//select first occurrence of a number
	}

	if(temp) {
		return parseInt(temp[afterString ? 1 : 0], 10);
	}else {
		return null;
	}
}

function Utils_suppressConsole(func) {
	var tmp = console.log;
	console.log = function() {};
	func();
	console.log = tmp;
}

function Utils_convertToPythonDayOfWeek(dayOfWeek){
	return (dayOfWeek + 6) % 7;
}

function Utils_secondsToWords(secs, useWks) {
	//~~ (double bitwise negation) rounds towards zero
	secs = ~~(secs);
	var mins = ~~(secs/60),
		hrs = ~~(mins/60),
		days = ~~(hrs/24),
		wks = ~~(days/7),
		yrs = ~~(days/365);

	if (yrs) {
		return yrs + " Year" + (Math.abs(yrs) == 1 ? "" : "s");
	} else if (wks && useWks) {
		return wks + " Week" + (Math.abs(wks) == 1 ? "" : "s");
	} else if (days) {
		return days + " Day" + (Math.abs(days) == 1 ? "" : "s");
	} else if (hrs) {
		return hrs + " Hour" + (Math.abs(hrs) == 1 ? "" : "s");
	} else if (mins) {
		return mins + " Minute" + (Math.abs(mins) == 1 ? "" : "s");
	} else {
		return secs + " Second" + (Math.abs(secs) == 1 ? "" : "s");
	}
}

function Utils_sendCommand(opts, callback) {
	//sends a POST to command for non-standard actions
	var restUrl;
	if (opts.url) {
		restUrl = opts.url;
	} else {
		restUrl = ServerInfo.generateAppPagePathFor("command/");
	}

	var data = opts.data;
	
	ServerQueue.pushCall("command [" + data.model + "] (" + data.action + ")");
	$.ajax({
		url: restUrl,
		type: "GET",
		data: data,
		contentType: "application/json",
		success: function(response) {
			if ($.isFunction(opts.success)) {
				opts.success(response);
			}
			ServerQueue.popCall();
			if ($.isFunction(callback)) {
				callback();
			}
		},
		error: function(xmlHttpRequest,textStatus,errorThrown) {
			if ($.isFunction(opts.error)) {
				opts.error(xmlHttpRequest,textStatus,errorThrown);
			}
			ServerQueue.popCall();
			if ($.isFunction(callback)) {
				callback();
			}
		}
	});
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function hexToRGB(h){return {r: hexToR(h), g: hexToG(h), b: hexToB(h)};}

//HSV/HSL COLOR CONVERSION FUNCTIONS FROM http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; // achromatic
	}else{
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r:h = (g - b) / d + (g < b ? 6 : 0);break;
			case g:h = (b - r) / d + 2;break;
			case b:h = (r - g) / d + 4;break;
		}
		h /= 6;
	}

	return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
	var r, g, b;

	if(s == 0){
		r = g = b = l; // achromatic
	}else{
		function hue2rgb(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
	r = r/255, g = g/255, b = b/255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max == 0 ? 0 : d / max;

	if(max == min){
		h = 0; // achromatic
	}else{
		switch(max){
			case r:h = (g - b) / d + (g < b ? 6 : 0);break;
			case g:h = (b - r) / d + 2;break;
			case b:h = (r - g) / d + 4;break;
		}
		h /= 6;
	}

	return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
	var r, g, b;

	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);

	switch(i % 6){
		case 0:r = v, g = t, b = p;break;
		case 1:r = q, g = v, b = p;break;
		case 2:r = p, g = v, b = t;break;
		case 3:r = p, g = q, b = v;break;
		case 4:r = t, g = p, b = v;break;
		case 5:r = v, g = p, b = q;break;
	}

	return [r * 255, g * 255, b * 255];
}

//cookie functions copied from http://jquery-howto.blogspot.com/2010/09/jquery-cookies-getsetdelete-plugin.html
function Utils_setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function Utils_getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function Utils_deleteCookie(name) {
	Utils_setCookie(name,"",-1);
}

function Utils_escapeHTML(str) {
	return $("<div>").text(str).html();
}

//code from http://stackoverflow.com/a/6969486/1058609
var Utils_escapeRegExp;

(function () {
  // Referring to the table here:
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
  // these characters should be escaped
  // \ ^ $ * + ? . ( ) | { } [ ]
  // These characters only have special meaning inside of brackets
  // they do not need to be escaped, but they MAY be escaped
  // without any adverse effects (to the best of my knowledge and casual testing)
  // : ! , =
  // my test "~!@#$%^&*(){}[]`/=?+\|-_;:'\",<.>".match(/[\#]/g)

  var specials = [
		// order matters for these
		"-",
		"[",
		"]",
		// order doesn't matter for any of these
		"/",
		"{",
		"}",
		"(",
		")",
		"*",
		"+",
		"?",
		".",
		"\\",
		"^",
		"$",
		"|"
	],

	  // I choose to escape every character with '\'
	  // even though only some strictly require it when inside of []
	regex = RegExp('[' + specials.join('\\') + ']', 'g')
	;

  Utils_escapeRegExp = function (str) {
	return str.replace(regex, "\\$&");
  };

  // test escapeRegExp("/path/to/res?search=this.that")
}());

function Utils_setDateToDayStart(date) {
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

function Utils_testType(obj, type) {
	if (obj instanceof Base) {
		return obj.getInfo()['className'] == type;
	} else {
		return (typeof(obj)=="object" && type in window && $.isFunction(window[type]) && obj instanceof window[type]) || Utils_toType(obj)==type;
	}
}

function Utils_toType(obj) { //http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

//wrapped in a function to avoid making typeToValidator global
(function() {

	var validatorFailed = {};
	var typeToValidator = {
		'int': function(val) {
			if (isNaN(val))
				return validatorFailed;
			return val;
		},
		'bool': function(val) {
			return !!val;
		},
		'nullBool': function(val) {
			if (val === null)
				return val;
			else
				return !!val;
		},
		'date': function(val) {
			if (val instanceof Date || val.toString().indexOf(":")!=-1 || val.toString().indexOf("/")!=-1) {
				return new Date(val);
			} else {
				return new Date(val*1000); //assume if it's not a Date object or a date string, it's coming from Python (which doesn't have the milliseconds)
			}
		},
		'nullDate': function(val) {
			if (val === null) {
				return null;
			} else {
				return typeToValidator.date(val);
			}
		},
		'dateString': function(val) {
			if (val instanceof Date) {
				return val.getFullYear() + "-" + (val.getMonth() + 1) + "-" + val.getDate();
			} else if (+val === val) { //numeric type, assume timestamp from server
				return typeToValidator.dateString(new Date(val*1000));
			} else if (val.toString().indexOf("-")!=-1 || val.toString().indexOf(":")!=-1 || val.toString().indexOf("/")!=-1) { //already a date string
				return typeToValidator.dateString(new Date(val)); //convert to a date and back to a string to ensure the format is correct
			} else {
				return validatorFailed; //all valid data types have been checked, so it's a fail
			}
		},
		'nullDateString': function(val) {
			if (val === null || val === '') {
				return '';
			} else {
				return typeToValidator.dateString(val);
			}
		},
		'string': function(val) { //this is also the default for any unrecognized type
			return val;
		}
	};

	//function takes the model for the getters and setters to be added to, and a dictionary with entries in the form fieldName: fieldType
	//When the type is another model, fieldType should be of the form FK-<model name>
	Utils_addGettersAndSetters = function(model, fields) {
		for (var f in fields) {
			//NOTE: this was running into what I've seen called the "infamous loop problem"
			//That's why there are all these nested anonymous functions being called
			//I found a pretty good explanation here: http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/

			var fieldType = fields[f];
			if (fieldType.substring(0, 2)=="FK") { //Foreign key, syntax FK-<model name>)
				var fkModel = fieldType.substring(3);

				//setter that accepts objects
				model.prototype['set' + f.capitalize()] = function(f, fkModel) {
					return function(val) {
						if (Utils_testType(val, fkModel)) { //check if it's of the appropriate type
							this['set' + f.capitalize() + 'Id'](val.getId());
							return; //don't proceed to set it to the passed in value
						}
						this['set' + f.capitalize() + 'Id'](val);
					}
				}(f, fkModel);

				//setter for just IDs
				model.prototype['set' + f.capitalize() + 'Id'] = function(f) {
					return function(val) {
						this[f + 'Id'] = val;
					}
				}(f);

				//getter has 2 names for foreign keys
				model.prototype['get' + f.capitalize()] = model.prototype['get' + f.capitalize() + 'Id'] = function(f) {
					return function() {
						return this[f + 'Id'];
					}
				}(f);
			} else {
				var validator;
				if (fieldType in typeToValidator)
					validator = typeToValidator[fieldType];
				else
					validator = typeToValidator.string; //default to string because string doesn't check anything

				model.prototype['set' + f.capitalize()] = function(f, validator) {
					return function(val) {
						var validatedVal = validator(val);
						if (validatedVal===validatorFailed) //failed (e.g. non-number passed to int field)
							return;
						this[f] = validatedVal;
					}
				}(f,validator);

				model.prototype['get' + f.capitalize()] = function(f) {
					return function() {
						return this[f];
					}
				}(f);
			}
		}
	}
})();

//checks to make sure a class exists, returns an instance of it if it does, otherwise returns null
function Utils_safeClass(c) {
	if (c in window && $.isFunction(window[c]) && 'constructor' in window[c]) {
		return window[c];
	} else if (require.defined("model/" + c.decapitalize())) {
		return require.config("model/" + c.decapitalize());
	} else {
		return null;
	}
}

function Utils_requireParams(params, required) {
	var missing = [];

	for (var i=0, ii=required.length; i<ii; ++i) {
		if (!(required[i] in params)) {
			missing.push(required[i]);
		}
	}
	if (missing.length) {
		console.log("WARNING: Missing required field(s): " + missing.toString());
	}
}

function Utils_arrToSet(arr) {
	var set = {};
	try{
		// Just in case the "array" that's sent in isn't actually iterable
		for (var i=0; i<arr.length; ++i) {
			set[arr[i]] = null;
		}
	} catch(e) {
		console.log(e);
	}
	return set;
}

function Utils_setToArr(set, type) {
	if (arguments.length == 1) {
		type = "str";
	}
	type = type.toLowerCase();
	if (Object.keys && Array.prototype.map && type == "str") {
		return Object.keys(set);
	}
	var arr = [];
	for (var data in set) {
		if (type == "number" || type == "num" || type == "float") {
			arr.push(+data);
		} else if (type == "int") {
			arr.push(Math.round(+data));
		} else { //string
			arr.push(data);
		}
	}
	return arr;
}

function Utils_mapToArr(map) {
	var arr = [];
	for (var key in map) {
		arr.push(map[key]);
	}
	return arr;
}

function Utils_arrToMap(arr) {
	var map = {};
	for (var i = 0; i < arr.length; i++) {
		map[i + 1] = arr[i];
	}
	return map;
}

function Utils_setEmpty(set) {
	for (var i in set) {
		return false;
	}
	return true;
}

function Utils_setComp(set1, set2) {
	var comp = {};
	for (var data in set1) {
		if (!(data in set2)) {
			comp[data] = null;
		}
	}
	return comp;
}

function Utils_setDiff(set1, set2) {
	return Utils_setJoin(Utils_setComp(set1, set2), Utils_setComp(set2, set1));
}

function Utils_arrComp(arr1, arr2) {
	var set1 = Utils_arrToSet(arr2);
	var comp = {};
	
	for (var i=0; i<arr2.length; ++i) {
		if (!(arr2[i] in set1)) {
			comp[arr2[i]] = "";
		}
	}
	return Utils_setToArr(comp);
}

function Utils_setJoin(set1, set2) {
	var joined = {};
	for (var i in set1) {
		joined[i] = null;
	}
	for (var i in set2) {
		joined[i] = null;
	}
	return joined;
}


/**
 * jQuery.fn.sortElements
 * http://james.padolsey.com/javascript/sorting-elements-with-jquery/
 * --------------
 * @param Function comparator:
 *   Exactly the same behaviour as [1,2,3].sort(comparator)
 *
 * @param Function getSortable
 *   A function that should return the element that is
 *   to be sorted. The comparator will run on the
 *   current collection, but you may want the actual
 *   resulting sort to occur on a parent or another
 *   associated element.
 *
 *   E.g. $('td').sortElements(comparator, function(){
 *      return this.parentNode;
 *   })
 *
 *   The <td>'s parent (<tr>) will be sorted instead
 *   of the <td> itself.
 */
jQuery.fn.sortElements = (function(){

	var sort = [].sort;

	return function(comparator, getSortable) {

		getSortable = getSortable || function(){return this;};

		var placements = this.map(function(){

			var sortElement = getSortable.call(this),
				parentNode = sortElement.parentNode,

				// Since the element itself will change position, we have
				// to have some way of storing its original position in
				// the DOM. The easiest way is to have a 'flag' node:
				nextSibling = parentNode.insertBefore(
					document.createTextNode(''),
					sortElement.nextSibling
				);

			return function() {

				if (parentNode === this) {
					throw new Error(
						"You can't sort elements if any one is a descendant of another."
					);
				}

				// Insert before flag:
				parentNode.insertBefore(this, nextSibling);
				// Remove flag:
				parentNode.removeChild(nextSibling);

			};

		});

		return sort.call(this, comparator).each(function(i){
			placements[i].call(getSortable.call(this));
		});

	};

})();

jQuery.fn.positionRelTo = function(relTo) {
	var walker = this,
		top = 0,
		left = 0;
	relTo = $(relTo);

	if (relTo.find(this).length === 0) {
		var thisOff = this.offset(),
			relOff = relTo.offset();

		top = relOff.top - thisOff.top;
		left = relOff.left - thisOff.left;
	} else {
		var pos;
		while (!walker.is(relTo) && relTo.find(walker).length !== 0) {
			pos = walker.position();
			top += pos.top;
			left += pos.left;
			walker = walker.offsetParent();
		}
	}
	return {
		top: top,
		left: left
	};
};
