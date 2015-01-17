define(["./base", "models/role"], function(Base) {

	GameSession = function() {
		this.name = "";
		this.gameId = null;
		this.active = true;
		this.roles = [];

		Base.call(this);
	};

	function GameSession_getInfo(){
		var info = new Object();
		info['className'] = "GameSession";
		info['pluralName'] = "GameSessions";
		return info;
	}

	function GameSession_getRoles(){
		return this.roles;
	}

	function GameSession_setRoles(roles){
		this.roles = [];

		for (var r in roles)
			this.addRole(roles[r]);
	}

	function GameSession_addRole(role){
		if (!role)
			return;
		else if (role instanceof Role)
			this.roles.push(role.getId());
		else
			this.roles.push(role);
	}

	function GameSession_removeRole(role){
		var r;
		if (!role)
			return;
		else if (role instanceof Role)
			r = role.getId();
		else
			r = role;

		var idx = this.roles.indexOf(r);
		if (idx > -1) {
			this.roles.splice(idx, 1);
		}	
	}

	GameSession.prototype = new Base;
	GameSession.prototype.constructor = GameSession;
	GameSession.prototype.getInfo = GameSession_getInfo;

	GameSession.prototype.getRoles = GameSession_getRoles;
	GameSession.prototype.setRoles = GameSession_setRoles;
	GameSession.prototype.addRole = GameSession_addRole;
	GameSession.prototype.removeRole = GameSession_removeRole;

	var fields = {
		"name": "string",
		"game": "FK-Game",
		"active": "bool",
	};
	Utils_addGettersAndSetters(GameSession, fields);
	return GameSession;
});