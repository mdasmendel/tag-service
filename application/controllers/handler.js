/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    tagDB = require('../database/tagDatabase'), //Database functions specific for tags
    co = require('../common');
const async = require('async');

module.exports = {
    // get a tag by tag-name
    getTag: function(request, reply) {
        tagDB.get(request.params.tagName).then((tag) => {
            if (co.isEmpty(tag)){
                reply(boom.notFound());
            }
            else{
                reply(co.rewriteID(tag));
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // create a new tag
    newTag: function(request, reply) {
        let newTag = request.payload;

        // if tag has property tagName, then return the stored tag
        if(newTag.hasOwnProperty('tagName')){
            tagDB.get(newTag.tagName).then ( (existingTag) => {
                if(!co.isEmpty(existingTag)){
                    return reply(co.rewriteID(existingTag));
                } else {
                    tagDB.newTag(newTag).then( (inserted) => {
                        reply(co.rewriteID(inserted));
                    }).catch( (err) => {
                        request.log('error', err);
                        reply(boom.badImplementation());
                    });
                }
            }).catch( (error) => {
                request.log('error', error);
                reply(boom.badImplementation());
            });
        } else {
            tagDB.newTag(newTag).then( (inserted) => {
                reply(co.rewriteID(inserted));
            }).catch( (err) => {
                request.log('error', err);
                reply(boom.badImplementation());
            });
        }
    },

    // replace an existing tag
    replaceTag: function(request, reply) {
        tagDB.replace(request.params.tagName, request.payload).then((replaced) => {
            if (co.isEmpty(replaced.value)){
                reply(boom.notFound());
            }
            else{
                reply(co.rewriteID(replaced.value));
            }
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },

    // bulk upload tags
    bulkUpload: function(request, reply){
        let newTags = request.payload.tags.map( (t) => {
            t.user = request.payload.user;
            return t;
        });

        let tagsInserted = [];

        async.eachSeries(newTags, (newTag, callback) => {

            // if tag has property tagName, then return the stored tag
            if(newTag.hasOwnProperty('tagName')){
                tagDB.get(newTag.tagName).then ( (existingTag) => {
                    if(!co.isEmpty(existingTag)){
                        tagsInserted.push(co.rewriteID(existingTag));
                        callback();
                    } else {
                        tagDB.newTag(newTag).then( (inserted) => {
                            tagsInserted.push(co.rewriteID(inserted));
                            callback();
                        }).catch( (err) => {
                            callback(err);
                        });
                    }
                }).catch( (err) => {
                    callback(err);
                });
            } else {
                tagDB.newTag(newTag).then( (inserted) => {
                    tagsInserted.push(co.rewriteID(inserted));
                    callback();
                }).catch( (err) => {
                    callback(err);
                });
            }
        }, () => {
            reply(tagsInserted);
        });
    },

    // suggest tags for aucomplete
    suggest: function(request, reply) {
        tagDB.suggest(request.params.q, request.query.limit).then((results) => {
            reply(results);
        }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
        });
    },
};
