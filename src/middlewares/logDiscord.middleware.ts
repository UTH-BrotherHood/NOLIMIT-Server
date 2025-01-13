import Logger from '../loggers/discord.log'
import { Request, Response, NextFunction } from 'express'

export const pushToLogDiscord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    Logger.sendToFormatCode({
      code: { host: req.get('host') },
      message: `this is:: ${req.get('host')}`
    })
    Logger.sendToFormatCode({
      title: `Method: ${req.method}`,
      code: req.method === 'GET' ? req.query : req.body,
      message: `${req.get('host')}${req.originalUrl}`
    })
    next()
  } catch (error) {
    next(error)
  }
}
