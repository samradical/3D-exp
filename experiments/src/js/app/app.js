// vendor dependencies
var Marionette = require('marionette');

// constructor
var App = new Marionette.Application();

App.addInitializer(function() {

    // app dependencies in correct order

    // commons
    require('fastclick');

    require('./common/composer_factory');
    require('./common/composer_manager');


    require('./regions/app_regions');

    require('./views/app_view');
    require('./views/shaders_view');
    require('./views/composer_view');
    require('./views/effect_composer_view');
    require('./views/gradient_view');
    require('./controllers/app_controller');
});

// export
module.exports = App;