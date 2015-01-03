/**
 * Base is the abstract class from which all data
 * classes are derived
 */

 define(["utils"], function() {

	DEFAULT_APP_NAME = "cms";

/**
 * @Constructor(): creates a new Base and sets
 * asynchronous running of SOAP callbacks to true
 */
Base = function() {
	this.id = null;
	this.modified = new Date();
	this.failed = null;
	this.response = null;
	this.allData = {};
	this._cancelNotify = false;
	this.internalAttrs = ["failed", "response", "allData", "ignoreAttrs", "_cancelNotify", "internalAttrs"];
	this.ignoreAttrs = [];
	// TODO Get rid of allData if I can by using a function on the Base()
};

function Base_getId(){
	return this.id;
}

function Base_setId(id){
	var idTmp = parseInt(id, 10);
	if (! isNaN(idTmp) && idTmp){
		this.id = idTmp;
	}else{
		this.id = null;
	}
}

function Base_getModified() {
	return this.modified;
}
function Base_setModified(l) {
	if (!(l instanceof Date))
		l = new Date(l);
	this.modified = l;
}

function Base_getTypeId(){
	return this.getInfo()["className"].decapitalize() + this.getId();
}

function Base_getFailed(){
	var failed = this.failed;
	delete this.failed;
	this.failed = null;
	return failed;
}

function Base_getResponse(){
	var response = this.response;
	delete this.response;
	this.response = null;
	
	return response;
}

function Base_getInfo(){
	console.log("One of your classes (" + Utils_toType(this) + ") doesn't implement 'getInfo()'");
	return null;
}

function Base_getPluralName() {
	var plural = this.getInfo()["pluralName"];
	if (!plural){
		plural = this.getInfo()["className"].capitalize() + "s";
	}
	return plural;
}

function Base_getAllData(){
	var allData = this.allData;
	this.allData = null;
	delete this.allData;
	return allData;
}

function Base_isFunctionOrInternalAttribute(attr){
	return (this[attr] instanceof Function) || (this.internalAttrs.indexOf(attr) >= 0) || (attr == "internalAttrs");
}

function Base_toString() {
	var str = "";
	
	for(var attr in this){
		// Skip Functions or Internal Attributes that don't need to be grabbed
		if (this.isFunctionOrInternalAttribute(attr))
			continue;
		
		var value = this["get" + attr.capitalize()]();
		if (value instanceof Array){
			if (value.length > 0){
				str += attr;
				str += "<ul>";
				for (var i=0; i < value.length; i++)
					str +="<li>" + value[i] + "</li>";
				
				str += "</ul>";
			}
		}
		else
			str += attr + ": " + value + "<br />";
	}
	return str + "<br />";
}

function Base_clone() {
	return (new this.constructor()).copyFrom(this);
}

function Base_copyFrom(obj) {
	var copy = this;
	for(var attr in obj){
		// Skip Functions or Internal Attributes that don't need to be grabbed
		if (obj.isFunctionOrInternalAttribute(attr))
			continue;

		var upperedCaseAttr = attr.capitalize();
		var value = obj["get" + upperedCaseAttr]();
		var clonedValue = null;
		if (value instanceof Array){
			clonedValue = [];
			for (var i=0; i < value.length; i++){
				if(value[i] instanceof Base && value[i]["clone"]){
					clonedValue.push(value[i].clone());
				}else{
					clonedValue.push(value[i]);
				}
			}
		}
		else
			clonedValue = value;

		if (clonedValue || clonedValue === 0 || clonedValue === 0.0 || clonedValue === "" || clonedValue === false)
			copy["set" + upperedCaseAttr](clonedValue);
	}
	return this;
}

function Base_deepCloneAndExpand(viewController, options) {
	var clone = this.clone();
	clone.setId(null);
	for (var attr in clone) {
		var val = clone[attr];
		if (val instanceof Array && $.inArray(attr, options.empty)!=-1) {
			clone[attr] = [];
		}
		else if (val instanceof Array && $.inArray(attr, options.ignore)==-1) {
			var dictName = attr;
			if (attr == 'children') {
				dictName = this.getPluralName();
			}
			if (viewController[dictName]) {
				for (var i=0; i<val.length; ++i) {
					if (viewController[dictName][val[i]] instanceof Base) {
						val[i] = viewController[dictName][val[i]].deepCloneAndExpand(viewController, options);
					}
				}
			}
		}
		else if ($.inArray(attr, options.nullify)!=-1) {
			clone[attr] = null;
		}
	}
	return clone;
}

/**
 * Method @toJSON: Returns the object to be jsonized. Visit http://www.json.org/js.html for further information)
 * set jsDates to true if you would like to keep the milliseconds in your dates
 */
function Base_toJSON(jsDates){
	var jsonObject = {};
	for(var attr in this){
		// Skip Functions or Internal Attributes that don't need to be grabbed
		if (this.isFunctionOrInternalAttribute(attr))
			continue;

		if (attr != "id" && attr.slice(-2).toLowerCase() == "id" && ("get" + attr.slice(0,-2).capitalize() in this)) { //foreign key
			attr = attr.slice(0,-2);
		}
		
		var value = this["get" + attr.capitalize()]();
		if (value || value === 0 || value === "" || value === false || value === null){
			if (value instanceof Date)
				value = value.getTime()/(jsDates ? 1 : 1000);	// I don't care about milliseconds going to the server
			jsonObject[attr] = value;
		}
	}
	return jsonObject;
}

/**
 * Method @toPartialJSON(): creates and returns a JSON Object whose contents are
 * only the "id" and the fields (or attributes) found in the "attrs" parameter
 * (which has to be an array of strings)
 */
function Base_toPartialJSON(attrs, jsDates){
	var partialObject = {};
	
	if (!attrs || attrs.length == 0)
		return partialObject;
	
	for(var a in attrs){
		var attr = attrs[a];
		// Skip Functions or Internal Attributes that don't need to be grabbed
		if (this.isFunctionOrInternalAttribute(attr) || attr == "id")
			continue;
	
		var value = this["get" + attr.capitalize()]();
		if (value || value === 0 || value === "" || value === false || value === null){
			if (value instanceof Date) {
				value = value.getTime()/(jsDates ? 1 : 1000);	// I don't care about milliseconds going to the server
			}
			partialObject[attr] = value;
		}
	}
	return partialObject;
}

function Base_fromJSONObject(jsonobj){
	for(var attr in jsonobj){
		if (this.internalAttrs.indexOf(attr) < 0 && this.ignoreAttrs.indexOf(attr) < 0){
			var funcName = "set" + attr.toCamel().capitalize();
			if ($.isFunction(this[funcName]))
				this[funcName](jsonobj[attr]);
			//else
				//console.log("Warning: missing " + funcName + " method in " + this.getInfo()["className"]);
		}
	}
	return this;
}

/**
 * Method @fromJSONObjectAll(Object jsonobj): gets the fields from
 * an [Object] generated by a (whatever)Manager.py (therefore, which does
 * not contain only one "device" object but a list of "device" objects,
 * converts them to Device objects and pushes them
 */
function Base_fromJSONObjectAll(jsonobj, keepOrdered){
	var jsonObject;
	if (keepOrdered)
		jsonObject = [];
	else
		jsonObject = {};

	var pluralName = this.getPluralName();

	var objs;

	if (jsonobj[pluralName]){
		objs = jsonobj[pluralName];
	} else {
		objs = jsonobj;
	}

	for (var i=0; i < objs.length; i++){
		var element = new this.constructor();
		element.fromJSONObject(objs[i]);
		if (keepOrdered)
			jsonObject.push(element);
		else
			jsonObject[element.getId()] = element;
	}

	return jsonObject;
}

function Base_fromDjangoJSONObjectAll(jsonobj, keepOrdered) {
	if (keepOrdered)
		jsonObject = [];
	else
		jsonObject = {};

	var info = this.getInfo(),
		appName = info.appName || DEFAULT_APP_NAME; //having appName defined in the info dictionary allows auth models to work correctly

	if (jsonobj instanceof Object && this.getPluralName().decapitalize() in jsonobj) {
		jsonobj = jsonobj[this.getPluralName().decapitalize()];
	}

	if (!(jsonobj instanceof Array)) {
		jsonobj = [jsonobj];
	}

	for (var i=0; i<jsonobj.length; ++i) {
		if ("model" in jsonobj[i]) { //make sure it really is a django object
			var modelUnderscore = jsonobj[i].model.indexOf("_");
			if (modelUnderscore != -1) { //if the model name has an underscore in it, everything before the underscore is the actual model name, everything after is just added on after a "defer"
				jsonobj[i].model = jsonobj[i].model.substr(0, modelUnderscore);
			}
			if (jsonobj[i].model == appName + "." + info.className.toLowerCase()) {
				var element = new this.constructor();
				element.setId(jsonobj[i].pk);
				element.fromJSONObject(jsonobj[i].fields);
				if (keepOrdered)
					jsonObject.push(element);
				else
					jsonObject[element.getId()] = element;
			}
		} else { //must just be a normal JSON object
			var element = new this.constructor();
			element.fromJSONObject(jsonobj[i]);
			if (keepOrdered)
				jsonObject.push(element);
			else
				jsonObject[element.getId()] = element;
		}
	}
	return jsonObject;
}

function Base_getRestURL(){
	return ServerInfo.getPath() + "api/" + this.getInfo()["className"].decapitalize() + "/";
}

function Base_getById(passedOpts) {
	Utils_requireParams(passedOpts, ["id"]);
	var opts = { //defaults
		id: null,
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var copy = null;
	var id = parseInt(opts.id, 10);
	if (id){
		copy = this;
		copy.failed = true;
		copy.response = null;
		ServerQueue.pushCall("get [" + this.getInfo()["className"] + "] ById");
		$.ajax({
			url: copy.getRestURL() + id + "/",
			type: "GET",
			dataType: 'json',
			success: function(response, textStatus, xmlHttpRequest) {
				copy.failed = false;
				copy.getResponse();
				var contentType = xmlHttpRequest.getResponseHeader("Content-Type").toLowerCase().split(';');
				switch(contentType[0]){
					case "text/xml":
						copy.fromXML(response);
						break;
					case "application/json":
						if (response instanceof Array) {
							response = response[0];
						}
						copy.fromJSONObject(response);
						break;
					default:
						copy.failed = true;
				}
				ServerQueue.popCall();
				opts.callback.call(copy);
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				//alert(XMLHttpRequest.responseText);
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
				ServerQueue.popCall();
				opts.callback.call(copy);
			}
		});
	}
}

function Base_refresh() {
	var auxObj = new this.constructor();
	var copy = this;
	auxObj.getById({
		id: this.getId(),
		callback: function() {
		if (!this.failed) //access directly instead of calling getFailed so the value is still there
			copy.copyFrom(auxObj);
		}
	});
}

function Base_getByQuery(passedOpts) {
	Utils_requireParams(passedOpts, ["params"]);
	var opts = { //defaults
		params: {},
		keepOrdered: false,
		nonModelData: false,
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var params = opts.params;
	var keepOrdered = opts.keepOrdered;

	//get is for getting :)

	var copy = this;
	var data = {};
	copy.failed = true;
	copy.response = null;
	ServerQueue.pushCall("get [" + copy.getInfo()["className"] + "] ByCustomQuery");

	for (var ext in opts.params)
		data[ext] = params[ext];

	$.ajax({
		url: copy.getRestURL(),
		type: "GET",
		data: data,
		contentType: "json",
		success: function(response, textStatus, xmlHttpRequest) {
			copy.failed = false;
			copy.getResponse();
			var contentType = xmlHttpRequest.getResponseHeader("Content-Type").toLowerCase().split(';');
			switch(contentType[0]){
				case "text/xml":
					copy.allData = copy.fromXMLAll(response, keepOrdered);
					break;
				case "application/json":
					if (!opts.nonModelData) {
						copy.allData = copy.fromDjangoJSONObjectAll(response.results, keepOrdered);
					}
					copy.response = response;
					break;
				case "text/plain":
					copy.allData = response;
					break;
				default:
					copy.response = contentType[0] + " Content-Type not supported";
					copy.failed = true;
			}
			ServerQueue.popCall();
			opts.callback.call(copy);
		},
		error: function(xmlHttpRequest,textStatus,errorThrown) {
			//alert(XMLHttpRequest.responseText);
			copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
			copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
			copy.getAllData();	//delete the this.allData field
			ServerQueue.popCall();
			opts.callback.call(copy);
		}
	});
}

function Base_update(passedOpts){
	var copy = this;

	Utils_requireParams(passedOpts, ["changedFields"]);
	var opts = { //defaults
		changedFields: [],
		extraParams: {},
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var attrs = opts.changedFields;
	var extraParams = opts.extraParams;

	if (!attrs || attrs.length === 0) {
		opts.callback.call(this);
		return;
	}

	//console.log(attrs);
	
	// Put is for Updating! (Nothing to get returned aside from Failed/Success)
	var id = this.getId();
	if (id){
		var data = this.toPartialJSON(attrs);
		copy.failed = true;
		copy.response = null;
		ServerQueue.pushCall("put [" + this.getInfo()["className"] + "] ById");
		//console.log(data);
		// Don't need ID in data, since the URL now has the ID
		//data["id"] = id;
		if (document.socketIO_connID) {
			data["connID"] = document.socketIO_connID;
		}

		for(var ext in extraParams) {
			data[ext] = extraParams[ext];
		}

		$.ajax({
			url: copy.getRestURL() + id + "/" ,
			type: "PATCH",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(response) {
				copy.failed = false;
				copy.response = response;
				ServerQueue.popCall();
				opts.callback.call(copy);
				/*if (!copy.shouldCancelNotify())
					toast.notify({message: copy.getInfo()["className"] + " saved successfully."});*/
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				//alert(XMLHttpRequest.responseText);
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
				ServerQueue.popCall();
				opts.callback.call(copy);
			}
		});
	} else {
		copy.failed = copy.response = "Element didn't pass the validity check.";
		opts.callback.call(copy);
	}
}

function Base_updateMultiple(passedOpts) {
	Utils_requireParams(passedOpts, ["ids", "attrs"]);
	var opts = {
		ids: [],
		attrs: [],
		extraParams: {},
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var ids = passedOpts.ids;
	if (!ids || ids.length === 0) {
		opts.callback.call(this);
		return;
	}

	// Put is for Updating! (Nothing to get returned aside from Failed/Success)
	var copy = this;
	var data = this.toPartialJSON(opts.attrs);
	copy.failed = true;
	copy.response = null;
	ServerQueue.pushCall("put [" + this.getInfo()["className"] + "] ByIds");
	console.log(data);
	data["ids"] = JSON.stringify(ids);
	if (document.socketIO_connID) {
		data["connID"] = document.socketIO_connID;
	}

	for(var ext in opts.extraParams)
		data[ext] = opts.extraParams[ext];

	$.ajax({
		url: copy.getRestURL(),
		type: "PUT",
		data: JSON.stringify(data),
		contentType: "application/json",
		success: function(response) {
			copy.failed = false;
			copy.response = response;
			ServerQueue.popCall();
			opts.callback.call(copy);
			/*if (!copy.shouldCancelNotify())
				toast.notify({message: copy.getPluralName() + " saved successfully."});*/
		},
		error: function(xmlHttpRequest,textStatus,errorThrown) {
			//alert(XMLHttpRequest.responseText);
			copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
			copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
			copy.getAllData();	//delete the this.allData field
			ServerQueue.popCall();
			opts.callback.call(copy);
		}
	});
}

function Base_updateAll(passedOpts) {
	Utils_requireParams(passedOpts, ["attrs"]);
	var opts = { //defaults
		attrs: [],
		extraParams: {},
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var attrs = opts.attrs;
	var extraParams = opts.extraParams;

	// Put is for Updating! (Nothing to get returned aside from Failed/Success)
	var copy = this;
	var data = this.toPartialJSON(attrs);
	copy.failed = true;
	copy.response = null;
	ServerQueue.pushCall("put [" + this.getInfo()["className"] + "] All");
	console.log(data);
	data["id"] = "all";
	if (document.socketIO_connID) {
		data["connID"] = document.socketIO_connID;
	}

	for(var ext in extraParams)
		data[ext] = extraParams[ext];

	$.ajax({
		url: copy.getRestURL(),
		type: "PUT",
		data: JSON.stringify(data),
		contentType: "application/json",
		success: function(response) {
			copy.failed = false;
			copy.response = response;
			ServerQueue.popCall();
			opts.callback.call(copy);
			/*if (!copy.shouldCancelNotify())
				toast.notify({message: copy.getPluralName() + " saved successfully."});*/
		},
		error: function(xmlHttpRequest,textStatus,errorThrown) {
			//alert(XMLHttpRequest.responseText);
			copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
			copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
			copy.getAllData();	//delete the this.allData field
			ServerQueue.popCall();
			opts.callback.call(copy);
		}
	});
}

function Base_create(passedOpts){
	var opts = { //defaults
		extraParams: {},
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var extraParams = opts.extraParams;

	// Post is for Creating (with returned stuff)
	if (!(this.getId())){
		var copy = this;
		var data = "";
		copy.failed = true;
		copy.response = null;

		var obj = this.toJSON();
		if (arguments.length > 0)
			for(var ext in extraParams)
				obj[ext] = extraParams[ext];

		if (document.socketIO_connID) {
			obj["connID"] = document.socketIO_connID;
		}

		//console.log(obj);
		data = JSON.stringify(obj); //pass as a json string (not as a dictionary, which jQuery would convert to GET-style parameters)

		ServerQueue.pushCall("post [" + this.getInfo()["className"] + "] ById");

		$.ajax({
			url: copy.getRestURL(),
			type: "POST",
			data: data,
			contentType: "application/json",
			success: function(response) {
				copy.failed = false;
				copy.response = response;
				var createResponse = copy.getResponse();
				var id = parseInt(createResponse);
				var multipleItems = false;
				
				if (!isNaN(id))//Sets the id and deletes the "response" field
					copy.setId(id);
					
				else{
					// Create Objects from returned Response
					var data = (Utils_testType(createResponse, "string") ? $.parseJSON(createResponse) : createResponse);
					var objects = copy.fromDjangoJSONObjectAll(data);
					
					var assignedId = false;
					copy.getAllData();	//delete the this.allData field
					for(var o in objects){
						if (!assignedId){
							copy.setId(o);
							assignedId = true;
						}
						else{
							copy.allData = objects;
							multipleItems = true;
							break;
						}
					}
					if (assignedId && !multipleItems) { //only one item
						//copy.fromJSONObject(objects[copy.getId()].toJSON());
						copy.copyFrom(objects[copy.getId()]);
					}
					if (copy.getPluralName().decapitalize() in data) { //multiple types of objects were created
						copy.allData = data;
					}
				}
					
				ServerQueue.popCall();
				opts.callback.call(copy);
				/*if (!copy.shouldCancelNotify())
					toast.notify({message: (multipleItems ? copy.getPluralName() : copy.getInfo()["className"]) + " created successfully."});*/
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				//				window.alert("Base_putById. Got error: " + XMLHttpRequest.responseText);
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
				ServerQueue.popCall();
				opts.callback.call(copy);
			}
		});
	}else{
		this.failed = this.response = "Trying to POST element with id==" + this.getId() + "Please, use PUT instead.";
		opts.callback.call(this);
	}
}

function Base_createMultiple(passedOpts) {
	var opts = { //defaults
			extraParams: {},
			callback: function() {}
		},
		copy = this;

	$.extend(opts, passedOpts);

	Utils_requireParams(opts, ["objects"]);

	var objects = opts.objects;

	// Post is for Creating (with returned stuff)
	if (objects && objects.length) {
		var data = {
			"objects": objects
		};

		for (var i in opts.extraParams) {
			data[i] = opts.extraParams[i];
		}

		ServerQueue.pushCall("post [" + this.getPluralName() + "] ById");

		$.ajax({
			url: copy.getRestURL(),
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(response) {
				copy.failed = false;

				var respData = (Utils_testType(response, "string") ? $.parseJSON(response) : response),
					respObjects = copy.fromDjangoJSONObjectAll(respData);

				copy.allData = respObjects;

				ServerQueue.popCall();
				opts.callback.call(copy);
				/*if (!copy.shouldCancelNotify())
					toast.notify({message: copy.getPluralName() + " created successfully."});*/
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				//				window.alert("Base_putById. Got error: " + XMLHttpRequest.responseText);
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
				ServerQueue.popCall();
				opts.callback.call(copy);
			}
		});
	} else {
		console.warn("Nothing to create", objects);
		opts.callback.call(copy);
	}
}

function Base_deleteById(passedOpts) {
	var opts = { //defaults
		extraParams: {},
		callback: function() {}
	};
	var copy = this;

	$.extend(opts, passedOpts);

	var extraParams = opts.extraParams;

	// Delete is for Delete :-d
	var id = this.getId();
	if (id){
		copy.failed = true;
		copy.response = null;

		ServerQueue.pushCall("delete [" + this.getInfo()["className"] + "] ById");
		var json= {};
		json["id"] = this.getId();
		if (document.socketIO_connID) {
			json["connID"] = document.socketIO_connID;
		}
		for(var ext in extraParams) {
			json[ext] = extraParams[ext];
		}
		var data = JSON.stringify(json);
		$.ajax({
			url: copy.getRestURL() + id + "/" ,
			type: "DELETE",
			data: data,
			contentType: "application/json",
			//csrfmiddlewaretoken: '{{ csrf_token }}',
			success: function(response) {
				copy.failed = false;
				copy.response = response;
				ServerQueue.popCall();
				opts.callback.call(copy);
				/*if (!copy.shouldCancelNotify())
					toast.notify({message: copy.getInfo()["className"] + " deleted successfully."});*/
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				//alert(XMLHttpRequest.responseText);
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
				ServerQueue.popCall();
				opts.callback.call(copy);
			}
		});
	} else {
		copy.failed = copy.response = "Element needs to have an Id to be deleted.";
		opts.callback.call(copy);
	}
}

function Base_deleteByIds(passedOpts) {
	Utils_requireParams(passedOpts, ["ids"]);
	var opts = {
		ids: [],
		extraParams: {},
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var ids = opts.ids;
	var extraParams = opts.extraParams;

	// Delete is for Delete :-d
	if (ids instanceof Array){
		if (ids.length === 0) {
			return;
		}
		var copy = this;
		copy.failed = true;
		copy.response = null;

		ServerQueue.pushCall("delete [" + this.getInfo()["className"] + "] ByIds");
		var json= {};
		json["ids"] = ids;
		if (document.socketIO_connID) {
			json["connID"] = document.socketIO_connID;
		}
		for(var ext in extraParams) {
			json[ext] = extraParams[ext];
		}
		var data = JSON.stringify(json);
		$.ajax({
			url: copy.getRestURL(),
			type: "DELETE",
			data: data,
			contentType: "application/json",
			//csrfmiddlewaretoken: '{{ csrf_token }}',
			success: function(response) {
				copy.failed = false;
				copy.response = response;
				ServerQueue.popCall();
				opts.callback.call(copy);
				/*if (!copy.shouldCancelNotify())
					toast.notify({message: copy.getPluralName() + " deleted successfully."});*/
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				//alert(XMLHttpRequest.responseText);
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
				ServerQueue.popCall();
				opts.callback.call(copy);
			}
		});
	}else{
		this.failed = this.response = "An array of ids must be provided.";
	}
}

function Base_sendCommand(passedOpts) {
	Utils_requireParams(passedOpts, ["action"]);
	var opts = { //defaults
		action: "",
		identifier: {
			"id": this.getId()
		},
		additionalData: null,
		url: null,
		callback: function() {}
	};

	$.extend(opts, passedOpts);

	var action = opts.action;
	var additionalData = opts.additionalData;

	var hasIdentifier = false;
	for (var i in opts.identifier) {
		if (opts.identifier[i]) {
			hasIdentifier = true;
		}
		break;
	}
	if (hasIdentifier) {
		var copy = this;
		copy.failed = true;
		copy.response = null;

		var data = {
			model: copy.getInfo()["className"],
			action: action
		};
		for (var i in opts.identifier) {
			data[i] = opts.identifier[i];
		}
		if (additionalData) {
			$.extend(data, additionalData);
		}
		Utils_sendCommand({
			data: data,
			url: opts.url,
			success: function(response, textStatus, xmlHttpRequest) {
				copy.failed = false;
				copy.response = response;
			},
			error: function(xmlHttpRequest,textStatus,errorThrown) {
				copy.failed=(xmlHttpRequest.status ? xmlHttpRequest.status : true);
				copy.response = (xmlHttpRequest.status && "responseText" in xmlHttpRequest) ? xmlHttpRequest.responseText : "Server unresponsive";
				copy.getAllData();	//delete the this.allData field
			}
		}, function() {
			opts.callback.call(copy);
		});
	} else {
		this.failed = this.response = "Element didn't pass the validity check.";
	}
}

function Base_getFieldsArray() {
	var fieldsArr = [];
	for (var attr in this) {
		// Skip Functions or Internal Attributes that don't need to be grabbed
		if (this.isFunctionOrInternalAttribute(attr))
			continue;
		fieldsArr.push(attr);
	}
	return fieldsArr;
}

// To be called inside an AJAX callback if the related toast notification should not happen
function Base_cancelNotify() {
	this._cancelNotify = true;
}

function Base_shouldCancelNotify() {
	var shouldCancel = this._cancelNotify;
	this._cancelNotify = false;
	return shouldCancel;
}


Base.prototype.constructor = Base;
Base.prototype.getId = Base_getId;
Base.prototype.getTypeId = Base_getTypeId;
Base.prototype.setId = Base_setId;
Base.prototype.getModified = Base_getModified;
Base.prototype.setModified = Base_setModified;
Base.prototype.getFailed = Base_getFailed;
Base.prototype.getResponse = Base_getResponse;
Base.prototype.getInfo = Base_getInfo;
Base.prototype.getPluralName = Base_getPluralName;
Base.prototype.getAllData = Base_getAllData;
//
Base.prototype.clone = Base_clone;
Base.prototype.copyFrom = Base_copyFrom;
Base.prototype.deepCloneAndExpand = Base_deepCloneAndExpand;
Base.prototype.fromJSONObjectAll = Base_fromJSONObjectAll;
Base.prototype.fromDjangoJSONObjectAll = Base_fromDjangoJSONObjectAll;
Base.prototype.toString = Base_toString;
Base.prototype.toJSON = Base_toJSON;
Base.prototype.toPartialJSON = Base_toPartialJSON;
Base.prototype.fromJSONObject = Base_fromJSONObject;

Base.prototype.isFunctionOrInternalAttribute = Base_isFunctionOrInternalAttribute;

Base.prototype.getFieldsArray = Base_getFieldsArray;

// Rest APIs
Base.prototype.getRestURL = Base_getRestURL;
Base.prototype.getById = Base_getById;
Base.prototype.refresh = Base_refresh;
Base.prototype.getByQuery = Base_getByQuery;
Base.prototype.create = Base_create;
Base.prototype.createMultiple = Base_createMultiple;
Base.prototype.update = Base_update;
Base.prototype.updateMultiple = Base_updateMultiple;
Base.prototype.updateAll = Base_updateAll;
Base.prototype.deleteById = Base_deleteById;
Base.prototype.deleteByIds = Base_deleteByIds;
Base.prototype.sendCommand = Base_sendCommand;

// Used by Rest APIs
Base.prototype.cancelNotify = Base_cancelNotify;
Base.prototype.shouldCancelNotify = Base_shouldCancelNotify;

return Base;
});
