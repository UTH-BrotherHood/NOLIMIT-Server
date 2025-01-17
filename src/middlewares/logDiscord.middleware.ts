import { Request, Response, NextFunction } from 'express'
import { discordLogger } from '../loggers/discord.log'
import { v4 as uuidv4 } from 'uuid';

export const pushToLogDiscord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId;

    await discordLogger.sendToFormatCode({
      title: `Request Method: ${req.method}`,
      context: `Request ID: ${requestId}`,
      code: {
        data: req.method === 'GET' ? req.query : req.body,
        url: req.originalUrl,
        headers: req.headers,
        ip: req.ip
      },
      message: `${req.method} ${req.get('host')}${req.originalUrl}`
    })

    next()
  } catch (error) {
    console.error('Error in Discord logging middleware:', error)
    next()
  }
}