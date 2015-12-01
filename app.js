var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');
var Q = require('q');
var fs = require('fs');

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
  var existingMatchFiles = fs.readdirSync("./data");
  var existingMatches = [];
  existingMatchFiles.forEach(function(filename){
    var matchName = filename.replace(".json","");
    existingMatches.push(matchName);
  });
  var param = {};
  getMatchOnCurrentYear()
    .then(function (data) {
      var matches = data.matches;
      var previousYears = data.previous_years;
      param = data.param;
      var matchPromises = [];
      // previousYears = ['2014'];
      previousYears.forEach(function (year) {
        matchPromises.push(getMatchListOnYear(year, param));
      });
      Q.all(matchPromises).then(function (datas) {
        console.log(datas);
        datas.forEach(function (data) {
          
          matches = matches.concat(data.matches);
        });
        return {matches: matches, param: data.param};
      })
     .then(function(data){  
       getMatchesWithResults(existingMatches, data.matches, data.param)
       .then(function(matchesWithResult){
         console.log("Finished!!!!!!!!!!!!!!")
         res.send(matchesWithResult)
       })
     })
  })

});


function getMatchesWithResults(existingMatches, matches, param){
  var deferred = Q.defer();
  var promises = [];

  // getMatchWithResults(matches[2], param)
  // .then(function(data){deferred.resolve(data);})
  matches.forEach(function(match){
    if(notContains(existingMatches, match.game) == true)
    {
       console.log(match.game);
      promises.push(getMatchWithResults(match, param))
    }
  })
  Q.all(promises)
    .then(function(matchesWithResult){
      
       console.log("After all matches");
      var matchesWithValidResults = matchesWithResult.filter(function(m){
         return m.groups.length > 0;
      });
      deferred.resolve(matchesWithValidResults);
    })
  return deferred.promise;
};

function notContains(array_s, s)
{
  for(var i =0; i < array_s.length; i++)
  {
    if(array_s[i] == s)
    {
      return false;
    }
  }
  return true;
}

function getMatchWithResults(match, param){
  var deferred = Q.defer();
  getMatchGroupList(match, param)
    .then(populateGroupWithResults)
    .then(function(groups){
      match.groups = groups;
      if(groups.length > 0)
      {
        write2File(match);
      }
      else
      {
        console.log("第三连未参加比赛："+ match.game);
      }
      deferred.resolve(match);
    })
  return deferred.promise;
};

function write2File(match)
{
  var outputFilePath = "./data/"+ match.game + ".json";
  fs.writeFile(outputFilePath, JSON.stringify(match, null, 2), function(err){
    if(err){
      console.log(err);
    }else{
      console.log("JSON saved to " + outputFilePath);
    }
  });
}

function getMatchGroupList(match, param)
{
  var deferred = Q.defer();
  var date = new Date(match.date);
  var year = date.getFullYear();
  var target = 'UpdatePanel1|' + match.result_id;
  var request = superagent.post('http://triathlon.basts.com.cn/ViewResult.aspx')
    .type('form')
    .set('Connection', 'keep-alive')
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
    .send({ToolkitScriptManager1:target})
    .send({DRDYearList:year})
    .send({__EVENTTARGET:match.result_id})
    .send({__VIEWSTATE: param.view_state})
    .send({__EVENTVALIDATION: param.event_validation})
    .send({__VIEWSTATEENCRYPTED:''})
    .send({__ASYNCPOST:'true'})
    
    request.end(function (err, tres){
      if (err) {
        deferred.reject(err);
      }
      else
      { var groups = []; 
        var $ = cheerio.load(tres.text);
        $("#DRDSub2 option").each(function (idx, element) {
          var $element = $(element);
          if($element.text().indexOf("团体") == -1 && $element.text().indexOf("接力") == -1 &&  $element.text().indexOf("两项") == -1)
          {
            groups.push({value:$element.attr('value'), name:$element.text()});   
          }
        });
        
        if(groups.length > 0)
        {
          var param1 = {};
          param1.view_state = parseViewStateFromHTML(tres.text);
          param1.event_validation = parseEventValidationFromHTML(tres.text);
          deferred.resolve({groupList:groups, param:param1});       
        }
        else
        {
          console.log(tres.text);
          deferred.reject("empty group");
        }
      }
    });
  return deferred.promise;
}

function parseViewStateFromHTML(text)
{
  var pattern = new RegExp("__VIEWSTATE\\|[^\\|]*(?=\\|)");
  var tmp = pattern.exec(text);
  var result = tmp[0].replace("__VIEWSTATE|", "");
  return result;
}

function parseEventValidationFromHTML(text)
{
  var pattern = new RegExp("__EVENTVALIDATION\\|[^\\|]*(?=\\|)");
  var result = pattern.exec(text)[0].replace("__EVENTVALIDATION|", "");
  return result;
}


