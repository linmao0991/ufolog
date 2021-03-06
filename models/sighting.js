module.exports = function(sequelize, DataTypes) {
    var ufo = sequelize.define("ufo", {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 60]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000]
        }
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: "UFO"
      },
      image:{
          type: DataTypes.STRING,
          validate:{
              len: [1],
          }
      },
      coordinatesLat:{
        type: DataTypes.FLOAT
      },
      coordinatesLng:{
        type: DataTypes.FLOAT
      }
    });

    ufo.associate = function (models) {
      ufo.belongsTo(models.User, {
        foreignKey: {
          allowNull: false
        }
      });
      ufo.hasMany(models.log_rating, {
        onDelete: "cascade"
      });
      ufo.hasMany(models.comment, {
        onDelete: "cascade"
      });
    };
    return ufo;
  };
  