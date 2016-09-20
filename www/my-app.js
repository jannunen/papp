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


// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    alert("niin ready");
    console.log("After alert");
});



