// States that are voting in Democratic primary
var states = {};
states.code = {
	'AL': 'Alabama',
	'AK': 'Alaska',
	'AS': 'American Samoa',
	'AZ': 'Arizona',
	'AR': 'Arkansas',
	'DA': 'Democrats Abroad',
	'CA': 'California',
	'CO': 'Colorado',
	'CT': 'Connecticut',
	'DE': 'Delaware',
	'DC': 'District of Columbia',
	'FL': 'Florida',
	'GA': 'Georgia',
	'GU': 'Guam',
	'HI': 'Hawaii',
	'ID': 'Idaho',
	'IL': 'Illinois',
	'IN': 'Indiana',
	'IA': 'Iowa',
	'KS': 'Kansas',
	'KY': 'Kentucky',
	'LA': 'Louisiana',
	'ME': 'Maine',
	'MD': 'Maryland',
	'MA': 'Massachusetts',
	'MI': 'Michigan',
	'MN': 'Minnesota',
	'MS': 'Mississippi',
	'MO': 'Missouri',
	'MT': 'Montana',
	'NE': 'Nebraska',
	'NV': 'Nevada',
	'NH': 'New Hampshire',
	'NJ': 'New Jersey',
	'NM': 'New Mexico',
	'NY': 'New York',
	'NC': 'North Carolina',
	'ND': 'North Dakota',
	'MP': 'Northern Marianas',
	'OH': 'Ohio',
	'OK': 'Oklahoma',
	'OR': 'Oregon',
	'PW': 'Palau',
	'PA': 'Pennsylvania',
	'PR': 'Puerto Rico',
	'RI': 'Rhode Island',
	'SC': 'South Carolina',
	'SD': 'South Dakota',
	'TN': 'Tennessee',
	'TX': 'Texas',
	'UT': 'Utah',
	'VT': 'Vermont',
	'VI': 'Virgin Islands',
	'VA': 'Virginia',
	'WA': 'Washington',
	'WV': 'West Virginia',
	'WI': 'Wisconsin',
	'WY': 'Wyoming'
};

states.name = {
	'Alabama': 'AL',
	'Alaska': 'AK',
	'American Samoa': 'AS',
	'Arizona': 'AZ',
	'Arkansas': 'AR',
	'California': 'CA',
	'Colorado': 'CO',
	'Connecticut': 'CT',
	'Democrats Abroad': 'DA',
	'Delaware': 'DE',
	'District of Columbia': 'DC',
	'Florida': 'FL',
	'Georgia': 'GA',
	'Guam': 'GU',
	'Hawaii': 'HI',
	'Idaho': 'ID',
	'Illinois': 'IL',
	'Indiana': 'IN',
	'Iowa': 'IA',
	'Kansas': 'KS',
	'Kentucky': 'KY',
	'Louisiana': 'LA',
	'Maine': 'ME',
	'Maryland': 'MD',
	'Massachusetts': 'MA',
	'Michigan': 'MI',
	'Minnesota': 'MN',
	'Mississippi': 'MS',
	'Missouri': 'MO',
	'Montana': 'MT',
	'Nebraska': 'NE',
	'Nevada': 'NV',
	'New Hampshire': 'NH',
	'New Jersey': 'NJ',
	'New Mexico': 'NM',
	'New York': 'NY',
	'North Carolina': 'NC',
	'North Dakota': 'ND',
	'Northern Marianas': 'MP',
	'Ohio': 'OH',
	'Oklahoma': 'OK',
	'Oregon': 'OR',
	'Palau': 'PW',
	'Pennsylvania': 'PA',
	'Puerto Rico': 'PR',
	'Rhode Island': 'RI',
	'South Carolina': 'SC',
	'South Dakota': 'SD',
	'Tennessee': 'TN',
	'Texas': 'TX',
	'Utah': 'UT',
	'Vermont': 'VT',
	'Virgin Islands': 'VI',
	'Virginia': 'VA',
	'Washington': 'WA',
	'West Virginia': 'WV',
	'Wisconsin': 'WI',
	'Wyoming': 'WY'
}

// Shortlink
var link = 'https://git.io/superrigged';

// JSONP request
var jsonp = {};
jsonp.r = null;
jsonp.load = function(page,cb){
	if(jsonp.r){
		setTimeout(function(){
			jsonp.load(page,cb);
		},50);
		return;
	}
	jsonp.r = document.createElement('script');
	jsonp.r.type = 'text/javascript';
	jsonp.r.id = 'sr-jsonp';
	jsonp.r.src = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + page.replace(' ','_') + '&callback=' + cb;

	document.body.appendChild(jsonp.r);
}
jsonp.clear = function(){
	jsonp.r.remove();
	jsonp.r = null;
}

