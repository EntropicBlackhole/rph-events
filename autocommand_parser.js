let squareBracketsRegex = /\[.+?\]/g
let angleBracketsRegex = /<.+?>/g
let string = process.argv[2]

// "shop [buy <item> <amount?>, list, sell <item>], transfer <user> <amount>, balance <user?>"
//
// "shop[buy <item> <amount?>|list|sell <item>],transfer <user> <amount>,balance <user?>"
var main = '';
var block = 'const subcommand = interaction.options.getSubcommand();\nconst subcommandGroup = interaction.options.getSubcommandGroup();\n';

for (i of string.split(',')) {
	if (i.includes('[')) {
		let subcommandGroup = i.split('[')[0]
		main += `.addSubcommandGroup(subcommandGroup => subcommandGroup\n.setName('${subcommandGroup.toLowerCase()}')\n.setDescription('')\n`
		block += `if (subcommandGroup == '${subcommandGroup.toLowerCase()}') {\n`
		for (j of i.split('[')[1].split(']')[0].split('|')) {
			// console.log(j)
			if (!j.includes('<')) {
				main += `.addSubcommand(subcommand => subcommand\n.setName('${j}')\n.setDescription(''))\n`
				block += `if (subcommand == '${j}') {\n\n}\n`
			}
			else {
				let items = j.split(' ')
				let subcommand = items.shift()
				block += `if (subcommand == '${subcommand}') {\n`
				main += `.addSubcommand(subcommand => subcommand\n.setName('${subcommand}')\n.setDescription('')\n`
				for (k of items) {
					block += `let ${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '') } = interaction.options.get('${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '') }');\n`
					main += `.addOption(option => option\n.setName('${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '') }')\n.setDescription(''))\n`
					if (!k.match(/(?<=\<).*?(?=\>)/g)[0].includes('?')) {
						main = main.substring(0, main.length - 2)
						main += `\n.setRequired(true))\n`
					}
					else {
						block = block.substring(0, block.length - 2)
						block += ` ? interaction.options.get('${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '') }') : 1;\n`
					}
				}
				main = main.trim()
				main += ')\n'
				block += '}\n'
			}
		}
		main = main.substring(0, main.length-1)
		main += ')\n'
		block += '}\n'
	}
	else {
		let items = i.split(' ')
		let subcommand = items.shift()
		block += `if (subcommand == '${subcommand}') {\n`
		main += `.addSubcommand(subcommand => subcommand\n.setName('${subcommand}')\n.setDescription('')\n`
		for (k of items) {
			block += `let ${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '')} = interaction.options.get('${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '')}');\n`
			main += `.addOption(option => option\n.setName('${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '')}')\n.setDescription(''))\n`
			if (!k.match(/(?<=\<).*?(?=\>)/g)[0].includes('?')) {
				main = main.substring(0, main.length - 2)
				main += `\n.setRequired(true))\n`
			}
			else {
				block = block.substring(0, block.length - 2)
				block += ` ? interaction.options.get('${k.match(/(?<=\<).*?(?=\>)/g)[0].replace('?', '')}') : 1;\n`
			}
		}
		main = main.trim()
		main += ')\n'
		block += '}\n'
	}
	
}
main = main.trim()
main += ','
block = block.trim()
console.log(main)
console.log('================================')
console.log(block)
function findSubStrings(string, regex) {
	arr = [];
	(string.match(regex) || []).map(function (str) {
		return arr.push(str.slice(1, -1))
	});
}