const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Le token est récupéré de manière sécurisée via l'environnement Replit
const TOKEN = process.env.TOKEN; 

client.once('ready', () => {
    console.log(`🤖 Le bot ${client.user.tag} est en ligne !`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    if (message.content === '!setup-shop') {
        const guild = message.guild;
        await message.reply("🔄 Initialisation du shop PG Sharp... Nettoyage et création en cours !");

        try {
            // 1. CRÉATION DES RÔLES
            const staffRole = await guild.roles.create({
                name: '🛠️ Staff',
                color: '#ff0000',
                permissions: [PermissionsBitField.Flags.Administrator]
            });

            await guild.roles.create({
                name: '💎 Client PGSharp',
                color: '#00ffcc'
            });

            const everyoneRole = guild.roles.everyone;

            // 2. NETTOYAGE DES ANCIENS SALONS
            const channels = await guild.channels.fetch();
            for (const [id, channel] of channels) {
                await channel.delete().catch(() => {});
            }

            // 3. CATÉGORIE : ACCUEIL
            const catAccueil = await guild.channels.create({
                name: '📢 ACCUEIL',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: everyoneRole.id,
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            });
            await guild.channels.create({ name: '📜-règlement', type: ChannelType.GuildText, parent: catAccueil.id });
            await guild.channels.create({ name: '📢-annonces', type: ChannelType.GuildText, parent: catAccueil.id });
            await guild.channels.create({ name: '🎉-giveaways', type: ChannelType.GuildText, parent: catAccueil.id });

            // 4. CATÉGORIE : PGSHARP SHOP
            const catShop = await guild.channels.create({
                name: '🛒 PGSHARP SHOP',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: everyoneRole.id,
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            });
            await guild.channels.create({ name: '💰-tarifs-clés', type: ChannelType.GuildText, parent: catShop.id });
            await guild.channels.create({ name: 'ℹ️-comment-ça-marche', type: ChannelType.GuildText, parent: catShop.id });
            await guild.channels.create({ name: '✅-avis-clients', type: ChannelType.GuildText, parent: catShop.id });
            
            await guild.channels.create({ 
                name: '🛒-commander-ici', 
                type: ChannelType.GuildText, 
                parent: catShop.id,
                permissionOverwrites: [
                    { id: everyoneRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            // 5. CATÉGORIE : COMMUNAUTÉ
            const catCommunaute = await guild.channels.create({
                name: '💬 COMMUNAUTÉ',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: everyoneRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            });
            await guild.channels.create({ name: '💬-discussion-générale', type: ChannelType.GuildText, parent: catCommunaute.id });
            await guild.channels.create({ name: '📸-vos-shiny', type: ChannelType.GuildText, parent: catCommunaute.id });

            // 6. CATÉGORIE : STAFF ONLY
            const catStaff = await guild.channels.create({
                name: '🔒 STAFF ONLY',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });
            await guild.channels.create({ name: '💻-logs-commandes', type: ChannelType.GuildText, parent: catStaff.id });

            const mainChannel = guild.channels.cache.find(c => c.name === '📜-règlement');
            if (mainChannel) {
                await mainChannel.send("🚀 **Le serveur Shop PG Sharp a été configuré de A à Z !**\n\nTu peux maintenant remplir les salons avec tes tarifs.");
            }

        } catch (error) {
            console.error("Erreur durant le setup :", error);
        }
    }
});

client.login(TOKEN);