let userData = {}
console.log(userData);
userData['7080'] = userData['7080'] ?? {
  points: 0,
  challenge_amt: []
}
console.log(userData);
/*
		!! OKAY KRISSY TODO LIST
		!! GET THE LINK FROM THE POST
		?? URL REGEX AND FIRST LINE THAT STARTS WITH "REPO"
		!! GET THE LANGUAGE FROM THE POST
		?? THE FIRST LINE THAT STARTS WITH "LANG"
		!! GET THE SAID DIFFICULTY FROM THE POST
		?? THE FIRST LINE THAT STARTS WITH "DIFF?"
		!! GET ANY ADDITIONAL NOTES FROM THE POST
		?? GET EVERYTHING ELSE THAT ISN'T THOSE LINES

    Github repository: https://github.com/Renjian-buchai/0006/tree/main/02072023 

Language: Python 

difficulty: Intermediate 

Does not run if compiled with gcc 

Laugh 

Solved with trigonometry, if for loops are considered if statements, I'll just unroll everything i guess
/*
const { Database } = require("./database/bot/functions");
const { DataTypes } = require("sequelize");
const db = new Database("./database/db.sqlite");
db.createTable("users", {
  points: DataTypes.INTEGER,
  challenge_amt: DataTypes.TEXT,
});

// db.write({
//     table: 'submissions',
//     ID: '7080',
//     dataToUpdate: {
//         challenge_id: '010723',
//         repo_link: 'https://github.com/EntropicBlackhole/rph-challenges'
//     }
// })



db.write({
  table: "users",
  ID: "7080",
  dataToUpdate: {
    points: 50,
    challenge_amt: "3|2|2",
  },
});
*/

function capitalize(string) {
		return string.replace('_', ' ').toLowerCase().split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")
	}