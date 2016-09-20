var chartsInitialized = false;
var dashboardLineChart = null;
var dashboardBarChart = null;
var pieSport = null;
var pieBoulder = null;
var data_opinions = []; // For problem page Morris chart.
var tickSaved = false;

Template7.registerHelper('stringify', function (context){
    var str = JSON.stringify(context);
    // Need to replace any single quotes in the data with the HTML char to avoid string being cut short
    return str.split("'").join('&#39;');
});

// Initialize your app
var myApp = new Framework7({
	preprocess: function (content, url, next) {
		var matches = null;
		if (url == null) {
			if (next != null) {
				next(content);
			}
			return;
		}
		/* 
		 * If a single group is being fetched, go ahead, find the group data 
		 * via API, compile the template and since it is an AJAX call,
		 * one has to call next() to advance in the processing 
		 */
		if ((matches=url.match(/problematormobile\/group\/(\d+)/i))) {
			var groupid = matches[1];
			var url = window.api.apicallbase + "group/";
			$$.jsonp(url, {id : groupid}, function (data){ 
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {group : JSON.parse(data)};
				next(compiledTemplate(dataJSON));
			});
		} else if ((matches=url.match(/dashboard.html/))) {
			$.jsonp(window.api.apicallbase+"dashinfo/?id="+Cookies.get("uid"),{},function(data) {
				loginCheck(data);
				$.jStorage.set("grades",data.grades);
				var compiledTemplate = Template7.compile(content);
				var html = compiledTemplate(data);
				next(html);
			});
		} else if ((matches=url.match(/problems.html/))) {

			// Load problems page data and compile the template
			//
			var url = window.api.apicallbase + "problems/?jsonp=true";

			$.jsonp(url, {}, function (data){ 
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {walls : data};
				next(compiledTemplate(dataJSON));
			});
		} else if ((matches=url.match(/invite_member.html.*?(\d+)/))) {
			var groupid = matches[1];
			var url = window.api.apicallbase + "group/";
			$.jsonp(url, {id : groupid}, function (data){ 
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {group : data};
				next(compiledTemplate(dataJSON));
			});
		} else if ((matches=url.match(/list_group_members.html.*?(\d+)/))) {
			// List group members
			var groupid = matches[1];
			var url = window.api.apicallbase + "list_group_members/";
			$.jsonp(url, {id : groupid}, function (data){ 
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {"group" : data};
				var html = compiledTemplate(dataJSON);
				next(html);
			});

		} else if ((matches=url.match(/problem.html.*?(\d+)/))) {
			// List group members
			var pid = matches[1];
			var url = window.api.apicallbase + "problem";
			$.jsonp(url, {id : pid}, function (data){ 
				var compiledTemplate = Template7.compile(content);
				data.grades = $.jStorage.get("grades");
				var html = compiledTemplate(data);
				next(html);
			});



		} else {
			if (content ==  null || content == "") {
				return "";
			}
			var template = Template7.compile(content);
			var resultContent = template();
			return resultContent; 
		}
	},
    precompileTemplates: true,
		template7Pages: true, // need to set this
		modalTitle: "Problemator"
})

// Export selectors engine (jQuery ish )
var $$ = Dom7;

// Add views - this app uses only a main view stack
var mainView = myApp.addView('.view-main', {
	dynamicNavbar: true
});

myApp.onPageInit("*",function(page) {
  var pagename = page.name;
  var matches = null;
  /*
     addGroupMemberListeners(pagename);
     addInviteMemberPageListeners(pagename);
     addSingleGroupPageListeners(pagename,page.url);
     addGroupPageListeners(pagename);
     addProblemsPageListeners(pagename);
     */
  addDashBoardListeners(pagename);
  addIndexPageListeners(pagename,page);

});


document.addEventListener("deviceready", function(){
    console.log("Device is ready... :)");

    addLoginPageListeners();
         },true);




