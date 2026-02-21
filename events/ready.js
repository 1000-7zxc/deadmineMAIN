const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`✅ Bot logged in as ${client.user.tag}`);
        console.log(`📊 Servers: ${client.guilds.cache.size}`);
        console.log(`👥 Users: ${client.users.cache.size}`);
        console.log('═══════════════════════════════════════════════════════════════');
        
        // Log channel configuration
        console.log('📋 Channel Configuration:');
        console.log(`Voice Log: ${config.voiceLogChannel}`);
        console.log(`Chat Log: ${config.chatLogChannel}`);
        console.log(`Moderation Log: ${config.moderationLogChannel}`);
        console.log(`Role Log: ${config.roleLogChannel}`);
        
        // Verify channels exist
        const voiceChannel = client.channels.cache.get(config.voiceLogChannel);
        const chatChannel = client.channels.cache.get(config.chatLogChannel);
        const modChannel = client.channels.cache.get(config.moderationLogChannel);
        const roleChannel = client.channels.cache.get(config.roleLogChannel);
        
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📍 Channel Status:');
        console.log(`Voice Log: ${voiceChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log(`Chat Log: ${chatChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log(`Moderation Log: ${modChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log(`Role Log: ${roleChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log('═══════════════════════════════════════════════════════════════');
        
        client.user.setPresence({
            activities: [{ 
                name: '📝 Логирование сервера', 
                type: ActivityType.Watching 
            }],
            status: 'online'
        });
        
        console.log('✅ Bot is ready!');
    }
};
