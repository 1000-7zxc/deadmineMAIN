const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const inviteTracker = require('../events/inviteTracker');

// Schedule weekly reports (every Monday at 00:00)
function scheduleWeeklyReports(client) {
    // Calculate time until next Monday 00:00
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    const timeUntilMonday = nextMonday - now;
    
    console.log(`📅 Next weekly report scheduled for: ${nextMonday.toLocaleString('ru-RU')}`);
    
    // Schedule first report
    setTimeout(() => {
        sendWeeklyReport(client);
        
        // Then schedule weekly (every 7 days)
        setInterval(() => {
            sendWeeklyReport(client);
        }, 7 * 24 * 60 * 60 * 1000);
        
    }, timeUntilMonday);
}

async function sendWeeklyReport(client) {
    console.log('📊 Generating weekly report...');
    
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const reportsChannel = guild.channels.cache.get(config.reportsChannel);
            if (!reportsChannel) {
                console.log(`⚠️ Reports channel not found in guild ${guild.name}`);
                continue;
            }
            
            const inviteData = inviteTracker.getInviteData();
            const guildData = inviteData.get(guildId) || new Map();
            
            // Get members with Deputy or Curator roles
            const deputyRole = guild.roles.cache.get(config.deputyRoleId);
            const curatorRole = guild.roles.cache.get(config.curatorRoleId);
            
            if (!deputyRole && !curatorRole) {
                console.log(`⚠️ Deputy/Curator roles not found in guild ${guild.name}`);
                continue;
            }
            
            const members = await guild.members.fetch();
            const reportData = [];
            
            for (const [memberId, member] of members) {
                const hasDeputyRole = deputyRole && member.roles.cache.has(deputyRole.id);
                const hasCuratorRole = curatorRole && member.roles.cache.has(curatorRole.id);
                
                if (hasDeputyRole || hasCuratorRole) {
                    const inviteCount = guildData.get(memberId) || 0;
                    const roleName = hasCuratorRole ? 'Куратор КП' : 'Заместитель';
                    
                    reportData.push({
                        username: member.user.tag,
                        role: roleName,
                        invites: inviteCount
                    });
                }
            }
            
            if (reportData.length === 0) {
                console.log(`⚠️ No deputies/curators found in guild ${guild.name}`);
                continue;
            }
            
            // Sort by invite count (descending)
            reportData.sort((a, b) => b.invites - a.invites);
            
            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('📊 Еженедельный отчет по приглашениям')
                .setDescription('Статистика приглашений Заместителей и Кураторов КП за неделю')
                .setTimestamp();
            
            let reportText = '';
            for (const data of reportData) {
                reportText += `**${data.username}** (${data.role})\n`;
                reportText += `Принял: **${data.invites}** кандидатов\n\n`;
            }
            
            if (reportText) {
                embed.addFields({ name: 'Результаты', value: reportText });
            } else {
                embed.addFields({ name: 'Результаты', value: 'Нет данных за эту неделю' });
            }
            
            await reportsChannel.send({ embeds: [embed] });
            console.log(`✅ Weekly report sent to guild ${guild.name}`);
            
            // Reset invite counts for next week
            guildData.clear();
            
        } catch (error) {
            console.error(`Error sending weekly report for guild ${guildId}:`, error);
        }
    }
}

module.exports = { scheduleWeeklyReports, sendWeeklyReport };
