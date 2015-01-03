define([
	"jquery",
	"utils"],
	function($, utils) {

BaseController = function(){
	control = this;
	this.fieldsToLoad = [];
	this.permissions = [];
};

function BaseController_genericOnLoad(debug){
	this.loadData(debug);
	this.socketHandlerSet = false;
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

BaseController.prototype.constructor = BaseController;
BaseController.prototype.loadData = BaseController_loadData;
BaseController.prototype.genericOnLoad = BaseController_genericOnLoad;
BaseController.prototype.setGenericHandlers = BaseController_setGenericHandlers;

return BaseController;
});