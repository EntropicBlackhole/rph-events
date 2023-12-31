const {
	SlashCommandBuilder,
} = require("/data/data/com.termux/files/usr/lib/node_modules/discord.js");

module.exports = {
	name: "Approve",
	description: "Approve a submission",
	usage: "<user> <level> <challenge> <points>",
	data: new SlashCommandBuilder()
		.setName("approve")
		.setDescription("Approve a submission")
		.addUserOption((option) =>
			option.setName("user").setDescription("User to approve").setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("level")
				.setDescription("How difficult does the submission qualify?")
				.setChoices(
					{ name: "Easy", value: "0" },
					{ name: "Intermediate", value: "1" },
					{ name: "Difficult", value: "2" }
				)
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName("points")
				.setDescription(
					"How many points does this person deserve? (Follow the point system)"
				)
				.setMinValue(3)
				.setMaxValue(10)
				.setRequired(true)
		),
	async execute({ interaction, db, client, functions }) {
		await interaction.deferReply();
		if (
			!["708026434660204625", "779519660261376041"].includes(
				interaction.user.id
			)
		)
			return interaction.editReply({
				content: "You cant use this!",
				ephemeral: true,
			});
		let user = await interaction.options.getUser("user");
		let level = await interaction.options.getString("level");
		let points = await interaction.options.getInteger("points");

		let submissions = await db.read("submissions");
		let userData = await db.read("users");

		if (submissions[user.id] == undefined)
			return interaction.editReply("User has no submission to approve!");
		if (submissions[user.id].isVerified)
			return interaction.editReply("This user has already been approved");

		if (userData[user.id] == undefined) {
			userData[user.id] = {
				name: user.username,
				points: 0,
				challenge_amt: [0, 0, 0],
			};
			db.write("users", userData);
			return interaction.editReply(
				"Careful, this user might not have a submission but I haven't noticed somehow"
			);
		}
		userData[user.id].points += points;
		userData[user.id].challenge_amt[parseInt(level)] += 1;
		submissions[user.id].isVerified = true;

		db.write("users", userData);
		db.write("submissions", submissions);

		let pSubs = await db.read("post_submissions");
		pSubs.push(user.id.toString());
		db.write("post_submissions", pSubs);
		/*
		let channel = await client.channels.fetch(submissions[user.id].threadID);
		channel.messages
			.fetch(submissions[user.id].messageID)
			.then((message) => message.react("✅"))
			.catch(console.error);

		//?? Updating the scoreboard
		let parsedSB = functions.parseScoreboard(userData);
		let channelSB = await client.channels.fetch("1126882595393769552");
		let messageSB = await channelSB.messages.fetch("1127050517474979941");
		await messageSB.edit(parsedSB);
*/
		return await interaction.editReply(
			`${user.username}'${
				user.username.substr(user.username.length - 1) == "s" ? "" : "s"
			} submission was approved with level ${parseInt(level) + 1}!`
		);
	},
};
