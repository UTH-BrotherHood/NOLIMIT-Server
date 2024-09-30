import { Request, Response, NextFunction, RequestHandler } from 'express'

// export const wrapRequestHandler = <P>(fn: RequestHandler<P, any, any, any>) => {
//   return async (req: Request<P>, res: Response, next: NextFunction) => {
//     try {
//       fn(req, res, next)
//     } catch (error) {
//       next(error)
//     }
//   }
// }

export const wrapRequestHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Error caught in wrapRequestHandler:', err)
      next(err)
    })
  }
}
