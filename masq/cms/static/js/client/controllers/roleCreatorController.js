require([
		"controllers/baseController",

		//models
		"models/game",
		"models/affiliation",
		"models/role"
	],
	function(BaseController) {

	function RoleCreatorController() {
		BaseController.call(this);

		this.fieldsToLoad = ["game", "affiliation"];

		this.genericOnLoad();

		this.setHandlers();
	}

	function RoleCreatorController_setHandlers() {
		this.setGenericHandlers();
		this.setCreationHandlers();
	}

	function RoleCreatorController_setCreationHandlers() {
		var copy = this;
		$(".gameSelect").change(function() {
			$(".affiliationSelect").val(0);
			$(".affiliation").prop("disabled", true);
			$(".game_" + $(this).val()).prop("disabled", false);
			//$(".clearRoles").click();
		});

		$(".createRoles").click(function() {
			var game = $(".gameSelect").val();
			var aff = $(".affiliationSelect").val();

			console.log("Game - ", game, " Affiliation - ", aff);

			$(".role").each(function(i) {
				var v = $(this).val();
				if (v != '') {
					var r = new Role();
					r.setName(v);
					r.setGame(parseInt(game));
					r.setAffiliation(parseInt(aff));
					r.setGeneric(false);
					console.log(r);
					r.create();
				}
			});
		});

		$(".clearRoles").click(function() {
			$(".role").each(function(i) {
				$(this).val('');
			});
		});
	}


	RoleCreatorController.prototype = new BaseController;
	RoleCreatorController.prototype.constructor = RoleCreatorController;
	RoleCreatorController.prototype.setHandlers = RoleCreatorController_setHandlers;
	RoleCreatorController.prototype.setCreationHandlers = RoleCreatorController_setCreationHandlers;
	new RoleCreatorController();
});