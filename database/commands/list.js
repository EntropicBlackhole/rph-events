const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  codeBlock,
} = require("discord.js");

module.exports = {
  name: "List",
  description: "Lists all the submissions pending to be verified in the queue",
  usage: "None",
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription(
      "Lists all the submissions pending to be verified in the queue"
    )
    .addBooleanOption((option) =>
      option
        .setName("detailed")
        .setDescription("Provides a detailed description")
    ),
  async execute({ interaction, client, db, functions }) {
    await interaction.deferReply();
    let detailed = await interaction.options.getBoolean("detailed");
    let submissions = await db.read("submissions");
    if (detailed) {
      let embedList = [];
      for (let sub in submissions) {
        // if (submissions[sub].isVerified) continue;
        const submissionEmbed = new EmbedBuilder()
          .setTitle(submissions[sub].username)
          .setDescription(
            `Repository: ${submissions[sub].repo_link}\nLanguage: ${
              submissions[sub].language
            }\nDifficulty: ${submissions[sub].difficulty}\nIs Verified: ${
              submissions[sub].isVerified
            }\nTime of Posting: <t:${submissions[sub].timestamp
              .toString()
              .substring(
                0,
                submissions[sub].timestamp.toString().length - 3
              )}:R>`
          )
          .setColor(functions.randomColor())
          .setTimestamp()
          .setFooter({
            text: "Please report any bugs! Thanks! ^^",
            iconURL: client.user.avatarURL(),
          });
        //Username
        //Repo link
        //Language
        //Is verified
        //Time
        embedList.push(submissionEmbed);
      }
      let buttonList = [
        new ButtonBuilder()
          .setCustomId("back")
          .setEmoji("◀")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶")
          .setStyle(ButtonStyle.Primary),
      ];
      await functions.paginationEmbed(interaction, embedList, buttonList);
    } else {
      const submissionEmbed = new EmbedBuilder()
        .setTitle("Pending Submissions")
        .setColor(functions.randomColor())
        .setTimestamp()
        .setFooter({
          text: "Please report any bugs! Thanks! ^^",
          iconURL: client.user.avatarURL(),
        });
        // let main = "";
      for (let sub in submissions) {
        if (submissions[sub].isVerified) continue;
        submissionEmbed.addFields([
          {
            name: submissions[sub].username,
            value: codeBlock(`Repository link: ${submissions[sub].repo_link}\nLanguage: ${submissions[sub].language}\nDifficulty: ${submissions[sub].difficulty}`) + "\n"
          },
        ]);
      }
      interaction.editReply({ embeds: [submissionEmbed] })
    }
  },
};
