import _ from 'lodash';
/**
 * Created by markdean on 2/7/17.
 */
import * as Constants from './constants';


export function debugLogger() {
    if (Constants.PREDICTA_DEBUG) {
        return window.console && console.info &&
            Function.apply.call(console.info, console, arguments);
    }
}

debugLogger('Debug logging is enabled');


export function sortIgnoreCase(array) {
// DEBUG
    if (array && (array !== undefined)) {
        array = _.orderBy(array, [item => {
            if (item) {
                try {
                    return item.toLowerCase();
                } catch (e) {
                    console.log('sortIgnoreCase', e.message, item);
                }

                return undefined;

            } else {
                console.log('undefined');
                //return null;
                return undefined;
            }
        }
        ], ['asc']);
    }

    /*
     * [Predicta/hub-mvp] Login hangs if current category is folding knives, uncaught at d
     * TypeError: Cannot read property 'toLowerCase' of undefined (#144)
     */
    return array || [];

}

//capitalize_Words
export function capitalize(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export function invert(dict) {
    const items = Object.keys(dict);
    let keys = [];

    if (items.length) {
        keys = Object.keys(dict[items[0]]);
    }

    const inverted = {};
    _.each(keys, function (key) {
        inverted[key] = {};
        _.each(items, function (item) {
            inverted[key][item] = dict[item][key];
        });
    });
    return inverted;
}

export function diff(obj1, obj2) {

    const allkeys = _.union(_.keys(obj1), _.keys(obj2));

    // noinspection UnnecessaryLocalVariableJS
    const difference = _.reduce(allkeys, function (result, key) {
        if (!_.isEqual(obj1[key], obj2[key])) {
            // Utils.debugLogger (key + ': not equal', obj1[key], obj2[key]);
            result[key] = {props: obj1[key], nextProps: obj2[key]};
        }
        return result;
    }, {});

    return difference;
}

export function intrinsicIdToName(id) {

    let state = window.store.getState();
    // noinspection UnnecessaryLocalVariableJS
    let name = state.category.categoryData.intrinsics.allIntrinsicsMap[id];

    return name;
}

export function intrinsicNameToId(name) {

    let state = window.store.getState();
    // noinspection UnnecessaryLocalVariableJS
    let id = state.category.categoryData.intrinsics.allIntrinsicsMapInverted[name];

    return id;
}