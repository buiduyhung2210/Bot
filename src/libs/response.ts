import { ValidationError } from 'sequelize';
import { Response } from 'express';

export const sendSuccess = (res: Response, data: { [key: string]: any }, message: string = '') => {
  res.status(200).json({ message, data });
};

export const sendError = (res: Response, code: number, error: any, errorSubject: Error = undefined) => {
  if (errorSubject) console.log(errorSubject);
  if (errorSubject instanceof ValidationError) {
    return res.status(422).json({ error:'error' });
  };
  res.status(code).json({ error });
};
