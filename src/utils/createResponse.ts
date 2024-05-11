import { ResponseBody } from 'src/entities/framework/ResponseBody';

function deepConvertBigIntToNumber(obj) {
    if (typeof obj !== 'object' || obj === null) {
        // If the input is not an object or is null, return it as is
        return obj;
    }

    // Iterate through all properties of the object
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (typeof obj[key] === 'bigint') {
                // Convert BigInt to number
                obj[key] = Number(obj[key]);
            } else if (typeof obj[key] === 'object') {
                // Recursively call the function for nested objects
                obj[key] = deepConvertBigIntToNumber(obj[key]);
            }
        }
    }

    return obj;
}

export const createResponseBody = (data: unknown): ResponseBody => ({
    data: deepConvertBigIntToNumber(data),
    result: true,
    errors: [],
});
