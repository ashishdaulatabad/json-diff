import { Type } from "../models/interface";

export default {
    /**
     * @description Returns the type of the value passed to this function
     */
    type: function (value: any): string {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';

        switch (value.constructor) {
            case Array:
                return 'array';
            case Number:
                return 'number';
            case Boolean:
                return 'bool';
            case String:
                return 'string';
            default:
                return 'object';
        }
    },

    /**
     * @description Returns the type of the value passed to this function
     */
    ftype: function (value: any): Type {
        if (value === null) return Type.Null;
        if (value === undefined) return Type.Undefined;

        switch (value.constructor) {
            case Array:
                return Type.Array;
            case Number:
                return Type.Number;
            case Boolean:
                return Type.Boolean;
            case String:
                return Type.String;
            default:
                return Type.Object;
        }
    },


    eqType(first: any, second: any): boolean {
        return first === second || first.constructor === second.constructor;
    },

    /**
     * @description Check whether given value is iterable or not
     */
    isIterable: function (value: any): boolean {
        if (value === null || value === undefined) return false;

        switch (value.constructor) {
            case Number:
            case String:
            case Boolean:
                return false;

            default:
                return true;
        }
    },

    fIsIterable: function (value: any): boolean {
        const type = this.ftype(value);
        return this.typeIsIterable(type);
    },

    typeIsIterable: (type: Type): boolean => (type >= 5),
};
