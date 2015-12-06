'use strict'
module.exports = function (sequelize, DataTypes){
	return sequelize.define('Triathlete', {
	id : {type: DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique :true},
	name: {type : DataTypes.STRING},
	register_code: {type: DataTypes.STRING},
	gender: {type: DataTypes.STRING},
	birthday: {type: DataTypes.STRING},
	level: {type: DataTypes.STRING},
	score: {type: DataTypes.FLOAT},
	rank: {type: DataTypes.INTEGER},
	result_count: {type: DataTypes.INTEGER},
	photo: {type: DataTypes.STRING},
	query_id: {type: DataTypes.INTEGER}
	});
};

