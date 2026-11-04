import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// El sub de quien hace la petición sale SIEMPRE del token verificado, nunca del body.
export const TokenSub = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string =>
    ctx.switchToHttp().getRequest().user.sub as string,
);