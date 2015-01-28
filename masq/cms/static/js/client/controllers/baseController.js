define([
	"jquery",
	"utils",
	"lib/pusher.min"],
	function($, utils) {

BaseController = function(){
	control = this;
	this.fieldsToLoad = [];
	this.permissions = [];
};

function BaseController_genericOnLoad(debug){
	this.loadData(debug);
}

function BaseController_loadData(debug){
	var copy = this;

	var notificationFields = {};

	var dataBlock = $("#data");
	dataBlock.children().each(function() {
		var elInfo = $(this).data(),
			data = elInfo.json; //jQuery auto-converts into a Javascript object

		if (data === undefined || data === "") {
			console.warn("Missing json for data element", this);
			return; //continue to next
		}

		if (data !== null && data.toString() === data) { //strings aren't auto-converted from JSON strings to actual strings (in other words, they still have the quotes)
			data = JSON.parse(data);
		}

		//console.log(data);
		if (elInfo.model) {
			var Class = Utils_safeClass(elInfo.model);
			if (!Class) {
				console.warn("Warning: Class " + elInfo.model + " not found. Probably not loaded.");
				return; //continue to next
			}
			copy[Class.prototype.getPluralName().decapitalize()] = (new Class()).fromDjangoJSONObjectAll(data);
		} else {
			var field = elInfo.field;
			if (!field) {
				console.warn("Missing field on element", this);
				return; //continue to next
			}
			copy[field] = data;
		}
	});

	dataBlock.remove(); //no longer needed, so we remove it from the DOM
}

function BaseController_setGenericHandlers(parent) {
	var copy = this;

	if (arguments.length === 0)
		parent = $("html");

	this.setMenuHandler();
	//button text shouldn't be selectable
	//$(".button").disableSelection();

	//backwards compatibility for the "placeholder" tag
	$(function() {
		var i = document.createElement('input');
		if (!('placeholder' in i)) {
			$("input[placeholder]").each(function() {
				$(this).unbind("focusin").unbind("focusout").focusin(function() {
					if ($(this).data("showing-placeholder")=="T") {
						$(this).val("").data("showing-placeholder","F").removeClass("greyText");
					}
				}).focusout(function() {
					if ($(this).val() === "") {
						$(this).addClass("greyText").val($(this).attr("placeholder")).data("showing-placeholder","T");
					}
				}).addClass("greyText").val($(this).attr("placeholder")).data("showing-placeholder","T");
			});

			//make sure jQuery val isn't returning the placeholder text as the value
			if (!("prePlaceholderVal" in $.fn)) {
				$.fn.prePlaceholderVal = $.fn.val;
				$.fn.val = function(a) {
					if (arguments.length === 0) {
						if ($(this).data("showing-placeholder")=="T") {
							return "";
						} else {
							return $(this).prePlaceholderVal();
						}
					}
					return $(this).prePlaceholderVal(a);
				};
			}
		}
		delete i;
	});
}

function BaseController_genericSubscribePusher(channel) {
	var copy = this;
	this.pusher = new Pusher('d00c939a712a8d7290e6');
	this.pusher.connection.bind('connected', function() {
		copy.socketId = copy.pusher.connection.socket_id;
	});
	this.channel = this.pusher.subscribe(channel);
	//this.channel.bind('my_event', function(data) {
	//	alert(data.message);
	//});
}

function BaseController_setMenuHandler() {
	//Open the menu
	// Change to classes
	$(".menu").click(function() {

		$('#mainArea').css('min-height', $(window).height());

		$('nav').css('opacity', 1);
		$('nav').css('z-index', 1);

		//set the width of primary content container -> content should not scale while animating
		var contentWidth = $('#mainArea').width();

		//set the content with the width that it has originally
		$('#content').css('width', contentWidth);

		//display a layer to disable clicking and scrolling on the content while menu is shown
		$('#mainOverlay').css('display', 'block');

		//disable all scrolling on mobile devices while menu is shown
		$('#page').bind('touchmove', function (e) {
			e.preventDefault()
		});

		//set margin for the whole page with a $ UI animation
		$("#page").animate({"marginRight": "30%"}, {
			duration: 200
		});

	});

	//close the menu
	$("#mainOverlay").click(function() {
		//enable all scrolling on mobile devices when menu is closed
		$('#page').unbind('touchmove');

		//set margin for the whole page back to original state with a $ UI animation
		$("#page").animate({"marginRight": "-1" }, {
			duration: 200,
			complete: function () {
				$('#mainArea').css('width', 'auto');
				$('#mainOverlay').css('display', 'none');
				$('nav').css('opacity', 0);
				$('nav').css('z-index', -1);
				$('#mainArea').css('min-height', 'auto');
			}
		});
	});

	$("nav li").click(function() {
		// Activate chosen panel
		var panel = $(this).data("panel");

		$(".panel").removeClass("active");
		$("."+panel).addClass("active");
		$("#mainOverlay").click();

	});
}

BaseController.prototype.constructor = BaseController;
BaseController.prototype.loadData = BaseController_loadData;
BaseController.prototype.genericOnLoad = BaseController_genericOnLoad;
BaseController.prototype.setGenericHandlers = BaseController_setGenericHandlers;
BaseController.prototype.setMenuHandler = BaseController_setMenuHandler;
BaseController.prototype.genericSubscribePusher = BaseController_genericSubscribePusher;

return BaseController;
});