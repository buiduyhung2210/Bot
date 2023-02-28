import { sendError, sendSuccess } from '@libs/response';
import { Request, Response } from 'express';
import settings from '@configs/settings';
import UserModel from '@models/users';
import { FileNotAccepted, NoData } from '@libs/errors';

class UserController {
  public async exampleAPI (req: Request, res: Response) {
    try {
      const scopes: any = [
        'withDepartmentName',
        'withPositionName',
      ];
      const user = await UserModel.scope(scopes).findByPk(req.params.userId);
      if (!user) { return sendError(res, 404, NoData); }
      sendSuccess(res, user);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new UserController();
