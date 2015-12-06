'use strict'
module.exports = function (sequelize, DataTypes){
	return sequelize.define('MatchResult', {
				id : {type: DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique :true},
				triathlete_name : {type: DataTypes.STRING},
				game: {type : DataTypes.STRING},
				date: {type : DataTypes.DATEONLY},
				rank: {type: DataTypes.INTEGER},
				bib: {type: DataTypes.INTEGER},
				sub_group: {type: DataTypes.STRING},
				total: {type : DataTypes.STRING},
				swim: {type : DataTypes.STRING},
				t1: {type : DataTypes.STRING},
				bike: {type : DataTypes.STRING},
				t2: {type : DataTypes.STRING},
				run: {type : DataTypes.STRING}
			});
};