import { Error, ValidationErrorItem } from 'sequelize';

class CustomError extends Error {
  public path: string
  constructor (message: string, path?: string) {
    super(message);
    this.path = path;
  }
}

export const FailValidation = (errors: ValidationErrorItem[]) => {
  const messages: any = {};
  errors.forEach((error) => {
    const path = (error.original as CustomError)?.path || error.path;
    const message = (error.original as CustomError)?.message || error.message;
    messages[path] ||= [];
    messages[path].push(message);
  });
  return {
    code: 120,
    messages,
  };
};

export const NoData = {
  code: 8,
  message: 'No data available',
};

export const InternalError = {
  code: 131,
  message: 'Internal error',
};

export const BadAuthentication = {
  code: 215,
  message: 'Bad authentication data',
};

export const MemberNotFound = {
  code: 301,
  message: 'Entered member code is invalid',
};

export const NoAccessPermission = {
  code: 305,
  message: 'You do not have permission to access this page',
};

export const FileNotAccepted = {
  code: 325,
  message: 'Type of file is not allowed',
};

export const AssetbeingUsed = {
  code: 335,
  message: 'Include at least one asset being used',
};
