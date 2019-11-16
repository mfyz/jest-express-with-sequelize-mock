module.exports = (sequelize, DataTypes, globalModelConfig) => {
	return sequelize.define('Holidays', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
	}, globalModelConfig)
}
