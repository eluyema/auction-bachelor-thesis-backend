import { HttpStatus } from '@nestjs/common';

export interface ResponseBody {
    data: unknown;
    result: boolean;
    errors: { statusCode: HttpStatus; message: string }[];
}
