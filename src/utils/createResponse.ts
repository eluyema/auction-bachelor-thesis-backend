import { ResponseBody } from 'src/entities/framework/ResponseBody';

export const createResponseBody = (data: unknown): ResponseBody => ({
    data,
    result: true,
    errors: [],
});
