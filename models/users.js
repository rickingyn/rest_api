'use strict'

const Sequelize = require('sequelize');

module.exports = ( sequelize ) => {
    class User extends Sequelize.Model { }
    
    // initalize model fields
    // set validations; do not allow empty or null
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "firstName"'
                },
                notEmpty: {
                    msg: 'Please provide a value for "firstName"'
                }
            }
        }, 
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "lastName"'
                },
                notEmpty: {
                    msg: 'Please provide a value for "lastName"'
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "emailAddress"'
                },
                notEmpty: {
                    msg: 'Please provide a value for "emailAddress"'
                }
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "password"'
                },
                notEmpty: {
                    msg: 'Please provide a value for "password"'
                }
            }
        }
    }, { sequelize });

        // associate with users model
        User.associate = ( models ) => {
            User.hasMany(models.Course, {
                as: 'user', // add alias to property name
                foreignKey: {
                    fieldName: 'userId',
                    allowNull: false
                }
            });
        };

    return User;
};