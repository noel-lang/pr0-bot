const Discord 				= require("discord.js");
const dotenv 				= require("dotenv");

const guildCreateListener 	= require("./listener/guildCreate");
const messageListener		= require("./listener/message");

const client 		= new Discord.Client();
dotenv.config();

// Wenn der Bot sich erfolgreich eingeloggt hat.
client.on("ready", () => {
	console.log(`Eingeloggt als: ${client.user.tag}`);
});

// Wenn der Bot zu einer neuen Gilde hinzugefügt wird,
// wollen wir das in der Datenbank speichern.
client.on("guildCreate", guildCreateListener);

// Wenn der Bot eine neue Nachricht registriert.
client.on("message", messageListener);

client.login(process.env.DISCORD_TOKEN);