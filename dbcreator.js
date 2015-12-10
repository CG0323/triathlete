"use strict"

var Sequelize = require('sequelize');
var path = require('path');
var superagent = require('superagent');
var cheerio = require('cheerio');
var Q = require('q');
var fs = require('fs');
var timespan = require('timespan');
var sequelize = new Sequelize('triathlon', 'triathlon', '088583-salahdin', {host:'123.56.103.93', port: '3306', dialect: 'mysql', insecureAuth: true, charset: 'utf-8'});

var TouchedID = sequelize.define('TouchedID',{
	query_id: {type: Sequelize.INTEGER}
});

var Triathlete = sequelize.define('Triathlete', {
	id : {type: Sequelize.INTEGER, autoIncrement : true, primaryKey : true, unique :true},
	name: {type : Sequelize.STRING},
	register_code: {type: Sequelize.STRING},
	gender: {type: Sequelize.STRING},
	birthday: {type: Sequelize.STRING},
	level: {type: Sequelize.STRING},
	score: {type: Sequelize.FLOAT},
	rank: {type: Sequelize.INTEGER},
	result_count: {type: Sequelize.INTEGER},
	photo: {type: Sequelize.STRING},
	query_id: {type: Sequelize.INTEGER},
	result_total_count:{type: Sequelize.INTEGER},
	best_rank: {type: Sequelize.INTEGER},
	best_total: {type: Sequelize.STRING}
});

var Match = sequelize.define('Match', {
	id : {type: Sequelize.INTEGER, autoIncrement : true, primaryKey : true, unique :true},
	name: {type : Sequelize.STRING},
	date: {type: Sequelize.DATEONLY},
});

var MatchResult = sequelize.define('MatchResult', {
	id : {type: Sequelize.INTEGER, autoIncrement : true, primaryKey : true, unique :true},
	triathlete_name : {type: Sequelize.STRING},
	game: {type : Sequelize.STRING},
	date: {type : Sequelize.DATEONLY},
	rank: {type: Sequelize.INTEGER},
	bib: {type: Sequelize.INTEGER},
	sub_group: {type: Sequelize.STRING},
	total: {type : Sequelize.STRING},
	swim: {type : Sequelize.STRING},
	t1: {type : Sequelize.STRING},
	bike: {type : Sequelize.STRING},
	t2: {type : Sequelize.STRING},
	run: {type : Sequelize.STRING}
});

Triathlete.hasMany(MatchResult);
Match.hasMany(MatchResult);
MatchResult.belongsTo(Triathlete);
MatchResult.belongsTo(Match);

// Triathlete.findAll()
// 	.then(function (triathletes) {
// 		//console.log(persons);
// 		for (var i = 0; i < triathletes.length; i++) {
// 			var triathlete = triathletes[i];
// 			UpdateTriathleteResultsRelation(triathlete)
// 		}
// 	});


// function UpdateTriathleteResultsRelation(triathlete){
// 	MatchResult.findAll({where:{triathlete_name: triathlete.name}})
// 				.then(function(results){					
// 					triathlete.setMatchResults(results);
// 				});
// };

// Match.findAll()
// 	.then(function (matches) {
// 		//console.log(persons);
// 		for (var i = 0; i < matches.length; i++) {
// 			var match = matches[i];
// 			UpdateMatchResultsRelation(match)
// 		}
// 	});
	
	



// function UpdateMatchResultsRelation(match){
// 	MatchResult.findAll({where:{game: match.name}})
// 				.then(function(results){					
// 					match.setMatchResults(results);
// 				});
// };


// MatchResult.sync({force:'true'})
// .then(function(){
// 	var matchFiles = fs.readdirSync("./data");
// 	for (var i = 0; i < matchFiles.length; i++) {
// 		var matchFile = "./data/" + matchFiles[i];
// 		var match = require(matchFile);
// 		//Match.findOrCreate({where:{name: match.game}, defaults: {date:match.date}})
// 		var groups = match.groups;
// 		for (var j = 0; j < groups.length; j++) {
// 			var subGroups = groups[j].sub_groups;
// 			for (var k = 0; k < subGroups.length; k++) {
// 				var results = subGroups[k].results;
// 				for (var m = 0; m < results.length; m++) {
// 					var result = results[m];

// 					if(result.total.indexOf('DNS') < 0 && result.total.indexOf('DSQ') < 0)
// 					{
// 						MatchResult.findOrCreate({ where: { triathlete_name: result.athlete , game: match.game}, defaults:{
// 						triathlete_name: results.athlete,
// 						game: match.game,
// 						date: match.date,
// 						rank: result.rank,
// 						bib: result.bib,
// 						sub_group: subGroups[k].name,
// 						total: result.total,
// 						swim: result.swim,
// 						t1: result.t1,
// 						bike: result.cycling,
// 						t2: result.t2,
// 						run: result.run
// 						} });
// 					}
					
	
// 				};
// 			};
// 		};
// 	};	
// });


// TouchedID.sync()
// .then(function(){
// 	TouchedID.findAll()
// 	.then(function(items){
// 		var touchedIDs = [];
// 		for(var i = 0; i < items.length; i++){
// 			touchedIDs.push(items[i].query_id);
// 		}
// 		console.log("These ID has been touched");
// 		console.log(touchedIDs);
// 		Triathlete.sync()
// 		.then(function () {
// 			for (var i = 0; i < 3656; i++) {
// 				retrievePerson(i, touchedIDs);
// 			}
// 		});
// 	})
// })