// Results of primaries and caucuses
var r = {
	bern:{},
	hill:{},
	pledged:0,
	super:0
}

var d = {
	bern:{
		all:0,
		pledged:0,
		super:0
	},
	hill:{
		all:0,
		pledged:0,
		super:0
	},
	state:{},
	uncommitted:0
}

var res = [];

// Parse results
function pledged(data){
	jsonp.clear();

	var html = data.parse.text['*'];
	var wiki = new DOMParser();
	wiki = wiki.parseFromString(html,'text/html');

	// Unnecessary elements
	wiki.querySelector('.infobox').remove();
	wiki.querySelector('table').remove();
	wiki.querySelector('table tr').remove();
	wiki.querySelector('table tr').remove();
	wiki.querySelector('table tr').remove();

	// Count pledged delegates and get results
	var res = wiki.querySelector('table').querySelectorAll('tr');
	for(var i = 0; i < res.length - 5; i++){
		var first = res[i].querySelector('td:nth-child(1)');
		if(first.getAttribute('rowspan')){
			var row = i + parseFloat(first.getAttribute('rowspan'));
			first.removeAttribute('rowspan');
			for(var j = i + 1; j < row; j++){
				res[j].insertBefore(first.cloneNode(true),res[j].firstChild);
			}
		}

		var date = first.querySelector('.sortkey').textContent;
		date = date.replace(new RegExp('00000000(\\d+)-(\\d+)-(\\d+)-0000'),'$1-$2-$3');

		var stateName = res[i].querySelector('td:nth-child(2)').firstChild.textContent;
		var state = states.name[stateName].toLowerCase();

		r.bern[state] = {
			all:0,
			percent:0,
			pledged:0,
			super:0
		}
		r.hill[state] = {
			all:0,
			percent:0,
			pledged:0,
			super:0
		}
		d.state[state] = {
			all:0,
			date:date,
			pledged:0,
			super:0,
			type:{
				letter:'',
				name:''
			}
		}
		
		var count = res[i].querySelector('td:nth-child(3)').firstChild.textContent;
		count = parseFloat(count);

		var type = res[i].querySelector('td:nth-child(6)').firstChild.textContent;
		type = type.replace(',','').trim();
		var t;
		switch(type){
			case 'Open caucus':
			case 'Semi-open caucus':
			case 'Semi-closed caucus':
			case 'Closed caucus':
				t = 'C';
				break;
			case 'Open primary':
			case 'Semi-open primary':
			case 'Semi-closed primary':
			case 'Closed primary':
				t = 'P';
				break;
		}
		d.state[state].type.letter = t;
		d.state[state].type.name = type;

		var bern = res[i].querySelector('td:nth-child(8)').getAttribute('data-sort-value');
		var bernDel = res[i].querySelector('td:nth-child(12)').firstChild.textContent;
		bern = parseFloat(bern);
		bernDel = parseFloat(bernDel);

		var hill = res[i].querySelector('td:nth-child(7)').getAttribute('data-sort-value');
		var hillDel = res[i].querySelector('td:nth-child(9)').firstChild.textContent;
		hill = parseFloat(hill);
		hillDel = parseFloat(hillDel);

		if(Date.parse(date) < Date.now()){
			r.bern[state].percent = bern;
			r.hill[state].percent = hill;

			r.bern[state].pledged = bernDel;
			r.bern[state].all = bernDel;
			r.hill[state].pledged = hillDel;
			r.hill[state].all = hillDel;

			d.bern.pledged += bernDel;
			d.hill.pledged += hillDel;

			d.bern.all += bernDel;
			d.hill.all += hillDel;
		}
		d.state[state].pledged = count;
		d.state[state].all += count;
		r.pledged += count;
	}
}

function superd(data){
	jsonp.clear();

	var html = data.parse.text['*'];
	var wiki = new DOMParser();
	wiki = wiki.parseFromString(html,'text/html');

	// Unnecessary elements
	wiki.querySelector('table').remove();
	wiki.querySelector('table').remove();
	wiki.querySelector('table tr').remove();

	// Count delegates from both sides
	var table = wiki.querySelector('table');
	var st = table.querySelectorAll('tr > td:nth-child(2)');
	var af = table.querySelectorAll('tr > td:nth-child(4)');
	for(var i = 0; i < st.length; i++){
		console.log('State: ' + st[i].textContent + ' / Pick: ' + af[i].textContent);
		var state = st[i].firstChild.textContent.toLowerCase();
		var pick = af[i].getAttribute('data-sort-value');

		r.super += 1;
		if(state == '—'){
			d.uncommitted += 1;
			continue;
		}
		d.state[state].super += 1;
		d.state[state].all += 1;

		if(pick && (pick == 'Clinton' || pick == 'Sanders')){
			pick = (pick == 'Sanders') ? 'bern' : 'hill';
			var isDA = (state == 'da') ? 0.5 : 1;

			r[pick][state].super += 1;
			r[pick][state].all += 1;
			d[pick].super += isDA;
			d[pick].all += isDA;
		} else {
			d.uncommitted += 1;
		}
	}

	results();
}

