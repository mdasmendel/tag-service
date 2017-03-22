/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
    handlers = require('./controllers/handler');

const apiModels = {};
apiModels.tag = Joi.object().keys({
    tagName: Joi.string(),
    name: Joi.string(),
    kind: Joi.string().valid('tag', 'NLP', 'annotation'),
    uri: Joi.string(),
    userId: Joi.number().integer(),
}).requiredKeys('tagName', 'kind');

module.exports = function(server) {

    // get a tag by tag-name
    server.route({
        method: 'GET',
        path: '/tag/{tagName}',
        handler: handlers.getTag,
        config: {
            validate: {
                params: {
                    tagName: Joi.string(),
                },
            },
            tags: ['api'],
            description: 'Get a tag by tag-name'
        }
    });

    // create a new tag if not existing else return the existing one
    server.route({
        method: 'POST',
        path: '/tag/new',
        handler: handlers.newTag,
        config: {
            validate: {
                payload: apiModels.tag
            },
            tags: ['api'],
            description: 'Create a new tag'
        }
    });

    // update an existing tag with a new one
    server.route({
        method: 'PUT',
        path: '/tag/{tagName}',
        handler: handlers.replaceTag,
        config: {
            validate: {
                params: {
                    tagName: Joi.string(),
                },
                payload: apiModels.tag
            },
            tags: ['api'],
            description: 'Replace a tag'
        }
    });


    // bulk upload tags
    server.route({
        method: 'POST',
        path: '/tag/upload',
        handler: handlers.bulkUpload,
        config: {
            validate: {
                payload: Joi.array().items(apiModels.tag)
            },
            tags: ['api'],
            description: 'Bulk upload tags'
        }
    });
};
