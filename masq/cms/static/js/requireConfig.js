require = {
	paths: {
		"jquery": ServerInfo.generateStaticPathFor("js/lib/jquery/jquery-2.1.3.min"),

		"models": ServerInfo.generateStaticPathFor("js/client/models"),
		"modules": ServerInfo.generateStaticPathFor("js/client/modules"),
		"controllers": ServerInfo.generateStaticPathFor("js/client/controllers"),

		"utils": ServerInfo.generateStaticPathFor("js/client/utils/utils"),
		"lib": ServerInfo.generateStaticPathFor("js/lib"),
	},
	shim: {
		"jquery": {
			"exports": "jQuery"
		},

		"utils": ["jquery"],
	}
};
if ("MQ_VERSION" in window) {
	require.urlArgs = "v=" + window.ZC_VERSION;
}