// Make results into view model
var rigged = [0,0];
function results(){
	if(!d){
		setTimeout(function(){
			results();
		},50);
		return;
	}
	var prev;
	var real = {
		bern:0,
		hill:0
	}

	for(var key in d.state){
		var self = {};
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

		var stb = r.bern[key];
		var std = d.state[key];
		var sth = r.hill[key];

		var date = new Date(std.date);
		var day = date.getDate();
		var month = date.getMonth();

		// Is contest over
		var future = (date > Date.now());
		self.date = months[month] + ' ' + day;
		self.future = future;

		// Type of contest
		self.type = {};
		self.type.letter = std.type.letter;
		self.type.name = std.type.name;

		// Calculate percents
		var bpdpct = Math.round(stb.percent * 10) / 10;
		var hpdpct = Math.round(sth.percent * 10) / 10
		var bsdpct = Math.round((stb.super / std.super) * 100 * 10) / 10;
		var hsdpct = Math.round((sth.super / std.super) * 100 * 10) / 10;

		// Add values for Bernie
		self.bern = {};
		self.bern.pct = {};
		self.bern.pct.pledged = bpdpct;
		self.bern.pct.super = bsdpct;
		self.bern.pledged = stb.pledged;
		self.bern.super = stb.super;
		self.bern.isRigged = ((future && (bsdpct > hsdpct)) || (!future && bsdpct > bpdpct));

		if(self.bern.isRigged){
			rigged[0] += 1;
		}

		// Add values for Hillary
		self.hill = {};
		self.hill.isRigged = ((future && (hsdpct > bsdpct)) || (!future && hsdpct > hpdpct));
		self.hill.pct = {};
		self.hill.pct.pledged = hpdpct;
		self.hill.pct.super = hsdpct;
		self.hill.pledged = sth.pledged;
		self.hill.super = sth.super;

		if(self.hill.isRigged){
			rigged[1] += 1;
		}

		// Calculate real superdelegates
		var isDA = (key == 'da') ? 2 : 1;
		var rbern = Math.round(std.super * (bpdpct / 100));
		var rhill = Math.round(std.super * (hpdpct / 100));
		
		real.bern += rbern / isDA;
		real.hill += rhill / isDA;

		self.bern.real = rbern;
		self.hill.real = rhill;

		var excess = std.super - real.bern - real.hill;
		if(excess >= 0){
			if(bpdpct > hpdpct){
				real.bern += excess / isDA;
				self.bern.real += excess;
			} else {
				real.hill += excess / isDA;
				self.hill.real += excess;
			}
		}

		// Was this primary on same day
		var sameDay = (prev == std.date);
		self.prev = !sameDay;
		prev = std.date;

		self.state = states.code[key.toUpperCase()];
		self.total = std.all;
		self.uncommitted = self.total - r.bern[key].all - r.hill[key].all;

		vm.results.push(self);
	}

	var ahead = (d.bern.all > d.hill.all);
	var numb = ahead ? (d.bern.all - d.hill.all) : (d.hill.all - d.bern.all);
	var dels = 'delegate' + ((numb > 1) ? 's' : '');
	var diff = ahead ? 'ahead of Hillary Clinton by ' + numb + ' ' + dels : 'behind Hillary Clinton by ' + numb + ' ' + dels;
	var sd = ahead ? d.bern.super : d.hill.super;
	var pd = ahead ? (d.bern.all - d.bern.super - d.hill.all) : (d.hill.all - d.hill.super - d.bern.all);
	vm.fakeDiff(numb);
	vm.diff(diff);
	vm.superd(sd + ' of them are “superdelegates”, ' + pd + ' are pledged.');

	// Calculate real numbers
	var rahead = (d.bern.pledged + real.bern) > (d.hill.pledged + real.hill);
	var rnumb = rahead ? ((d.bern.pledged + real.bern) - (d.hill.pledged + real.hill)) : ((d.hill.pledged + real.hill) - (d.bern.pledged + real.bern));
	var rpledged = rnumb - (ahead ? (d.bern.pledged - d.hill.pledged) : (d.hill.pledged - d.bern.pledged));
	var rdels = 'delegate' + ((rnumb > 1) ? 's' : '');
	var rdiff = rahead ? 'ahead of Hillary Clinton by ' + rnumb + ' ' + rdels : 'behind Hillary Clinton by ' + rnumb + ' ' + rdels;
	var rsd = rahead ? real.bern : real.hill;
	var rsuperd = (ahead ? 'Sanders’' : 'Clinton’s') + ' support among “superdelegates” would’ve been ' + rsd + ', only ' + rpledged + ' more than ' + (ahead ? 'Clinton’s' : 'Sanders’') + ' support among them.';
	vm.realDel(rnumb + ' ' + rdels);
	vm.realDiff(rdiff);
	vm.realSuperd(rsuperd);

	// Calculate totals
	vm.bern([d.bern.pledged,d.bern.super,real.bern]);
	vm.hill([d.hill.pledged,d.hill.super,real.hill]);
	vm.rigged(rigged);
	vm.totals([(r.pledged + r.super),d.uncommitted]);
}

