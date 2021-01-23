require('chromedriver');
require('../app');
const chai = require('chai');
const expect = chai.expect;
const Promise = require("bluebird");
const {Builder, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options().addArguments(
    'headless'
);
const {
    IDMAP,
    getElementById,
    getElementsByClassName,
    fetchQuestionById,
    setupQuestion,
    elementHasClass,
    clickElement
} = require('./utils');
let driver;


describe('quiz app test', function () {
    this.timeout(10000);

    before(function (done) {
        driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        driver.get('http://localhost:8001')
            .then(() => {
                done();
            });
    });

    after(function () {
        driver.quit();
    });


    beforeEach(async function () {
        driver.navigate().refresh();
    });

    it('Should render the pre quiz view on the screen initially', async function () {
        let preQuizView = await getElementById(driver, IDMAP.PRE_QUIZ_VIEW);
        expect(await preQuizView.isDisplayed()).to.be.true;
        let quizView = await getElementById(driver, IDMAP.QUIZ_VIEW);
        expect(await quizView.isDisplayed()).to.be.false;
        let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
        expect(await loaderView.isDisplayed()).to.be.false;
    });

    it('Should should show the loader on clicking Start Quiz Button', async function () {
        let getStartedButton = await getElementById(driver, IDMAP.GET_STARTED_BUTTON);
        await clickElement(getStartedButton);
        let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
        expect(await loaderView.isDisplayed()).to.be.true;
        let preQuizView = await getElementById(driver, IDMAP.PRE_QUIZ_VIEW);
        expect(await preQuizView.isDisplayed()).to.be.false;
        let quizView = await getElementById(driver, IDMAP.QUIZ_VIEW);
        expect(await quizView.isDisplayed()).to.be.false;
    });


    it('Should render the question on the screen', async function () {
        let getStartedButton = await getElementById(driver, IDMAP.GET_STARTED_BUTTON);
        await clickElement(getStartedButton);

        let preQuizView = await getElementById(driver, IDMAP.PRE_QUIZ_VIEW);
        expect(await preQuizView.isDisplayed()).to.be.false;

        let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
        expect(await loaderView.isDisplayed()).to.be.true;

        const hiddenIP = await getElementById(driver, IDMAP.CURRENT_QUESTION_IP);
        const id = await hiddenIP.getAttribute('value');
        const questionData = await fetchQuestionById(parseInt(id));

        let quizView = await getElementById(driver, IDMAP.QUIZ_VIEW);
        await driver.wait(until.elementIsVisible(quizView));
        expect(await quizView.isDisplayed()).to.be.true;

        let questionElem = await getElementById(driver, IDMAP.QUESTION);
        expect(await questionElem.isDisplayed()).to.be.true;
        expect(questionData.question).to.eql(await questionElem.getText())

    });

    it('Should render the options for the question on the screen', async function () {
        const {questionData} = await setupQuestion(driver);

        let optionsContainerElem = await getElementById(driver, IDMAP.OPTIONS_CONTAINER);
        expect(await optionsContainerElem.isDisplayed()).to.be.true;

        let options = await getElementsByClassName(driver, 'option');
        expect(options).to.be.not.undefined;
        expect(options.length).to.eq(4);
        await Promise.map(options, async (optionElem, i) => {
            expect(await optionElem.getText()).to.eql(questionData.options[i])
        })
    });

    it('Should allow the user to select an option', async function () {
        await setupQuestion(driver);

        let optionsContainerElem = await getElementById(driver, IDMAP.OPTIONS_CONTAINER);
        expect(await optionsContainerElem.isDisplayed()).to.be.true;

        let submitBtn = await getElementById(driver, IDMAP.SUBMIT_BUTTON);
        expect(await submitBtn.isDisplayed()).to.be.true;
        expect(await submitBtn.getAttribute('disabled')).to.eql('true');

        let options = await getElementsByClassName(driver, 'option');
        await clickElement(options[1]);

        expect(await submitBtn.getAttribute('disabled')).to.eql(null);
        expect(await elementHasClass(options[1], 'user-answer')).to.be.true;
    });

    it('Should validate answer if the user answer is correct ', async function () {
        const {questionData} = await setupQuestion(driver);

        let submitBtn = await getElementById(driver, IDMAP.SUBMIT_BUTTON);
        let options = await getElementsByClassName(driver, 'option');
        await clickElement(options[questionData.answer]);
        await clickElement(submitBtn);
        expect(await elementHasClass(options[questionData.answer], 'user-answer')).to.be.true;
        expect(await elementHasClass(options[questionData.answer], 'correct-answer')).to.be.true;
    });

    it('Should validate answer if the user answer is incorrect ', async function () {
        const {questionData} = await setupQuestion(driver);

        let submitBtn = await getElementById(driver, IDMAP.SUBMIT_BUTTON);
        let options = await getElementsByClassName(driver, 'option');
        const answerIndex = questionData.answer ? 0 : 1;
        await clickElement(options[answerIndex]);
        await clickElement(submitBtn);
        expect(await elementHasClass(options[answerIndex], 'user-answer')).to.be.true;
        expect(await elementHasClass(options[answerIndex], 'wrong-answer')).to.be.true;
        expect(await elementHasClass(options[questionData.answer], 'correct-answer')).to.be.true;
    });
});
