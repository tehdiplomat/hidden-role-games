define(["./base"], function(Base) {

	Role = function() {
		this.name = "";
		this.gameId = null;
		this.affiliation = null;
		this.text = "";
		this.generic = true;
		this.maxPerGame = 0;
		
		Base.call(this);
	};

	function Role_getInfo(){
		var info = new Object();
		info['className'] = "Role";
		info['pluralName'] = "Roles";
		return info;
	}

	Role.prototype = new Base;
	Role.prototype.constructor = Role;
	Role.prototype.getInfo = Role_getInfo;

	var fields = {
		"name": "string",
		"game": "FK-Game",
		"affiliation": "FK-Affiliation",
		"text": "string",
		"generic": "bool",
		"maxPerGame": "int",
	};
	Utils_addGettersAndSetters(Role, fields);
	return Role;
});