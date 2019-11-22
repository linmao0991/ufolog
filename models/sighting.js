module.exports = function(sequelize, DataTypes) {
    var ufo = sequelize.define("ufo", {
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
              len: [1]
          }
      },
      coordinatesLat:{
        type: DataTypes.FLOAT
      },
      coordinatesLng:{
        type: DataTypes.FLOAT
      },
      points:{
        type: DataTypes.INTEGER
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

    return ufo;
  };
  