module.exports = function(sequelize, DataTypes) {
    var log_rating = sequelize.define("log_rating", {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      rating: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      }
    });

    log_rating.associate = function (models) {
      log_rating.belongsTo(models.ufo, {
        foreignKey: {
          allowNull: false
        }
      });
    };

    return log_rating;
  };