import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ResponseBody } from 'src/entities/framework/ResponseBody';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        console.error(exception);
        const errors: ResponseBody['errors'] =
            exception instanceof HttpException
                ? [{ statusCode: httpStatus as HttpStatus, message: exception.message }]
                : [
                      {
                          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                          message: 'Internal server error',
                      },
                  ];

        const responseBody: ResponseBody = {
            errors,
            result: false,
            data: null,
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
