var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');
var Q = require('q');

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
  var param = {};
  superagent.get('http://triathlon.basts.com.cn/ViewResult.aspx')
    .set('Connection','keep-alive')
    .end(function (err, sres) {
      if (err) {
        return next(err);
      }
         
      var $ = cheerio.load(sres.text);
      param.view_state = $('#__VIEWSTATE').attr('value');
      param.event_validation = $('#__EVENTVALIDATION').attr('value');
      // first get the matches of current year
      matches = getMatchList($);
      var previousYears = getYearList($);

      var matchPromise = [];
      previousYears.forEach(function(year){
        matchPromise.push(getMatchListOnYear(year, param));
      });
      Q.all(matchPromise).then(function(data){
        data.forEach(function(matchOnYear){
          matches = matches.concat(matchOnYear);  
        });
        res.send(matches);
        
      });
    });

});


 function getMatchListOnYear(year, param){
  var deferred = Q.defer();
  var request = superagent.post('http://triathlon.basts.com.cn/ViewResult.aspx')
    .type('form')
    .set('Connection', 'keep-alive')
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
    .send({ToolkitScriptManager1:'UpdatePanel1|DRDYearList'})
    .send({DRDYearList:year})
    .send({__EVENTTARGET:'DRDYearList'})
    .send({__VIEWSTATE: param.view_state})
    .send({__EVENTVALIDATION: param.event_validation})
    .send({__VIEWSTATEENCRYPTED:''})
    .send({__ASYNCPOST:'true'})
    request.end(function (err, tres){
      if (err) {
        deferred.reject(err);
      }
      else
      {  
        var matches = getMatchList(cheerio.load(tres.text));
        deferred.resolve(matches);
      }
    });
  return deferred.promise;
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
      var gameName = $element.children().eq(0).text();
      if(gameName.indexOf("专业组") < 0)
      {
        matches.push({
          game: $element.children().eq(0).text(),
          date: $element.children().eq(1).text(),
          result_id: $element.children().last().children().first().attr('id')
        });
      }
    }
    i++;
  });
  return matches;
};

module.exports = app;
