module.exports = function(sequelize, DataTypes) {
    var comment = sequelize.define("comment", {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            len: [1]
        }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000]
        }
      },
    });

    comment.associate = function (models) {
      comment.belongsTo(models.ufo, {
        foreignKey: {
          allowNull: false
        }
      });
    };
    return comment;
  };