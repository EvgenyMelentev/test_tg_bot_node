const { Sequelize } = require('sequelize')

module.exports = new Sequelize(    "telega_bot",
"root",
"AngellaDb",
{
    host: '94.26.250.67',
    port: 5432,
    dialect: 'postgres'
})
