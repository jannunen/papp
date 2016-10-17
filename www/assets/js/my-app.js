var chartsInitialized = false;
var dashboardLineChart = null;
var dashboardBarChart = null;
var pieSport = null;
var pieBoulder = null;
var data_opinions = []; // For problem page Morris chart.
var tickSaved = false;
window.initialized = false;
Template7.registerHelper('stringify', function (context){
	var str = JSON.stringify(context);
	// Need to replace any single quotes in the data with the HTML char to avoid string being cut short
	return str.split("'").join('&#39;');
});

// Initialize your app
var myApp = new Framework7({
	init : false,
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
debugger;
		if ((matches=url.match(/group.html.*?(\d+)/i))) {
			var groupid = matches[1];
			var url = window.api.apicallbase + "group/";
			$.jsonp(url, {id : groupid}, function (data){ 
				if (!Cookies.get("loginok")) {
					return false;
				}
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {group : data};
				next(compiledTemplate(dataJSON));
			});
		} else if ((matches=url.match(/dashboard.html/))) {
			$.jsonp(window.api.apicallbase+"dashinfo/?id="+Cookies.get("uid"),{},function(data) {
				if (!Cookies.get("loginok")) {
					return false;
				}
				loginCheck(data);
				myApp.hidePreloader();
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
				if (!Cookies.get("loginok")) {
					return false;
				}
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {walls : data};
				next(compiledTemplate(dataJSON));
			});
		} else if ((matches=url.match(/invite_member.html.*?(\d+)/))) {
			var groupid = matches[1];
			var url = window.api.apicallbase + "group/";
			$.jsonp(url, {id : groupid}, function (data){ 
				loginCheck(data);
				if (!Cookies.get("loginok")) {
					return false;
				}
				var compiledTemplate = Template7.compile(content);
				var dataJSON = {group : data};
				next(compiledTemplate(dataJSON));
			});
		} else if ((matches=url.match(/groups.html/))) {
			// List group members
			var url = window.api.apicallbase + "groups/";
			$.jsonp(url, {}, function (data){
				if (!Cookies.get("loginok")) {
					return false;
				}
				var compiledTemplate = Template7.compile(content);
				var html = compiledTemplate(data);
				next(html);
			});
		} else if ((matches=url.match(/list_group_members.html.*?(\d+)/))) {
debugger;
			// List group members
			var groupid = matches[1];
			var url = window.api.apicallbase + "list_group_members/";
			$.jsonp(url, {id : groupid}, function (data){ 
				if (!Cookies.get("loginok")) {
					return false;
				}
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
				if (!Cookies.get("loginok")) {
					return false;
				}
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
	modalTitle: "Problemator",
	pushState : true,
})



// Export selectors engine (jQuery ish )
var $$ = Dom7;

// Add views - this app uses only a main view stack
var mainView = myApp.addView('.view-main', {
	dynamicNavbar: true
});

$$(document).on('pageInit', function (e) {
	// Check if login ok and go for dashboard init if is.
	//
	if (!window.initialized) {
		// If first initializing, add listeners to listen sidebar menu items
		addIndexPageListeners("index");
		if (Cookies.get("loginok")) {
			myApp.closeModal(".login-screen");
			var uid = Cookies.get("uid");
			$("#userid").val(uid);
			window.uid = uid;
		  // Go here only if the page is empty or it is dashboard...
		  var uri = e.target.baseURI;
		  if (uri.match(/\d+\.\d+.\d+\.\d+.*?\//) || uri.match(/localho.*\//) || uri.match(/dashboard/i)) {
		    indexController.initializeIndexPage();
		  }
		} else {
			addLoginPageListeners();
			myApp.loginScreen();
		}
		window.initialized = true;
	} 
});
myApp.init(); // init app manually after you've attached all handlers
myApp.onPageInit("*",function(page) {
  var pagename = page.name;
  var matches = null;

  if (!Cookies.get("loginok")) {
    return false;
  }
  console.log("Initi: "+pagename);
  addGroupMemberListeners(pagename);
  addInviteMemberPageListeners(pagename);
  addSingleGroupPageListeners(pagename,page.url);
  addGroupPageListeners(pagename);
  addSingleProblemListeners(pagename);
  addProblemsPageListeners(pagename);
  addDashBoardListeners(pagename);

});


document.addEventListener("deviceready", function(){
	console.log("Device is ready... :)");
},true);




