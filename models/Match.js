'use strict'
module.exports = function (sequelize, DataTypes){
	return sequelize.define('Match', {
			id : {type: DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique :true},
			name: {type : DataTypes.STRING},
			date: {type: DataTypes.DATEONLY},
			});
};