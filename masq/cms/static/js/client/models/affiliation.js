define(["./base"], function(Base) {

	Affiliation = function() {
		this.name = "";
		this.game = null;
		this.text = "";
		this.primary = true;

		Base.call(this);
	};

	function Affiliation_getInfo(){
		var info = new Object();
		info['className'] = "Affiliation";
		info['pluralName'] = "Affiliations";
		return info;
	}

	Affiliation.prototype = new Base;
	Affiliation.prototype.constructor = Affiliation;
	Affiliation.prototype.getInfo = Affiliation_getInfo;

	var fields = {
		"name": "string",
		"game": "FK-Game",
		"text": "string",
		"primary": "bool",
	};
	Utils_addGettersAndSetters(Affiliation, fields);
	return Affiliation;
});