function populateGroupWithResults(config)
{
  var deferred = Q.defer();
  var groupList = config.groupList;
  var param = config.param;
  var subGroupPromisies = [];
  groupList.forEach(function(group){
    subGroupPromisies.push(populateSubGroup(group, param));
  });
  Q.all(subGroupPromisies)
    .then(function(groups){
      var groupWithData = groups.filter(function(group){
        return group.sub_groups.length > 0;
      });
      deferred.resolve(groupWithData);
    })
  return deferred.promise;
}

function populateSubGroup(group, param)
{
  var deferred = Q.defer();
  var groupID = group.value;
  var request = superagent.post('http://triathlon.basts.com.cn/ViewResult.aspx')
    .type('form')
    .set('Connection', 'keep-alive')
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
    .send({ToolkitScriptManager1:'UpdatePanel1|DRDSub2'})
    .send({DRDType:0})
    .send({DRDSub2:groupID})
    .send({DRDSubGroup2:''})
    .send({__EVENTTARGET:'DRDSub2'})
    .send({__VIEWSTATE: param.view_state})
    .send({__EVENTVALIDATION: param.event_validation})
    .send({__VIEWSTATEENCRYPTED:''})
    .send({__ASYNCPOST:'true'})
    request.end(function (err, tres){
      if (err) {
        deferred.reject(err);
      }
      else
      { var subGroups = []; 
        var $ = cheerio.load(tres.text);
        $("#DRDSubGroup2 option").each(function (idx, element) {
          var $element = $(element);
          subGroups.push({value:$element.attr('value'), name:$element.text()});   
        });
        var param1 = {};
        param1.view_state = parseViewStateFromHTML(tres.text);
        param1.event_validation = parseEventValidationFromHTML(tres.text);
        var subGroupResultPromises = [];
        subGroups.forEach(function(subGroup){
          subGroupResultPromises.push(getSubGroupResult(group, subGroup, param1));
        })
        Q.all(subGroupResultPromises)
          .then(function(subGroups){
            group.sub_groups = subGroups.filter(function(subGroup){
              return subGroup.results.length > 0;
            });
            deferred.resolve(group);       
          })
      }
    });
  return deferred.promise;
}

function getSubGroupResult(group, subGroup, param)
{
  var deferred = Q.defer();
  var groupID = group.value;
  var subGroupID = subGroup.value;

  var request = superagent.post('http://triathlon.basts.com.cn/ViewResult.aspx')
    .type('form')
    .set('Connection', 'keep-alive')
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
    .send({ToolkitScriptManager1:'UpdatePanel1|DRDSubGroup2'})
    .send({DRDType:0})
    .send({DRDSub2:groupID})
    .send({DRDSubGroup2:subGroupID})
    .send({__EVENTTARGET:'DRDSubGroup2'})
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
        var $ = cheerio.load(tres.text);
        subGroup.results= getResultList($);
        deferred.resolve(subGroup);       
      }
    });
  return deferred.promise;
}

function getResultList($) {
  var results = [];
  var i = 0;
  $('.gridview_m tr').each(function (idx, element) {
    if (i != 0) {
      var $element = $(element);
      var club = $element.children().eq(3).text();
      if(club.indexOf("北京第三连") >= 0)
      {
        results.push({
          rank: $element.children().eq(0).text(),
          bib: $element.children().eq(1).text(),
          athlete: $element.children().eq(2).text(),
          club: club,
          swim: $element.children().eq(4).text(),
          t1: $element.children().eq(5).text(),
          cycling: $element.children().eq(6).text(),
          t2: $element.children().eq(7).text(),
          run: $element.children().eq(8).text(),
          total: $element.children().eq(9).text()
        });
      }
    }
    i++;
  });
  // console.log(results);
  return results;
};

function getMatchOnCurrentYear(){
  var deferred = Q.defer();
  superagent.get('http://triathlon.basts.com.cn/ViewResult.aspx')
    .set('Connection','keep-alive')
    .end(function (err, sres) {
      if (err) {
        deferred.reject(err);
      }
      else
      {
        var $ = cheerio.load(sres.text);
        var param = {}
        param.view_state = $('#__VIEWSTATE').attr('value');
        param.event_validation = $('#__EVENTVALIDATION').attr('value');
        var matches = getMatchList($);
        var previousYears = getYearList($);
        var data = {
          matches: matches, 
          previous_years:previousYears,
          param: param};
        deferred.resolve(data);
      }
    });
    return deferred.promise;
}

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
        var $ = cheerio.load(tres.text);
        var matches = getMatchList($);
        var param1 = {};
        param1.view_state = parseViewStateFromHTML(tres.text);
        param1.event_validation = parseEventValidationFromHTML(tres.text);
          
        var data = {matches: matches, param: param1};
        deferred.resolve(data);
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
          result_id: $element.children().last().children().first().attr('id').replace(/_/g,"$")
        });
      }
    }
    i++;
  });
  return matches;
};

module.exports = app;
