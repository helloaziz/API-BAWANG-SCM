'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detail_location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Detail_location.init({
    user_id: DataTypes.INTEGER,
    panjang: DataTypes.DOUBLE,
    lebar: DataTypes.DOUBLE,
    luas: DataTypes.DOUBLE,
    lng: DataTypes.DOUBLE,
    lat: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Detail_location',
  });
  return Detail_location;
};