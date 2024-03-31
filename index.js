const TelegramApi = require('node-telegram-bot-api')
const {gameOptions,againOptions} = require('./options')
const sequelize  = require('./db')
const UserModels = require('./models')

const token = "6514652394:AAHtSnuuRrmjAK612xoeGya0U-SbLhNA9J8";

const bot = new TelegramApi(token,{polling: true})

const chats = {
}


const startGame = async(chatId) =>{
    await bot.sendMessage(chatId,`Загадаю от 0 до 9, а ты отгадай`);
    const randomNumber = Math.floor(Math.random()*10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId,"Угадывай пёс",gameOptions)

}

const start = async () =>{
    try{
          await  sequelize.authenticate();
          await sequelize.sync();
    }catch(e){
        console.log(e)
    }
    bot.setMyCommands([
        {command: '/start',description:"Начни хуеботу"},
        {command:'/info',description:"Твоё хуимя"},
        {command:'/game',description: "Игра"}
    
    ])
    
    bot.on('message',async msg =>{
        const text = msg.text
        const  chatId = msg.chat.id
        try{
            if(text === "/start"){
                // await UserModels.create({chatId})
                const user = await UserModels.findOne({chatId})
               if(!user){
                await UserModels.create({chatId})
               }
                await bot.sendSticker(chatId,"https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/1.webp")
                return bot.sendMessage(chatId,"Приветствует бот хуебот")
            }
            if(text === "/info"){
                const user = await UserModels.findOne({chatId})
                return bot.sendMessage(chatId,`Ты мистер ${msg.from.first_name} : ${msg.from.last_name} : ${user.right} : ${user.wrong}`)
            }
            if(text === "/game"){
               return startGame(chatId)
            }
            if(text === "/again"){
                return startGame(chatId)
            }
            return bot.sendMessage(chatId,"Не понял тебя")
        }catch(e){
            return bot.sendMessage(chatId,"Произошла ошибка")
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if(data === "/again"){
            return startGame(chatId)
        }
        const user  = await UserModels.findOne({chatId})
        if(data == chats[chatId]){
            user.right += 1
            await bot.sendMessage(chatId,"Угадал",againOptions)
        }else{
            user.wrong += 1
            await bot.sendMessage(chatId,"Не угадал",againOptions)
        }
        await user.save()
    })
}

start();