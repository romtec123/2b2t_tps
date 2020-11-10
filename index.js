const config = require("./checker_conf.json");
const Discord = require('discord.js');
const dbot = new Discord.Client({disableEveryone: true});
const request = require('request');
let isLagging = false
let minTps
let lagStartTime
let tpsAvg
let tpsCount
let totalPoints


dbot.on("ready", async () => {
    console.log(`Discord Bot starting up...`);
})


function msgAll(channelName, msg){ 
  dbot.guilds.cache.forEach((guild) => {
      let Channel = guild.channels.cache.find(channel => channel.name == channelName);
      if (Channel === undefined) return
      Channel.send(msg)
  })

}

function msgAdmin(msg){
  try{
    dbot.channels.cache.get('760011982484537394').send(msg)
  } catch(error){console.log(error)}
}

function checkLag(){
  console.log("Checking TPS.")
	try{
	request('https://api.2b2t.dev/status', { json: true }, (err, res, body) => {
		if(body == undefined){return}
      	stats = body[0]
      	tps = stats[0]
      	if(tps == 0 || tps == undefined){return}
      	tps = parseFloat(tps)
      	if(tps <= 6){
      		if(isLagging == false){
      			msgAll("2b2t-lag-test", "2B2T has started lagging. TPS: " + tps)
            console.log("2B2T has started lagging. TPS: " + tps)
      			lagStartTime = Date.now()
      			minTps = tps
      			tpsAvg = tps
      			tpsCount = 1
      			isLagging = true
      			totalPoints = 0
      			if(tps<=2){
      				totalPoints = (1 / Math.sqrt(tpsAvg/tpsCount))
      			}
      			return
      		}
      		if(isLagging == true){
      			tpsAvg = tpsAvg + tps
      			tpsCount = tpsCount + 1
      			if(minTps > tps){
      				minTps = tps
      			}
      			if(tps<=2){
      				totalPoints = totalPoints + (1 / Math.sqrt(tpsAvg/tpsCount))
      			}
      		}
      	}
      	if(tps > 6){
      		if(isLagging == false){return}
      		if(isLagging == true){
      			isLagging = false
      			tpsAvg = tpsAvg/tpsCount
      			let uptimesec = (Date.now() - lagStartTime) /  1000
    			let hours = Math.floor(uptimesec / 60 / 60);
    			let minutes = Math.floor(uptimesec / 60) - (hours * 60);
    			let seconds = Math.floor(uptimesec % 60);
    			//hours + 'h ' + minutes + 'm ' + seconds + 's.'
    			let lagEmbed = new Discord.MessageEmbed()
    			.setColor('#CC3333')
    			.setTitle('2B2T Lag Information')
    			.setURL('https://discord.gg/G2w7DQQ')
    			.setAuthor('2B2BOT', 'https://i.imgur.com/mReItus.png', 'https://discord.gg/G2w7DQQ')
    			.setDescription('Information on the recent lag spike on 2B2T.')
    			.addFields(
      				{ name: 'Average TPS during spike', value: tpsAvg },
     				  { name: 'Lag spike time', value: hours + 'h ' + minutes + 'm ' + seconds + 's.'},
      				{ name: 'Lowest recorded TPS', value: minTps },
      				{ name: 'Points', value: (totalPoints / 4)},
    			)
    			msgAll('2b2t-lag-test', lagEmbed);
      		}
      	}
    })
	} catch(error){msgAdmin(error)}
}


setInterval(function(){
	checkLag();
}, 15000)

dbot.login(config.token);
