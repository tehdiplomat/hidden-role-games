//Server information. Implements a singleton as seen in:
// http://www.yuiblog.com/blog/2007/06/12/module-pattern/

var ServerInfo = (function() {
	var protocol= null;
	var serverIP= null;
	var port=null;
	var appName= null;

	function initializeAll(){
		var href = window.location.href;
		var fileProt = 'file://'
		
		if (href.indexOf(fileProt) == 0) {
			protocol = 'file';
			folder = href.lastIndexOf('/');
			serverIP = href.substr(fileProt.length, folder-fileProt.length);
			return;
		}

		var splitHref = href.split("/");
		if (splitHref.length >= 3){
			protocol = splitHref[0].slice(0, -1);
			
			var splitUrl = splitHref[2].split(":");
			serverIP = splitUrl[0];
			if (splitUrl.length > 1)
				port = parseInt(splitUrl[1], 10);
		}
		else{
			console.log("ServerInfo: No suitable match found with string: " + window.location.href + " (match object: " + matcher + ")");
		}
	}
	initializeAll();


	return {
		toString: function(){
			return this.generateStaticPath();
		},
		initializeProtocol: function() {
			var parts = new Array();
			parts = (window.location.href).split("://");
			protocol = parts[0];
		},
		getProtocol: function() {
			return protocol;
		},
		initializeServerIP: function() {
			var parts = new Array();
			parts = (window.location.href).split("/");
			serverIP = parts[2];
		},
		getPort: function(){
			return port;
		},
		getServerIP: function() {
			return serverIP;
		},
		initializeAppName: function() {
			var parts = new Array();
			parts = (window.location.href).split("/");
			appName = parts[3];
		},
		getPath: function() {
			return protocol+"://" + serverIP + (port ? ":" + port : "") + "/";
		},
		generateStaticPath: function() {
			return this.getPath() + "static/";
		},
		generateStaticPathFor: function(element){
			return "" + this.generateStaticPath() + element;
		},
		generateAppPagePath: function() {
			if (!appName) {
				this.initializeAppName();
			}
			return this.getPath() + appName + "/";
		},
		generateAppPagePathFor: function(page) {
			return this.generateAppPagePath() + page;
		}
	}
})();