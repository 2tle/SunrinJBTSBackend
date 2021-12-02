const app = require("express")()
const axios = require("axios")
const cheerio = require("cheerio")
const request = require('request')

const getHtml = async () => {
	try {
		const link = "https://m.search.naver.com/search.naver?where=m_news&sm=mtb_jum&query=" + encodeURI("대기오염")
		console.log(link)
		return await axios.get(link);
	} catch (err) {
		console.error(err)
	}
}

const getHtmlJH = async () => {
	try {
		const link = "https://www.melon.com/chart/";
		return await axios.get(link);
	} catch(err) {
		console.log(err)
	}
}

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
	res.header('Access-Control-Allow-Headers', 'content-type, x-access-token')
	next()
})

app.get('/news', (req, res) => {
	getHtml().then(html => {
		let ulList = [];
		const $ = cheerio.load(html.data);
		const $bodyList = $("div.news_wrap")
		$bodyList.each((i, elem) => {
			ulList[i] = {
				link: $(elem).find("a.news_tit").attr("href"),
				title: $(elem).find("div.tit").text()
			}
		})
		res.status(200).json({
			news: ulList
		})
	})
})

app.get('/news/all', (req, res) => {
	getHtml().then(html => {
		let ulList = [];
		const $ = cheerio.load(html.data);
		const $bodyList = $("div.news_wrap")
		$bodyList.each((i, elem) => {
			console.log($(elem).find("span.info").text())
			let dateStr = $(elem).find("span.info").text()
			if (dateStr.includes("네이버뉴스")) dateStr = dateStr.split("네")[0]
			ulList[i] = {
				link: $(elem).find("a.news_tit").attr("href"),
				title: $(elem).find("div.tit").text(),
				writer: $(elem).find("a.press").text().split(" ")[0],
				date: dateStr
			}
			//console.log()
			//console.log(ulList)

		})
		//return ulList.filter(n)
		//console.log(ulList);
		res.status(200).json({
			news: ulList
		})
	})
})

app.get('/air', (req, res) => {
	let lat = req.query.lat;
	let lng = req.query.lng;
	const token = "97d3cb8ef05bec64e89111b1eacda9bbe17a117a"
	const options = {
		uri: `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`
	};
	request(options, function(err, response, body) {
		const responseJSON = JSON.parse(body);
		console.log(responseJSON)
		res.status(200).json({
			current: responseJSON.data.iaqi,
			forecast: responseJSON.data.forecast
		})
	})
})


app.get('/jh/chart/music',(req,res) => {
	getHtmlJH().then(html => {
		let ulList = [];
		const $ = cheerio.load(html.data);
		const $bodyList = $("div.wrap_song_info")
		$bodyList.each((i, elem) => {
			if($(elem).find("div.rank01 > span > a").text() != "") {
				var author = $(elem).find("div.rank02 > a:first-child").text();
				console.log(author);
				//if(author.split(',').length > 2) author = author.split(',')[0]
				ulList.push({
					title: $(elem).find("div.rank01 > span > a").text(),
					author: author,
					link: "https://www.youtube.com/results?search_query="+$(elem).find("div.rank01 > span > a").text()
				})
			}
			
		})
		res.status(200).json({
			musics: ulList
		})
	})
})

const server = app.listen(3000, () => { console.log("server run ") })