// function retrievePerson(id, touchedIDs){
// 	if(touchedIDs.indexOf(id) >= 0){
// 		return;
// 	}
// 	var aSvrUrl = "http://triathlon.basts.com.cn/ItuApp/Service/dataService.ashx";
// 	var param1 = '{"Ts":{"MasDatas":"AthleteInfo.txt"},"Ps":{"CurYear":2015,"AthleteID":"' + id + '"}}';
// 	var param = 'Para='+encodeURIComponent(param1);
// 	var request = superagent.post(aSvrUrl)
// 	.set("User-Agent", " Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36")
// 	.type("form")
// 	.send('CmdID=getTable')
// 	.send(param);
// 	request.end(function(err,res){
// 		if(res)
// 		{
// 			TouchedID.create({query_id:id})
// 			var data1 = JSON.parse(res.text);
// 			var data = JSON.parse(data1.Result);
// 			if(data.MasDatas.length > 0)
// 			{
// 				var rec = data.MasDatas[0];
// 				// console.log(rec.F_OrgName);
// 				if(rec.F_OrgName.indexOf("北京第三连") >= 0){
// 				var person = {};
							
// 				person.name = rec.F_Name;
// 				person.register_code = rec.F_RegisteCode;
// 				person.gender = rec.F_GenderName;
// 				person.birthday = rec.F_BirthdayName;
// 				person.level = rec.F_LevelName;
// 				person.score = rec.F_Integral;
// 				person.rank = rec.F_Rank;
// 				person.result_count = rec.F_ResultCount;
// 				person.query_id = id;
				
// 				var photo = encodeURI(rec.F_Photo.replace("~",""));
// 				{
// 					if(photo){
						
// 						person.photo = 'photos/' + person.name + '.jpg';
// 					}
// 				}
// 				Triathlete.findCreateFind({where:{register_code:person.register_code}, defaults:{
// 				name: person.name
// 				,gender: person.gender 
// 				,birthday: person.birthday
// 				,level: person.level
// 				,score: person.score
// 				,rank: person.rank
// 				,result_count: person.result_count
// 				,photo: person.photo
// 				,query_id: id}})
// 				.then(function(){
// 					if(photo)
// 					{
						
// 						superagent.get('http://triathlon.basts.com.cn' + photo)
// 						.end(function(err, res){
// 							if(res)
// 							{
// 								person.photo = "./public/photos/" + person.name + ".jpg";	
// 								fs.writeFile(person.photo,res.body, 'binary', function(err) {	
// 								})
// 							}
							
// 						});
// 					}
					
// 				})
				
				
// 				}
// 			}
// 		}
// 		else
// 		{
// 			console.log("!!!!!!!!!!!!! Failed to get ID = " + id);
// 		}

// });
// };




// Triathlete.findAll().then(function(res){
//     console.log(res);
// })

// Triathlete.sync({force: 'true'}).then(function(){
// 	console.log("table created");
// }).then(function(){
//   var matchFiles = fs.readdirSync("./data");
//   for(var i = 0; i < matchFiles.length; i++){
// 	  var matchFile = "./data/" + matchFiles[i];
// 	  var match = require(matchFile);
// 	  var groups = match.groups;
// 	  for(var j = 0; j < groups.length; j++){
// 		  var subGroups = groups[j].sub_groups;
// 		  for(var k = 0; k < subGroups.length; k++){
// 			  var results = subGroups[k].results;
// 			  for(var m = 0; m <results.length; m++){
// 				  var result = results[m];
// 				  var personName = result.athlete;
// 				  console.log(personName);
// 				  Triathlete.findOrCreate({where:{name : personName}})
// 				.then(function(t){
// 					console.log(t);	
					
// 				});
// 			  };
// 		  };
// 	  };
//   };
// }).then(function(){
// 	console.log("finished");
// });


MatchResult.sync().then(function(){
	Triathlete.findAll().then(function(triathletes){
		for(var i = 0; i < triathletes.length; i++){
			var triathlete = triathletes[i];
			updateTriathlete(triathlete);
		}
	})	
})

function updateTriathlete(triathlete){
	triathlete.getMatchResults().then(function(results){
			triathlete.result_total_count = results.length;
			//triathlete.best_rank = getBestRank(results);
			triathlete.best_total = getBestTotal(results);
			triathlete.save();
		});
};

function getBestRank(results){
	var bestRank = 999;
	for(var i = 0; i < results.length; i++){
		if(results[i].rank < bestRank){
			bestRank = results[i].rank;
		}
	}
	return bestRank;
}

function getBestTotal(results){
	var best = {};
	var bestDatetime = 'Jul 8, 2015 12:00:00';
	var bestValue = Date.parse(bestDatetime);
	var findOne = false;
	for(var i = 0; i < results.length; i++){
		var result = results[i];
		if(result.sub_group.indexOf('半程') < 0 && result.sub_group.indexOf('长距离') < 0){
			var total = result.total;
			var str = 'Jul 8, 2015 '+total;
			var value = Date.parse(str);
			findOne = true;
			if(value < bestValue){
				bestValue = value;
				best = total;
			}
		}
	}
	if(findOne){
		var tmp = new Date(bestValue);
		return tmp.getHours()+":"+tmp.getMinutes()+":"+tmp.getSeconds();
	}	
	return {};
}