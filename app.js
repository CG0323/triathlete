var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res, next) {
  var matches = [];
  var event_validation = {};
  var view_state = {};
  superagent.get('http://triathlon.basts.com.cn/ViewResult.aspx')
    .set('Connection','keep-alive')
    .end(function (err, sres) {

      if (err) {
        return next(err);
      }
     
      
      var $ = cheerio.load(sres.text);
      view_state = $('#__VIEWSTATE').attr('value');
      event_validation = $('#__EVENTVALIDATION').attr('value');
      //console.log(sres.headers);
      // first get the matches of current year
      matches = getMatchList($);

      var previousYears = getYearList($);
      previousYears.forEach(function(year){
      appendMatchListOnYear(year, matches, view_state, event_validation);
        //console.log(html);
        //$ = cheerio.load(html);
       // matches.push(getMatchList($));
      });


      res.send(matches);
    });

});

function appendMatchListOnYear(year, matches, view_states, event_validation){

  var request = superagent.post('http://triathlon.basts.com.cn/ViewResult.aspx')
    .type('form')
    .set('Connection', 'keep-alive')
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
    .send({ToolkitScriptManager1:'UpdatePanel1|DRDYearList'})
    .send({DRDYearList:year})
    .send({__EVENTTARGET:'DRDYearList'})
    .send({__VIEWSTATE: view_states})
    .send({__EVENTVALIDATION: event_validation})
    .send({__VIEWSTATEENCRYPTED:''})
    .send({__ASYNCPOST:'true'})
    request.end(function (err, tres){
      if (err) {
        return;
      }
      var tmp = getMatchList(cheerio.load(tres.text));
      matches.push(tmp);
    });
  
};

function getYearList($) {
  var yearList = [];
  $("#DRDYearList option[selected!='selected']").each(function (idx, element) {
    var $element = $(element);
    yearList.push($element.attr('value'));
  });
  return yearList;
};

function getMatchList($) {
  var matches = [];
  var i = 0;
  $('.gridview_m tr').each(function (idx, element) {
    if (i != 0) {
      var $element = $(element);
      matches.push({
        game: $element.children().eq(0).text(),
        date: $element.children().eq(1).text(),
        result_id: $element.children().last().children().first().attr('id')
      });
    }
    i++;
  });
  return matches;
};

module.exports = app;
