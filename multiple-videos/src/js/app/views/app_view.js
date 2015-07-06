// app dependencies
var App = require('../app');
// define module
App.module('Views', function(Views, App, Backbone, Marionette, $, _) {
    Views.App = Marionette.ItemView.extend({
        layoutRegions: [],
        template: JST['app'],
        events: {
            'click .js-youtube': 'youtubeClicked',
            'click .js-youtubeMix': 'youtubeMixClicked',
            'click .js-vlc': 'vlcClicked',
            'click .js-youtubePlayer': 'youtubePlayerClicked',
            'click .js-threeMix': 'youtubeMixThree'
        },
        onRender: function() {
            return App.Utils.renderViewAsRootEl(this);
        },
        onShow: function() {},
        youtubeClicked: function(e) {
            App.trigger('events:mode', 'youtube');
        },
        youtubeMixClicked: function(e) {
            App.trigger('events:mode', 'youtubeMix');
        },
        youtubePlayerClicked: function(e) {
            App.trigger('events:mode', 'youtubePlayer');
        },
        vlcClicked: function(e) {
            App.trigger('events:mode', 'vlc');
        },
        youtubeMixThree: function(e) {
            App.trigger('events:mode', 'youtubeThree');
        }
    });
});

// export
module.exports = App.Views;