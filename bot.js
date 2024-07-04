const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = '!';

const commands = {
    '!test': 'Создать тест с вариантами ответов: !test <вопрос> <вариант1> <вариант2> ...',
    '!createchannel': 'Создать текстовый и голосовой канал для роли: !createchannel <имя роли>',
    '!getRole': 'Создать и выдать роль упомянутым пользователям: !getRole <имя роли> @пользователь1 @пользователь2 ...'
};




client.on('ready', () => {
    console.log('Bot Ready!');
  });

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    

    if (message.content === prefix) {
        // Выводим подсказку с командами
        const embed = new Discord.MessageEmbed()
            .setTitle('Доступные команды:')
            .setColor('#0099ff')
            .setDescription(Object.entries(commands).map(([command, description]) => `${command}: ${description}`).join('\n')); 

        message.channel.send(embed);
        return; // Прерываем обработку сообщения
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    let availableCommands = {};
    const isAdmin = message.member.roles.cache.some(role => role.name === 'Admin'); 
    if (isAdmin) {
        availableCommands = commands; 
    } else {
        availableCommands['!test'] = commands['!test']; 
    }
    
        if(isAdmin){

            if (message.content.startsWith('!createchannel')) {
                if (!message.member.hasPermission('MANAGE_CHANNELS')) {
                    return message.reply('У вас нет прав на создание каналов.');
                }
            
                const args = message.content.split(' ');
                const roleName = args[1]; 
                const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase()); 
            
                if (!role) {
                    return message.reply('Роль не найдена.');
                }
            
                const timeArgs = args[2]; 
                let timeout;
                if (timeArgs) {
                    const [hours, minutes, seconds] = timeArgs.split(',').map(Number);
                    timeout = (hours * 3600 + minutes * 60 + seconds) * 1000; 
                }
            
                const createChannel = (type) => {
                    message.guild.channels.create(roleName, {
                        type: type,
                        permissionOverwrites: [
                            {
                                id: role.id,
                                allow: ['VIEW_CHANNEL'], // Разрешение для роли
                            },
                            {
                                id: message.guild.id, // ID сервера
                                deny: ['VIEW_CHANNEL'], // Отказано всем остальным
                            },
                        ]
                    })
                    .then(channel => {
                        message.channel.send(`Канал для роли ${roleName} создан: ${channel} .Время дейстивя канада :${timeArgs}`);
            
                        if (timeout) {
                            setTimeout(() => {
                                channel.delete()
                                    .then(() => message.channel.send(`Канал для роли ${roleName} удален.`))
                                    .catch(console.error);
                            }, timeout);
                        }
                    })
                    .catch(console.error);
                };
            
                createChannel('text');
                createChannel('voice');
            }
            
            
            

            if (message.content.startsWith('!getRole')) {
                if (message.member.permissions.has('ADMINISTRATOR')) {
                    // Разбираем аргументы команды
                    const args = message.content.split(' ');
                    const roleName = args[1]; // Название роли
                    const mentionedMembers = message.mentions.members.array(); // Массив упомянутых пользователей
            
                    if (!roleName) {
                        message.channel.send('Укажите имя роли!');
                        return;
                    }
            
                    if (mentionedMembers.length === 0) {
                        message.channel.send('Укажите пользователей, которым выдать роль!');
                        return;
                    }
            
                    // Проверяем, существует ли роль
                    const existingRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                    
                    if (existingRole) {
                        // Роль уже существует, выдаем ее
                        for (const member of mentionedMembers) {
                            await member.roles.add(existingRole);
                        }
                        message.channel.send(`Роль "${roleName}" уже существует и была выдана ${mentionedMembers.length} пользователям.`);
                    } else {
                        // Роль не существует, создаем и выдаем
                        const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 - максимальное значение для цвета в шестнадцатеричной системе
            
                        // Создаем роль
                        const role = await message.guild.roles.create({
                            data: {
                                name: roleName,
                                color: `#${randomColor} `// Добавляем '#' в начало для формата hex цвета
                            }
                        });
            
                        // Выдаем роль всем упомянутым пользователям
                        for (const member of mentionedMembers) {
                            await member.roles.add(role);
                        }
            
                        message.channel.send(`Роль "${roleName}" была создана и выдана ${mentionedMembers.length} пользователям.`);
                    }
            
                } else {
                    message.channel.send('У вас нет прав для выполнения этой команды.');
                }
            }
            
}else{
    if (command === '!test') {
        const question = args[0];
        const options = args.slice(1);
    
        if (!question || options.length < 2) {
            return message.reply('Используйте: !test <вопрос> <вариант1> <вариант2> ...');
        }
    
        const formattedOptions = options.map((option, index) => `${index + 1}. ${option}`).join('\n');
    
        const embed = new Discord.MessageEmbed()
            .setTitle('Тест')
            .setColor('#0099ff')
            .setDescription(question)
            .addField('Варианты ответов', formattedOptions);
    
        message.channel.send(embed)
            .then(sentMessage => {
                options.forEach((_, index) => {
                    sentMessage.react(`${index + 1}️⃣`);
                });
            });
    }
    else {
        message.reply('У вас нет прав на выполнение этой команды.');
    }
}

})






client.login(
    "MTI1NzcyMjM2ODU0NjE3NzEwNQ.Ge02wE.sOlScyikcVeAIrOWH5E-KWjy5YwAeJpyfEoHIg"
);