// smoothScroll // https://github.com/alicelieutier/smoothScroll
function smoothScroll(el,duration,callback,context){
	if(document.querySelectorAll === void 0 || window.pageYOffset === void 0 || history.pushState === void 0) { return; }
	
	var getTop = function(element) {
		if(element.nodeName === 'HTML') return -window.pageYOffset
		return element.getBoundingClientRect().top + window.pageYOffset;
	}

	var easeInOutCubic = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

	var position = function(start, end, elapsed, duration) {
		if (elapsed > duration) return end;
		return start + (end - start) * easeInOutCubic(elapsed / duration);
	}

	duration = duration || 500;
	context = context || window;
	var start = window.pageYOffset;

	if (typeof el === 'number') {
	  var end = parseInt(el);
	} else {
	  var end = getTop(el);
	}

	var clock = Date.now();
	var requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
		function(fn){window.setTimeout(fn, 15);};

	var step = function(){
		var elapsed = Date.now() - clock;
		if (context !== window) {
			context.scrollTop = position(start, end, elapsed, duration);
		}
		else {
			window.scroll(0, position(start, end, elapsed, duration));
		}

		if (elapsed > duration) {
			if (typeof callback === 'function') {
				callback(el);
			}
		} else {
			requestAnimationFrame(step);
		}
	}
	step();
}

function getShare(s){
	var m = media[Math.floor(Math.random() * media.length)];
	var tweet = 'The media like @' + m + ' has #superrigged the election by counting superdelegates along with pledged ones.';
	var tumblr = 'The corporate media has rigged the election by counting superdelegates explicitly. If superdelegates represented the will of people, media narrative would’ve fade away.';
	if(s == 'twitter'){
		return encodeURIComponent(tweet);
	}
	if(s == 'tumblr'){
		return encodeURIComponent(tumblr);
	}
}

// View model
var vm = {
	bern:ko.observableArray(),
	diff:ko.observable(),
	disableReal:function(){
		vm.isReal(false);
	},
	enableReal:function(){
		vm.isReal(true);
		smoothScroll(document.querySelector('.b-top'));
	},
	fakeDiff:ko.observable(),
	hill:ko.observableArray(),
	isReal:ko.observable(false),
	realDel:ko.observable(),
	realDiff:ko.observable(),
	realSuperd:ko.observable(),
	rigged:ko.observableArray(),
	results:ko.observableArray(),
	share:ko.observableArray([
		{
			cl:'twitter',
			link:'https://twitter.com/intent/tweet?url=' + encodeURIComponent(link) + '&text=' + getShare('twitter'),
			name:'Tweet'
		},
		{
			cl:'facebook',
			link:'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link),
			name:'Share on Facebook'
		},
		{
			cl:'tumblr',
			link:'https://www.tumblr.com/share/link?canonicalUrl=' + encodeURIComponent(link) + '&title=#superrigged&content=' + getShare('tumblr'),
			name:'Post on Tumblr'
		},
		{
			cl:'google',
			link:'https://plus.google.com/share?url=' + encodeURIComponent(link),
			name:'Share on Google+'
		}
	]),
	shareReal:function(){
		smoothScroll(document.querySelector('.b-bottom'));
	},
	superd:ko.observable(),
	totals:ko.observableArray()
}

ko.applyBindings(vm);

// Initialise
jsonp.load('Results of the Democratic Party presidential primaries, 2016','pledged');
jsonp.load('List of Democratic Party superdelegates, 2016','superd');