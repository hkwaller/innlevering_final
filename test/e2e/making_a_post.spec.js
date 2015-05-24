var db = require('../../db.js')

var expect = require('chai').expect

describe('making a post', function() {
    it('logs in and creates a new post', function() {
        browser.get('http://localhost:3001')
        
//        element(by.model('user.username')).sendKeys('test')
//        element(by.model('user.password')).sendKeys('test')
//        element(by.id('login')).click()
        element(by.id('write-post')).click()
        
        browser.waitForAngular().then(function() {
            var post = {
                title: "test",
                text: "test"
            }

            element(by.model('post')).sendKeys(post)
            
            element(by.id('submit-post')).click()
            element(by.id('posts')).click()

            element.all(by.css('headz').getText().then(function(text) {
                expect.text.to.contain(post.title)
            }))
        })
        
    })
    afterEach(function() {
        db.connection.db.dropDatabase()
    })
})

