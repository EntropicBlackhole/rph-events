const {
	SlashCommandBuilder,
} = require("/data/data/com.termux/files/usr/lib/node_modules/discord.js");

module.exports = {
	name: "AddScoreBoard",
	description: "Adds a new scoreboard",
	usage: "None",
	data: new SlashCommandBuilder()
		.setName("add-scoreboard")
		.setDescription("Adds a new scoreboard"),
	async execute({ functions, client, db }) {
		let userData = await db.read("users");
		let parsedSB = functions.parseScoreboard(userData);
		let channelSB = await client.channels.fetch("1126882595393769552");
		let messageSB = await channelSB.messages.fetch("1127050517474979941");
		await messageSB.edit(parsedSB);
	},
};

function sortObject(obj) {
	let returnObj = {};
	let newObj = Object.entries(obj).sort(
		([k1, v1], [k2, v2]) => v2.points - v1.points
	);
	for (let nObj of newObj) returnObj[nObj[0]] = nObj[1];
	return returnObj;
}
