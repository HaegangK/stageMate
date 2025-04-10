import { Request, Response, NextFunction } from 'express';

class CustomError extends Error {
  public status: number;
  public name: string;

  constructor(name: string, status: number, message: string) {
    super(message);
    this.name = name;
    this.status = status;
  }
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${err.name || 'UnknownError'}] ${err.message || '알 수 없는 오류가 발생했습니다.'}`);

  const status = err.status || 500;
  const message = status >= 500 ? 'Internal Server Error' : (err.message || '알 수 없는 오류가 발생했습니다.');

  res.status(status).json({
    error: {
      name: err.name || 'UnknownError',
      message,
    },
  });
};

const notFoundHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${err.name || 'NotFound'}] ${err.message || '요청한 리소스를 찾을 수 없습니다.'}`);

  const status = err.status || 404;
  const message = err.message || '요청한 리소스를 찾을 수 없습니다.';

  res.status(status).json({
    error: {
      name: err.name || 'NotFound',
      message,
    },
  });
};

export { CustomError, errorHandler, notFoundHandler };
