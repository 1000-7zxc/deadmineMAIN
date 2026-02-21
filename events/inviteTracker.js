const config = require('../config');

// Store invites data: guildId -> Map(userId -> inviteCount)
const inviteData = new Map();

// Store guild invites: guildId -> Map(inviteCode -> Invite)
const guildInvites = new Map();

module.exports = {
    name: 'clientReady',
    once: false,
    async execute(client) {
        // Load all invites for all guilds
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const invites = await guild.invites.fetch();
                guildInvites.set(guildId, new Map(invites.map(inv => [inv.code, inv])));
                console.log(`✅ Loaded ${invites.size} invites for guild ${guild.name}`);
            } catch (error) {
                console.error(`Error loading invites for guild ${guildId}:`, error);
            }
        }
    }
};

// Track when member joins
async function trackInvite(member, client) {
    const guild = member.guild;
    
    try {
        const newInvites = await guild.invites.fetch();
        const oldInvites = guildInvites.get(guild.id) || new Map();
        
        // Find which invite was used
        let usedInvite = null;
        for (const [code, newInvite] of newInvites) {
            const oldInvite = oldInvites.get(code);
            if (oldInvite && newInvite.uses > oldInvite.uses) {
                usedInvite = newInvite;
                break;
            }
        }
        
        if (usedInvite && usedInvite.inviter) {
            const inviterId = usedInvite.inviter.id;
            
            // Initialize guild data if needed
            if (!inviteData.has(guild.id)) {
                inviteData.set(guild.id, new Map());
            }
            
            const guildData = inviteData.get(guild.id);
            const currentCount = guildData.get(inviterId) || 0;
            guildData.set(inviterId, currentCount + 1);
            
            console.log(`✅ ${usedInvite.inviter.tag} invited ${member.user.tag} (total: ${currentCount + 1})`);
        }
        
        // Update stored invites
        guildInvites.set(guild.id, newInvites);
        
    } catch (error) {
        console.error('Error tracking invite:', error);
    }
}

// Export functions
module.exports.trackInvite = trackInvite;
module.exports.getInviteData = () => inviteData;
