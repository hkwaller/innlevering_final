var db = require('../../db.js')

var expect = require('chai').expect

describe('login, logout, login', function() {
    it('logins in as one user, then logs out, then logs in as another user', function() {
        
        browser.get('http://localhost:3001')
        
        element(by.id('logout')).click()
        
        element(by.model('user.username')).sendKeys('test')
        element(by.model('user.password')).sendKeys('test')
        element(by.id('signup')).click()        
        
        element(by.model('user.username')).sendKeys('test2')
        element(by.model('user.password')).sendKeys('test2')
        element(by.id('signup')).click()
        
        element(by.model('user.username')).sendKeys('test')
        element(by.model('user.password')).sendKeys('test')
        element(by.id('login')).click()
        
        element(by.id('logout')).click().then(function() {
            element(by.model('user.username')).sendKeys('test2')
            element(by.model('user.password')).sendKeys('test2')
            element(by.id('login')).click()

            var name = "test2"

            browser.waitForAngular().then(function() {
                element.all(by.model('currentUser')).getText().then(function(username) {
                    expect(username).to.contain(name)
                })
            })
        })
        
        
    })
    afterEach(function() {
        db.connection.db.dropDatabase()
    })
})

