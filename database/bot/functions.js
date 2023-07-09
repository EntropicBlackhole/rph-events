//const { Sequelize, DataTypes } = require("sequelize");
const { ActionRowBuilder } = require('/data/data/com.termux/files/usr/lib/node_modules/discord.js')
const fs = require("fs");
exports.subStrBetweenChar = subStrBetweenChar;
exports.randomColor = randomColor;
exports.shortenText = shortenText;

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

class Database {
  constructor(path) {
      /*
    this.sequelize = new Sequelize({
      dialect: "sqlite",
      storage: path,
      logging: false,
    });

    try {
      this.sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
    // this.sequelize.sync();
    this.createTable("users", {
      points: DataTypes.INTEGER,
      challenge_amt: DataTypes.TEXT,
    });
    this.createTable("submissions", {
      repo_link: DataTypes.TEXT,
      challenge_id: DataTypes.TEXT,
    });
    this.sequelize.sync();
    */
  }

  async read({ table, ID }) {
    // console.log(table, 'table')
    // console.log(ID, 'id')
    let data = this.sequelize.models[table];
    // console.log(data, 'data')
    let returnData = await data.findOne({
      where: {
        id: ID,
      },
    });
    return returnData;
  }

  async readAll(table, params = undefined) {
    let data = this.sequelize.models[table];
    let returnData = await data.findAll(params);
    return JSON.parse(JSON.stringify(returnData));
  }

  async write({ table, ID, dataToUpdate }) {
    let data = await this.read({ table, ID });
    let t = this.sequelize.models[table];
    if (data == null) {
      //If row doesn't exist,
      await t.create({
        //Create it, with the ID
        id: ID,
      });
    }
    for (let item in dataToUpdate) {
      await t.update(
        { [item]: dataToUpdate[item] },
        {
          where: {
            id: ID,
          },
        }
      );
    }
    return true;
  }

  async destroy(table, ID) {
    await this.sequelize.models[table].destroy({
      where: { id: ID },
    });
    return 0;
  }
  async increment({ table, ID, data }) {
    let dataTable = this.sequelize.models[table];
    await dataTable.increment(data, { where: { id: ID } });
    return 0;
  }
  async drop(table) {
    let dataTable = this.sequelize.models[table];
    await dataTable.drop();
    return 0;
  }
  async createTable(table, data) {
    return this.sequelize.define(table, data);
  }
}

class DB {
  constructor() {
    this.dataTable = {
      users: "./database/misc/users.json",
      submissions: "./database/misc/submissions.json",
    };
  }
  read(table) {
    return JSON.parse(fs.readFileSync(this.dataTable[table], "utf8"));
  }
  write(table, data) {
    fs.writeFileSync(this.dataTable[table], JSON.stringify(data, null, 2));
  }
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

exports.Database = Database;
exports.DB = DB;
exports.paginationEmbed = paginationEmbed;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
