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
		this.genericSubscribePusher("presence-lobby" + this.session.id);
		this.setPushHandlers();
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
			var item = $(this).parent();
			console.log("Adding Role", item.data('id'));
			copy.session.addRole(item.data('id'));
			copy.session.update({"changedFields": [ "roles" ], "callback": function() {
				// Flip disabled buttons
				if (this.failed) {
					console.log("Failed to add role to active roles");
				} else {
					copy.roleActivation(item, true, true);
				}
			} });
		});

		$(".removeRole").click(function() {
			var item = $(this).parent();
			console.log("Removing Role", item.data('id'));
			copy.session.removeRole(item.data('id'));
			copy.session.update({"changedFields": [ "roles" ], "callback": function() {
				// Flip disabled buttons
				if (this.failed) {
					console.log("Failed to remove role from active roles");
				} else {
					copy.roleActivation(item, false, true);
				}
			} });
		});


		$(".startSession").click(function() {
			commandData = {
				'model': 'system',
				'action': 'startSession',
				//'roles': roleList.join(),
				'session': copy.session.getId()
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
		//console.log(this.session.roles);
		for(var role in this.roles) {
			var roleDom = $(".role[data-id='"+ role + "']");
			var flag = this.session.roles.indexOf(parseInt(role)) > -1;
			this.roleActivation(roleDom, flag, false);
		}
		this.updateCounts();
	}

	function LobbyController_roleActivation(roleDom, flag, update) {
		// Activate when flag = true
		// Deactivate when flag = falsa
		if (flag) {
			if (roleDom.parent().hasClass("inactiveRoles")) {
				roleDom.appendTo(".activeRoles");
			}
		} else {
			if (roleDom.parent().hasClass("activeRoles")) {
				roleDom.appendTo(".inactiveRoles");
			}
		}
		// Update numbers in each column
		if (update) {
			this.updateCounts();
		}
	}

	function LobbyController_updateCounts() {
		$(".roleCount", ".inactiveRoles").text($("li", ".inactiveRoles").length);
		$(".roleCount", ".activeRoles").text($("li", ".activeRoles").length);

		$(".playerCount", ".playerPanel").text($("li", ".playerPanel").length);
	}

	function LobbyController_setPushHandlers() {
		var copy = this;
		this.channel.bind('pusher:subscription_succeeded', function() {
			copy.channel.members.each(function(member) {
				activateMember(member, true);
			});
		});
		// Bind to other channels
		this.channel.bind('pusher:member_added', function(member) {
		// for example:
			activateMember(member, true);
		});

		this.channel.bind('pusher:member_removed', function(member) {
			// for example:
			activateMember(member, false);
		});

		function activateMember(member, flag) {
			var userInfo = member.info;
			console.log(userInfo);
			var roleDom = $(".player[data-id='"+ userInfo['id'] + "']");
			if (flag) {
				$(".playerIcon", roleDom).addClass("active").removeClass("waiting");
			} else {
				$(".playerIcon", roleDom).addClass("waiting").removeClass("active");
			}
		}

		this.channel.bind('game', function(data) {
			
			if (data['action'] == 'rolesAssigned') {
				// Is that allowed? Or do we have to just show a button for people to push?
				window.location.href = '/masq/play';
			} else if (data['action'] == 'roundsChanged') {
				$(".sessionRounds").text(data['rounds']);
			} else {
				console.log(data);
			}
		});
	}



	LobbyController.prototype = new BaseController;
	LobbyController.prototype.constructor = LobbyController;
	LobbyController.prototype.setHandlers = LobbyController_setHandlers;
	LobbyController.prototype.initiateLocalPlayer = LobbyController_initiateLocalPlayer;
	LobbyController.prototype.setGameHandlers = LobbyController_setGameHandlers;
	LobbyController.prototype.setInviteHandler = LobbyController_setInviteHandler;
	LobbyController.prototype.setDomState = LobbyController_setDomState;
	LobbyController.prototype.roleActivation = LobbyController_roleActivation;
	LobbyController.prototype.updateCounts = LobbyController_updateCounts;
	LobbyController.prototype.setPushHandlers = LobbyController_setPushHandlers;
	new LobbyController();
});