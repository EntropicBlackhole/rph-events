const fs = require("node:fs");
const path = require("node:path");
//const Discord = require("discord.js");
const Discord = require('/data/data/com.termux/files/usr/lib/node_modules/discord.js')
const functions = require("./database/bot/functions");
const config = require("./database/bot/config.json");
const db = new functions.DB();

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.MessageContent,
	],
	partials: [Discord.Partials.Channel, Discord.Partials.Message],
});
client.login(config.token);

const commands = [];
const commandsPath = path.join(__dirname, "./database/commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));
client.commands = new Discord.Collection();

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);

	const command = require(filePath);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

const REST = new Discord.REST({ version: "10" }).setToken(config.token);

REST.put(Discord.Routes.applicationCommands(config.clientID), {
	body: commands,
})
	.then((data) =>
		console.log(`Successfully registered ${data.length} application commands.`)
	)
	.catch(console.error);

client.once(Discord.Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Discord.Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;
		try {
			await command.execute({ interaction, client, db, functions });
		} catch (error) {
			console.error(error);
		}
	} else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}
});

let threadID = "";
client.on(Discord.Events.MessageCreate, async (message) => {
	if (threadID == message.channel.id) {
		let messagePost = message.content;
		// console.log(messagePost)
		let urlRegex =
			/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
		let langRegex = /(lang[^\n]+)/gi;
		let difficultyRegex = /(diff[^\n]+)/gi;
		let noteRegex = /Note.*/gis;
		let repoURL = messagePost.match(urlRegex);
		if (repoURL == null) {
			await message.react("❌");
			return await message.reply(
				"It seems your post did not include a link to your repository, please contact <@708026434660204625> if your post does contain it and I'm just being dumb"
			);
		} else repoURL = repoURL[0];
		let lang = messagePost.match(langRegex);
		if (lang == null) {
			await message.react("❌");
			return await message.reply(
				"It seems your post did not include a language, please contact <@708026434660204625> if your post does contain it and I'm just being dumb"
			);
		}
		// else lang = lang.split(":")[1].trim();
		else lang = capitalize(lang[0]);
		let difficulty = messagePost.match(difficultyRegex);
		if (difficulty != null) difficulty = capitalize(difficulty[0]);
		let note = messagePost.match(noteRegex);
		if (note != null) note = note[0];
		// console.log(`Repository: ${repoURL}\n${lang}\n${difficulty}`);
		//!! Post to webhook ^
		let submissions = await db.read("submissions");
		let userData = await db.read("users");
		submissions[message.author.id] = {
			username: message.author.username,
			repo_link: repoURL,
			language: lang.split(":")[1].trim(),
			difficulty: difficulty ?? "None specified",
			note: note ?? "No note given",
			isVerified: false,
			threadID: message.channel.id,
			messageID: message.id,
			timestamp: Date.now(),
		};
		threadID = "";
		userData[message.author.id] = userData[message.author.id] || {
			name: message.author.username,
			points: 0,
			challenge_amt: [],
		};
		db.write("submissions", submissions);
		db.write("users", userData);
		//Webhook sending
	}
});

client.on(Discord.Events.ThreadCreate, async (thread) => {
	if (thread.type == Discord.ChannelType.PublicThread) {
		if (thread.parentId != "1122515833223123045") return; //!! Change to rph's event forum
		threadID = thread.id; //?? And also move up to a single if statement
		// console.log(threadID); // The forum post ID
		// console.log(thread.name); // The name of the forum post
		// console.log(Date.now());
		// console.log(thread.messages);
		// fs.writeFileSync('./test.json', JSON.stringify(thread.messages, null, 2));
		// console.log(thread.members);
		// console.log(thread.ownerId);
		// console.log(thread);
	}
	// console.log(thread)
	// console.log(thread, "a");
});
// 1124571200266457099;

// 1688189189717;

function capitalize(string) {
	return string
		.replace("_", " ")
		.split(" ")
		.map((word) => {
			if (isStringUpperCase(word)) return word;
			return word[0].toUpperCase() + word.slice(1);
		})
		.join(" ");
}

function isStringUpperCase(str) {
	return str === str.toUpperCase();
}
