const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	name: "Disapprove",
	description: "Disapprove a submission",
	usage: "<user>",
	data: new SlashCommandBuilder()
		.setName("disapprove")
		.setDescription("Dispprove a submission")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("User to disapprove")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("reason").setDescription("Why was the user disapproved?")
		),
	async execute({ interaction, client, db }) {
		await interaction.deferReply();
		let user = await interaction.options.getUser("user");
		let reason = await interaction.options.getString("reason");
		let submission = await db.read("submissions");
		if (submission[user.id] == undefined)
			return interaction.editReply("User has no submission to disapprove!");
		if (submission[user.id].isVerified) {
			return interaction.editReply(
				"This user has already been approved, are you sure you want to disapprove their submission? (Answering part in WIP, user if approved cannot be disapproved at the time being)"
			);
		}
		delete submission[user.id];
		db.write("submissions", submission);
		client.users.send(
			user.id,
			`Your submission was unfortunately not approved. ${reason || ""}`
		);
		return await interaction.editReply(
			`${user.username}'${
				user.username.substr(user.username.length - 1) == "s" ? "" : "s"
			} submission was disapproved with reason: ${reason || "None"}`
		);
	},
};
