const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	name: "Vote",
	description: "Vote for who you think deserves it!",
	usage: "<user> <points> <reason>",
	data: new SlashCommandBuilder()
		.setName("vote")
		.setDescription("Who will you vote for?")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("User to vote for")
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName("points")
				.setDescription("How many points to give (0-10)")
				.setMinValue(0)
				.setMaxValue(10)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Why is it this amount?")
				.setRequired(true)
		),
	async execute({ interaction, client, db }) {
		await interaction.deferReply();
		let pSubs = await db.read("post_submissions");
		let pVotes = await db.read("peoples_votes");
		let users = await db.read("users");
		if (!Object.keys(users).includes(interaction.user.id))
        return interaction.editReply({
            content: "You haven't participated before",
            ephemeral: true,
        });
        
		let user = interaction.options.getUser("user");
        if (user.id == interaction.user.id) return interaction.editReply({ content: "You can't vote for yourself dumbass", ephemeral: true });
		let points = interaction.options.getInteger("points");
		let reason = interaction.options.getString("reason");

		if (!pSubs.includes(user.id))
			return interaction.editReply({
				content: `This person doesn't have a submission`,
				ephemeral: true,
			});
		if ([undefined, null, {}].includes(pVotes[user.id])) {
			pVotes[user.id] = {
				total_points: 5,
				average: 5,
				votes: {},
			};
		}
		if (Object.keys(pVotes[user.id].votes).includes(interaction.user.id))
			return interaction.editReply({
				content: `You have already votes for this post with ${
					pVotes[user.id].votes[interaction.user.id].points
				} points with reason "${
					pVotes[user.id].votes[interaction.user.id].reason
				}"`,
				ephemeral: true,
			});
		pVotes[user.id].total_points += points;
		pVotes[user.id].votes[interaction.user.id] = { points, reason };
		pVotes[user.id].average =
			pVotes[user.id].total_points /
			(Object.keys(pVotes[user.id].votes).length + 1);

		await db.write("peoples_votes", pVotes);
		return interaction.editReply({
			content: `You voted for ${user} with ${points} point${
				points == 1 ? "" : "s"
			}!`,
			ephemeral: true,
		});
	},
};
