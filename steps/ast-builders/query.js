'use strict';

var b = require('ast-types').builders;
var buildResolver = require('./resolver');
var typeMap = {
    'string': 'GraphQLString',
    'integer': 'GraphQLInt',
    'float': 'GraphQLFloat'
};

module.exports = function buildQuery(type, data) {
    var model = data.models[type.name];
    var primaryKey = getPrimaryKey(model) || {};
    var keyName = primaryKey.name;
    var keyType = typeMap[primaryKey.type];

    return b.objectExpression([
        b.property('init', b.identifier('type'), b.identifier(type.varName)),
        b.property(
            'init',
            b.identifier('resolve'),
            buildResolver(type, data)
        ),
        b.property('init', b.identifier('args'), b.objectExpression(keyName ? [
            b.property('init', b.identifier('id'), b.objectExpression([
                b.property('init', b.identifier('name'), b.literal(keyName)),
                b.property('init', b.identifier('type'), b.newExpression(
                    b.identifier('GraphQLNonNull'),
                    [b.identifier(keyType)]
                ))
            ]))
        ] : []))
    ]);
};

function getPrimaryKey(model) {
    for (var key in model.fields) {
        if (model.fields[key].isPrimaryKey) {
            return model.fields[key];
        }
    }

    return false;
}
