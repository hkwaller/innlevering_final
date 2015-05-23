var db = require('../../db.js')

var expect = require('chai').expect

describe('register and login', function() {
    it('registers a user and then logs in', function() {
        browser.get('http://localhost:3001')
        element(by.model('user.username')).sendKeys('test')
        element(by.model('user.password')).sendKeys('test')
        element(by.id('signup')).click()
        
        element(by.model('user.username')).sendKeys('test')
        element(by.model('user.password')).sendKeys('test')
        element(by.id('login')).click()
        
        browser.waitForAngular().then(function() {
            expect(element(by.id("current-user")).getText()).to.contain("test")
        })
    })
    afterEach(function() {
        db.connection.db.dropDatabase()
    })
})

