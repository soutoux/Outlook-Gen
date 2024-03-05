const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const faker = require('faker');
const fs = require('fs');
const config = require('./files/config.json');

async function start() {
    try {
        puppeteer.use(StealthPlugin());

        const launchOptions = {
            headless: config.headless,
            executablePath: config.chromeExecutablePath,
            userDataDir: config.userDataDir,
            args: [`--window-size=${config.windowWidth},${config.windowHeight}`],
            defaultViewport: { width: config.windowWidth, height: config.windowHeight }
        };

        if (config.useProxy && config.proxies.length > 0) {
            launchOptions.args.push(`--proxy-server=${config.proxies[Math.floor(Math.random() * config.proxies.length)]}`);
        }

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.emulateTimezone(config.timezone);
        await page.setDefaultTimeout(config.timeout);

        await page.goto("https://outlook.live.com/owa/?nlp=1&signup=1");
        await page.waitForSelector('[name="MemberName"]');

        const randomFirstName = faker.name.firstName();
        const randomLastName = faker.name.lastName();
        const fullName = randomFirstName + randomLastName + Math.floor(Math.random() * 9999);

        await page.type('input[name="MemberName"]', fullName);
        await page.keyboard.press('Enter');

        const randomPassword = faker.internet.password();

        await page.waitForSelector('#Password');
        await page.type('input[name="Password"]', `${randomPassword}!`);
        await page.keyboard.press('Enter');

        await page.waitForSelector('#FirstName');
        await page.type('input[name="FirstName"]', randomFirstName);
        await page.type('input[name="LastName"]', randomLastName);
        await page.keyboard.press('Enter');

        await page.waitForSelector('#BirthMonth');
        await page.waitForSelector('#BirthDay');

        const randomBirthMonth = Math.floor(Math.random() * 12) + 1;
        const randomBirthDay = Math.floor(Math.random() * 28) + 1;
        const randomBirthYear = Math.floor(Math.random() * 30) + 1990;

        await page.select('#BirthMonth', randomBirthMonth.toString());
        await page.select('#BirthDay', randomBirthDay.toString());
        await page.type('#BirthYear', randomBirthYear.toString());
        await page.keyboard.press('Enter');

        const account = `${fullName}@outlook.com:${randomPassword}!`;
        console.log(account);
        fs.appendFileSync('files/accounts.json', `\n${account}`);

        await page.waitForNavigation();
        // await browser.close();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

start();