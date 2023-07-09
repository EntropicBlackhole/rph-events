const { SlashCommandBuilder } = require('/data/data/com.termux/files/usr/lib/node_modules/discord.js')

module.exports = {
	name: "AddScoreBoard",
	description: "Adds a new scoreboard",
	usage: "None",
	data: new SlashCommandBuilder()
		.setName("add-scoreboard")
		.setDescription("Adds a new scoreboard"),
	async execute({ interaction, client, db }) {
	    return
		// let scoreboardChannel = await client.channels.cache.get("1126882595393769552");
		let userData = await db.read("users");

		//? Algorithm for creating the scoreboard
		userData = sortObject(userData);
        // console.log(userData);
		let usernameLengthArray = [];
		for (let user in userData) usernameLengthArray.push(userData[user].name.length);
		let spacesToAdd = Math.max(...usernameLengthArray) + 1;
		let mainString = `\`\`\`\n`;
		for (let i = 0; i < spacesToAdd; i++) mainString += " ";
		mainString += "| Points | Easy | Intermediate | Hard\n";
		for (let i = 0; i < spacesToAdd; i++) mainString += "-";
		mainString += "--------------------------------------\n";
		for (let user in userData) {
			mainString += userData[user].name;
			for (let i = 0; i < spacesToAdd - userData[user].name.length; i++)
				mainString += " ";
			mainString += "|";
			if (userData[user].points.toString().length == 1)
				mainString += `    ${userData[user].points.toString()}   |`;
			if (userData[user].points.toString().length == 2)
				mainString += `   ${userData[user].points.toString()}   |`;
			if (userData[user].points.toString().length == 3)
				mainString += `   ${userData[user].points.toString()}  |`;

			if (userData[user].challenge_amt[0].toString().length == 1)
				mainString += `  ${userData[user].challenge_amt[0].toString()}   |`;
			if (userData[user].challenge_amt[0].toString().length == 2)
				mainString += `  ${userData[user].challenge_amt[0].toString()}  |`;
			if (userData[user].challenge_amt[0].toString().length == 3)
				mainString += ` ${userData[user].challenge_amt[0].toString()}  |`;

			if (userData[user].challenge_amt[1].toString().length == 1)
				mainString += `      ${userData[
					user
				].challenge_amt[1].toString()}       |`;
			if (userData[user].challenge_amt[1].toString().length == 2)
				mainString += `     ${userData[
					user
				].challenge_amt[1].toString()}       |`;
			if (userData[user].challenge_amt[1].toString().length == 3)
				mainString += `     ${userData[
					user
				].challenge_amt[1].toString()}      |`;

			mainString += `   ${userData[user].challenge_amt[2].toString()}\n`;
			// mainString += "\n";
		}
		mainString += "```";

		let channelSB = await client.channels.fetch("1126882595393769552");
		let messageSB = await channelSB.messages.fetch("1127050517474979941");
		await messageSB.edit(mainString.trim());

		//? Algorithm done
		// scoreboardChannel.send(mainString.trim());
		// return interaction.reply("Done! :3");
		// await interaction.deferReply();
	},
};


function sortObject(obj) {
    let returnObj = {};
	let newObj = Object.entries(obj).sort(([k1, v1], [k2, v2]) => v2.points - v1.points);
    for (let nObj of newObj) returnObj[nObj[0]] = nObj[1];
    return returnObj;
}
