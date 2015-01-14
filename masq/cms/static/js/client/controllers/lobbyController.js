require([
		"controllers/baseController",
		"qrcode",
		

		//models
		"models/game",
		"models/gameSession",
		"models/role",
		"models/affiliation",
		"models/player"
	],
	function(BaseController) {

	function LobbyController() {
		BaseController.call(this);

		this.fieldsToLoad = ["games", "gameSessions", "players", "affiliations", "roles"];

		this.genericOnLoad();

		this.setHandlers();
	}

	function LobbyController_setHandlers() {
		this.setGenericHandlers();
		if (!this.initiateLocalPlayer()) 
			return;
		this.genericSubscribePusher("player" + local);
		this.setGameHandlers();
		this.setInviteHandler();
		this.setDomState();
	}

	function LobbyController_initiateLocalPlayer() {
		if (local) {
			window.localStorage['localId'] = local;
		} else if ('localId' in window.localStorage) {
			if (window.localStorage['localId'] in this.players)
				local = window.localStorage['localId'];
		} else {
			// No localId and no localStorage with the id that means this player... doesn't exist.
			// Spit out error with message on how to join, or rejoin
			alert("Error message goes here")

			return false;
		}

		this.player = this.players[local];
		this.session = this.gameSessions[this.player.getSession()];

		$(".playerName").val(this.player.getName());
		$(".playerPin").val(this.player.getPin());
		$(".playerHost").prop('checked', this.player.getHost());

		return true;
	}

	function LobbyController_setGameHandlers() {
		var copy = this;
		$(".editPlayer").click(function() {
			var fields = ["name", "pin"];

			copy.player.setName($(".playerName").val());
			copy.player.setPin($(".playerPin").val());
			copy.player.update({callback: function() {
				if (copy.player.failed) {
					console.log(copy.player.response);
					alert("Failed to update your player change")
				} else {
					alert("Updated!");
				}
			}, changedFields: fields});
		});

		$(".addRole").click(function() {
			console.log("Adding Role", $(this).parent().data('id'));
			copy.session.addRole($(this).parent().data('id'));
			copy.session.save();
		});

		$(".removeRole").click(function() {
			console.log("Adding Role", $(this).parent().data('id'));
			copy.session.removeRole($(this).parent().data('id'));
			copy.session.save();
		});


		$(".startSession").click(function() {
			commandData = {
				'model': 'system',
				'action': 'startSession',
				//'roles': roleList.join(),
				'session': copy.session
			}
			Utils_sendCommand({'data': commandData}, function() {
				console.log("In callback");
				// DO THINGS
			});
		});
	}

	function LobbyController_setInviteHandler() {
		var copy = this;
		this.inviteQR = new QRCode("inviteQR", {
			text : inviteURL,
			width : 128,
			height : 128
		});
	}

	function LobbyController_setDomState() {
		// TODO Check for Player presence in the push server


		// TODO Check which Roles are already assigned into the session
		for(var role in this.roles) {
			var roleDom = $(".role[data-id='"+ role + "']")
			if (role in this.session.roles) {
				$(".removeRole", roleDom).prop('disabled', false);
			} else {
				$(".addRole", roleDom).prop('disabled', false);
			}
		}
	}

	LobbyController.prototype = new BaseController;
	LobbyController.prototype.constructor = LobbyController;
	LobbyController.prototype.setHandlers = LobbyController_setHandlers;
	LobbyController.prototype.initiateLocalPlayer = LobbyController_initiateLocalPlayer;
	LobbyController.prototype.setGameHandlers = LobbyController_setGameHandlers;
	LobbyController.prototype.setInviteHandler = LobbyController_setInviteHandler;
	LobbyController.prototype.setDomState = LobbyController_setDomState;
	new LobbyController();
});