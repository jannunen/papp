Template7.registerHelper('select_options',function(values, selected, options) {
  var optLines= "";
  if (values) {
    for (var idx in values) {
      var val = values[idx];
      optLines += "<option value='"+val.id+"'";
       if (selected && selected == val.id) {
         optLines += " selected='selected' ";
       }
      optLines += ">"+val.name+"</option>";
    }
     
  }
  return optLines;
});
Template7.registerHelper('default',function(string, defaultString, options) {
  if (string == null || string == undefined) {
    return defaultString;
  }
  return string;
});
Template7.registerHelper('date_format',function(dateString, format, options) {
  var date = null;
   debugger;
  if ("now" == dateString) {
    date = moment();
  } else {
   date = moment(dateString);
  }
  try {
   return date.format(format);
  } catch(e) {
    return "Invalid date";
  }
});
Template7.registerHelper('lower', function (text, options){
  if (text == undefined) {
    return "";
  }
  var ret = text.toLowerCase();
  return ret;
});
Template7.registerHelper('upper', function (text, options){
  var ret = text.toUpperCase();
  return ret;
});
Template7.registerHelper('index_of', function (arr, index) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);


  return arr[index];
});          

Template7.registerHelper('date_format', function (rawdate,format) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);

  if (moment==undefined) {
    return "Moment.js not included!";
  }
  console.log(rawdate);
  var mom = moment(rawdate);
  return mom.format(format);
});          

Template7.registerHelper('sizeof', function (arr) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);

  return arr.length;
});          
