'use strict'

const Sequelize = require('sequelize');

module.exports = ( sequelize ) => {
    class Course extends Sequelize.Model { }

    // initalize model fields
    Course.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please enter a title'
                },
                notEmpty: {
                    msg: 'Please enter a title'
                }
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please enter a description'
                },
                notEmpty: {
                    msg: 'Please enter a description'
                }
            }
        },
        estimatedTime: {
            type: Sequelize.STRING
        },
        materialsNeeded: {
            type: Sequelize.STRING
        }
    }, { sequelize });

    // associate with users model
    Course.associate = ( models ) => {
        Course.belongsTo(models.User, {
            as: 'user', // add alias to property name
            foreignKey: {
                fieldName: 'userId',
                allowNull: false
            }
        });
    };
    
    return Course;
};