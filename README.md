# sg-scraper
#### A node command line app for downloading albums from [suicidegirls.com](http://suicidegirls.com).

## ⚠️ Attention
Unfortunately some time since publishing this project [suicidegirls.com](http://suicidegirls.com) decided to implement protection against bots using Google's reCAPTCHA, effectively breaking this scraper. From my initial investigation there seems like potential ways around the issue but unfortunately none that I can dedicate time to implementing. That said, I will gladly accept a pull request from anyone up to the challenge!

<img src="https://raw.githubusercontent.com/codeandcats/sg-scraper/master/logo.png" />

## 1. Install
```
npm install sg-scraper -g
```

## 2. Setup
```
sg-scraper config -u <user-name> -p <password> -d <destination-path>
```
E.g.
```
sg-scraper config -u ash.ketchum -p GottaCatchEm4ll -d d:\pics\sg\
```

## 3. Run
```
sg-scraper scrape [album-url]
```
E.g.
```
sg-scraper scrape https://www.suicidegirls.com/girls/fishball/album/2303471/gotta-catchem-all/
```
Or don't specify an album url and it will use the url in the clipboard if there is one.  
