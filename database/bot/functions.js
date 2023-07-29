//const { Sequelize, DataTypes } = require("sequelize");
const {
	ActionRowBuilder,
} = require("/data/data/com.termux/files/usr/lib/node_modules/discord.js");
const fs = require("fs");
exports.subStrBetweenChar = subStrBetweenChar;
exports.randomColor = randomColor;
exports.shortenText = shortenText;
exports.paginationEmbed = paginationEmbed;
exports.parseScoreboard = parseScoreboard;

function subStrBetweenChar(string, start, end) {
	return string.split(start)[1].split(end)[0];
}
function randomColor() {
	return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
function shortenText(text, delimiter, max) {
	if (text.length <= max) return text;
	else {
		newText = text.toString().split(delimiter.toString());
		newText.pop();
		return shortenText(newText.join(delimiter), delimiter, max);
	}
}

class DB {
	constructor() {
		this.dataTable = {
			users: "./database/misc/users.json",
			submissions: "./database/misc/submissions.json",
			post_submissions: "./database/misc/post_submissions.json",
			peoples_votes: "./database/misc/peoples_votes.json",
		};
	}
	read(table) {
		return JSON.parse(fs.readFileSync(this.dataTable[table], "utf8"));
	}
	write(table, data) {
		fs.writeFileSync(this.dataTable[table], JSON.stringify(data, null, 2));
	}
}

function parseScoreboard(userData) {
	userData = sortObject(userData);
	let usernameLengthArray = [];
	for (let user2 in userData)
		usernameLengthArray.push(userData[user2].name.length);
	let spacesToAdd = Math.max(...usernameLengthArray) + 1;
	let mainString = `\`\`\`\n`;
	for (let i = 0; i < spacesToAdd; i++) mainString += " ";
	mainString += "| Pts | Easy | Inter | Hard\n";
	for (let i = 0; i < spacesToAdd; i++) mainString += "-";
	mainString += "---------------------------\n";
	for (let user2 in userData) {
		mainString += userData[user2].name;
		for (let i = 0; i < spacesToAdd - userData[user2].name.length; i++)
			mainString += " ";
		mainString += "|";
		if (userData[user2].points.toString().length == 1)
			mainString += `  ${userData[user2].points.toString()}  |`;
		if (userData[user2].points.toString().length == 2)
			mainString += ` ${userData[user2].points.toString()}  |`;
		if (userData[user2].points.toString().length == 3)
			mainString += ` ${userData[user2].points.toString()} |`;

		if (userData[user2].challenge_amt[0].toString().length == 1)
			mainString += `   ${userData[user2].challenge_amt[0].toString()}  |`;
		if (userData[user2].challenge_amt[0].toString().length == 2)
			mainString += `  ${userData[user2].challenge_amt[0].toString()}   |`;
		if (userData[user2].challenge_amt[0].toString().length == 3)
			mainString += `  ${userData[user2].challenge_amt[0].toString()}  |`;

		if (userData[user2].challenge_amt[1].toString().length == 1)
			mainString += `   ${userData[user2].challenge_amt[1].toString()}   |`;
		if (userData[user2].challenge_amt[1].toString().length == 2)
			mainString += `  ${userData[user2].challenge_amt[1].toString()}    |`;
		if (userData[user2].challenge_amt[1].toString().length == 3)
			mainString += `  ${userData[user2].challenge_amt[1].toString()}   |`;
		mainString += `   ${userData[user2].challenge_amt[2].toString()}\n`;
		// mainString += "\n";
	}
	mainString += "```";
	return mainString.trim();
}

async function paginationEmbed(
	interaction,
	pages,
	buttonList,
	timeout = 120000
) {
	if (!pages) throw new Error("Pages are not given.");
	if (!buttonList) throw new Error("Buttons are not given.");
	if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
		throw new Error("Link buttons are not supported");
	if (buttonList.length !== 2) throw new Error("Need two buttons.");
	let page = 0;
	const row = new ActionRowBuilder().addComponents(buttonList);
	if (interaction.deferred == false) await interaction.deferReply();
	const curPage = await interaction.editReply({
		embeds: [
			pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` }),
		],
		components: [row],
		fetchReply: true,
	});
	const filter = (i) =>
		i.custom_id === buttonList[1].custom_id ||
		i.custom_id === buttonList[0].custom_id;

	const collector = await curPage.createMessageComponentCollector({
		filter,
		time: timeout,
	});

	collector.on("collect", async (i) => {
		switch (i.customId) {
			case buttonList[0].data.custom_id:
				page = page > 0 ? --page : pages.length - 1;
				break;
			case buttonList[1].data.custom_id:
				page = page + 1 < pages.length ? ++page : 0;
				break;
			default:
				break;
		}
		await i.deferUpdate();
		await i.editReply({
			embeds: [
				pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` }),
			],
			components: [row],
		});
		collector.resetTimer();
	});

	collector.on("end", (_, reason) => {
		if (reason !== "messageDelete") {
			const disabledRow = new ActionRowBuilder().addComponents(
				buttonList[0].setDisabled(true),
				buttonList[1].setDisabled(true)
			);
			curPage.edit({
				embeds: [
					pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` }),
				],
				components: [disabledRow],
			});
		}
	});

	return curPage;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function sortObject(obj) {
	let returnObj = {};
	let newObj = Object.entries(obj).sort(
		([k1, v1], [k2, v2]) => v2.points - v1.points
	);
	for (let nObj of newObj) returnObj[nObj[0]] = nObj[1];
	return returnObj;
}

exports.DB = DB;
