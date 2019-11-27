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
          len: [1]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: "Alien"
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
      models.ufo.belongsTo(models.User, {
        onDelete: "CASCADE",
        foreignKey: {
          allowNull: false
        }
      });
    };

    ufo.associate = function(models) {
      ufo.hasMany(models.log_rating, {
        onDelete: "cascade"
      });
    };
    return ufo;
  };
  