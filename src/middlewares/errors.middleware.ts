import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { omit } from 'lodash';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/utils/errors';

// Định nghĩa rõ kiểu là ErrorRequestHandler
export const defaultErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, 'status'));
    return;
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true });
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, 'stack'),
  });
  return;
};
