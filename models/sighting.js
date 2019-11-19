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
      }
    });
    return ufo;
  };
  