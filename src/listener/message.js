const Discord 		= require("discord.js");
const url 			= require("url");
const axios 		= require("axios");
const validator 	= require("validator");

module.exports = async (msg) => {
	let content = msg.content;
	let isUrl = validator.isURL(content);

	// Wir wollen nicht weitermachen, wenn es sich nicht um
	// eine gültige URL handelt.
	if(!isUrl) { return; }

	// Hier überprüfen wir, ob es sich auch um eine URL vom
	// pr0 handelt.
	let isProgrammUrl = content.indexOf("pr0gramm") !== -1;
	if(isProgrammUrl) {
		// Id aus der URL parsen.
		let urlPathname = url.parse(content).pathname;
		let pr0Id = urlPathname.split("/")[2];
		
		// Infos von der API fetchen.
		const itemsResult = await axios.get(`https://pr0gramm.com/api/items/get?id=${pr0Id}&flags=7`);
		const desiredItem = itemsResult.data.items[0];

		// Tags von dem jeweiligen Post fetchen.
		const itemTags = await axios.get(`https://pr0gramm.com/api/items/info?itemId=${pr0Id}&flags=7`);
		const desiredItemTags = itemTags.data.tags;

		// Das kann man bestimmt irgendwie verbessern.
		let tags = desiredItemTags.sort((a, b) => a.confidence < b.confidence).map(t => t.tag);

		// Wir wollen später zwischen Video und Bild unterscheiden.
		let isVideo = desiredItem.image.indexOf(".mp4") !== -1;
		
		// RichEmbed Objekt erstellen.
		const embed = new Discord.RichEmbed();
		embed.setAuthor(desiredItem.user);
		embed.setImage(`https://img.pr0gramm.com/${desiredItem.thumb}`);
		embed.setColor(0xd23c22);

		// Description aufbauen.
		let description = `${desiredItem.up - desiredItem.down} Benis (+ ${desiredItem.up} | - ${desiredItem.down}) \n\n`;

		if(!isVideo) {
			// Wenn es sich um ein Bild handelt.
			embed.setTitle("Bild");
			description += `[Direkter Link](https://img.pr0gramm.com/${desiredItem.image}) \n`;
		} else {
			// Wenn es sich um ein Video handelt.
			embed.setTitle("Video");
			embed.setImage(`https://thumb.pr0gramm.com/${desiredItem.thumb}`);
			description += `[Direkter Link](https://vid.pr0gramm.com/${desiredItem.image}) \n`;
		}

		// Description entgültig zusammenbauen.
		description += `[pr0 Link](${content}) \n\n`;
		description += `**Tags:** \n${tags.join(", ")}`;

		/*
			// all: Vorschau wird überall angezeigt.
			// nsfw: Vorschau wird nur in nsfw Channels angezeigt.
			// none: Vorschau wird nirgends angezeigt.
			{
				showNsfl: [all, nsfw, none],
				showNsfw, [all, nsfw, none]
			}
		*/

		// Flag check.
		if(desiredItem.flags === 2 && msg.channel.nsfw === false) {
			// NSFW
			embed.setImage(null);
			description += `\n \n \n \n**Bild wurde aufgrund von NSFW entfernt. In den Einstellungen könnt ihr das ändern. (Oder den Channel NSFW machen)**`;
		} else if(desiredItem.flags === 4) {
			// NSFL
			embed.setImage(null);
			description += `\n \n \n \n**Bild wurde aufgrund von NSFL entfernt. In den Einstellungen könnt ihr das ändern.**`;
		}

		// Description und Formatierung hinzufügen, anschließend
		// die Nachricht mit dem RichEmbed abschicken.
		embed.setDescription(description);
		embed.addBlankField(true);
		msg.channel.send({ embed });
	}
};
