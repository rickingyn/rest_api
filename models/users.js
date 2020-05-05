'use strict'

const Sequelize = require('sequelize');

module.exports = ( sequelize ) => {
    class User extends Sequelize.Model { }
    
    // initalize model fields
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
                    msg: 'Please enter a first name'
                },
                notEmpty: {
                    msg: 'Please enter a first name'
                }
            }
        }, 
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Pleae enter a last name'
                },
                notEmpty: {
                    msg: 'Please enter a last name'
                },
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please enter an email address'
                },
                notEmpty: {
                    msg: 'Please enter an email address'
                }
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please enter a password'
                },
                notEmpty: {
                    msg: 'Please enter a password'
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