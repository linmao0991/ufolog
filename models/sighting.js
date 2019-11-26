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
              isUrl: true,
          }
      },
      coordinatesLat:{
        type: DataTypes.FLOAT
      },
      coordinatesLng:{
        type: DataTypes.FLOAT
      },
      likes:{
        type: DataTypes.INTEGER
      },
      dislikes:{
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
  