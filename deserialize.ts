import { } from '../../node_modules/reflect-metadata';

const deserializeKey = "whymatter:deserializeMetaData";

// Enable Logging
const deserializeLog = false;

/**
 * Use this class to deserialize
 */
class Deserialisation {
    /**
     * @param typy: Constructor of T.
     * @param json: Value to deserialize.
     */
    static d<T>(type: any, json: any): T {
        let newClass = new type();
        if (newClass._deserialize) newClass._deserialize(json)
        return newClass as T;
    }
}

interface DeserializeMetaData {
    deserialize: boolean,
    type?: any,
    arrayType?: any
}

/**
 * Decorator
 */
function deserialize(meta: DeserializeMetaData = { deserialize: true, type: undefined, arrayType: undefined }) {
    return (target: Object, targetKey: string | symbol) => {
        meta.type = meta.type || Reflect.getMetadata("design:type", target, targetKey);
        Reflect.metadata(deserializeKey, meta)(target, targetKey);
    }
}

/**
 * Decorator
 */
function deserializeAbel(target: any): any {
    target.prototype._deserialize = deserialisation;
    return target;
}

function getDeserializeMetaData(target: Object, targetKey: string | symbol) {
    return (Reflect.getMetadata(deserializeKey, target, targetKey) || {}) as DeserializeMetaData;
}

let deserialisation = function (json: any) {
    if (!json) return;

    for (let key of Object.getOwnPropertyNames(json)) {
        log("==> New property: " + key);

        let metaData = getDeserializeMetaData(this, key);
        if (!metaData.deserialize) continue;
        log("-> valid deserializeKey");

        let propertyType = metaData.type;
        let arrayType = metaData.arrayType;
        log("-> propertyType: " + propertyType);

        let getValue = (propertyType: any, jsonValue: any, metaData: DeserializeMetaData): any => {
            if (propertyType === String || propertyType === Number || propertyType === Boolean) {
                log("-> compare simple: " + typeof propertyType() + "<->" + typeof jsonValue);
                if (typeof propertyType() === typeof jsonValue)
                    return jsonValue;
            } else if (new propertyType()._deserialize) {
                log("-> _deserialize found");
                return new propertyType()._deserialize(jsonValue);
            } else if (propertyType === Array) {
                if (!arrayType) {
                    warn("-> array needs type provided");
                    return undefined;
                }

                log("-> array found, type provided: ", metaData.type);
                log("-> jsonValue, %o", jsonValue);
                return jsonValue.map((x: any) => getValue(arrayType, x, { deserialize: true }));
            } else if (propertyType === Object) {
                warn("-> json property cannot deserialized: %o", Object.getOwnPropertyNames(jsonValue));
            } else {
                warn("-> unknown property");
            }

            return undefined;
        }

        this[key] = getValue(propertyType, json[key], metaData);
    }

    return this;
}

/* Logging */

function log(message?: any, ...optionalParams: any[]): void {
    if (deserializeLog)
        console.log(message, ...optionalParams);
}

function warn(message?: any, ...optionalParams: any[]): void {
    if (deserializeLog)
        console.warn(message, ...optionalParams);
}

/* Exports */

export { deserializeAbel, deserialize, Deserialisation };