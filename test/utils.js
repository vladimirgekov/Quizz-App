const API_URL = 'https://jsonmock.hackerrank.com';
const {By, until} = require('selenium-webdriver');
const axios = require('axios');

const IDMAP = {
    PRE_QUIZ_VIEW: 'pre-quiz',
    LOADER_VIEW: 'loader-view',
    QUIZ_VIEW: 'quiz',
    GET_STARTED_BUTTON: 'get-started-button',
    QUESTION: 'question',
    OPTIONS_CONTAINER: 'options-container',
    SUBMIT_BUTTON: 'submit-button',
    CURRENT_QUESTION_IP: 'current-question-id'
};

const getElementById = (driver, id) => {
    return driver.findElement(By.id(id))
};

const getElementsByClassName = (driver, className) => {
    return driver.findElements(By.className(className))
};

const elementHasClass = async (element, className) => {
    const classString = await element.getAttribute("class");
    return classString.split(" ").includes(className)
};

const fetchQuestionById = (id) => {
    return new Promise(((resolve, reject) => {
        axios(`${API_URL}/api/questions/${id}`)
            .then(response => {
                resolve(response.data.data)
            })
            .catch(reject);
    }))
};

const clickElement = (node) => {
    try {
        return node.click();
    } catch (e) {
        if (e.name === 'StaleElementReferenceError') {
            return clickElement(node);
        }
        throw e;
    }
};

const setupQuestion = async (driver) => {
    let getStartedButton = await getElementById(driver, IDMAP.GET_STARTED_BUTTON);
    await getStartedButton.click();

    const hiddenIP = await getElementById(driver, IDMAP.CURRENT_QUESTION_IP);
    const id = await hiddenIP.getAttribute('value');
    let questionData;

    try {
        questionData = await fetchQuestionById(parseInt(id));
    } catch (e) {
        console.log("utils.js", "setupQuestion", e);
    }

    let quizView = await getElementById(driver, IDMAP.QUIZ_VIEW);
    await driver.wait(until.elementIsVisible(quizView));

    return {questionData};
};


module.exports = {
    getElementById,
    getElementsByClassName,
    fetchQuestionById,
    setupQuestion,
    IDMAP,
    elementHasClass,
    clickElement
};
