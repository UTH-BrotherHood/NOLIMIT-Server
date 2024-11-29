import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { TaskReqBody, UpdateTaskReqBody } from '~/models/requests/tasks.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { taskService } from '~/services/task.service'

export const getTasksController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { limit, page } = req.query;
    const result = await taskService.getTasks(user_id, Number(limit) || 10, Number(page) || 1)
    return res.status(HTTP_STATUS.OK).json({
        message: 'Get tasks successfully',
        data: result
    })
}

export const createTaskController = async (req: Request<any, any, TaskReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const taskData = req.body;
    const result = await taskService.createTask(user_id, taskData)
    return res.status(HTTP_STATUS.OK).json({
        message: 'Create task successfully',
        data: result
    })
}

export const getTaskByIdController = async (req: Request<ParamsDictionary>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { task_id } = req.params
    const result = await taskService.getTaskById(user_id, task_id)
    return res.status(HTTP_STATUS.OK).json({
        message: 'Get task by id successfully',
        data: result
    })
}

export const updateTaskController = async (req: Request<ParamsDictionary, any, UpdateTaskReqBody>, res: Response) => {
    const { task_id } = req.params
    const taskData = req.body
    const result = await taskService.updateTask(task_id, taskData)
    return res.status(HTTP_STATUS.OK).json({
        message: 'Update task successfully',
        data: result
    })
}

export const deleteTaskController = async (req: Request<ParamsDictionary>, res: Response) => {
    const { task_id } = req.params
    const result = await taskService.deleteTask(task_id)
    return res.status(HTTP_STATUS.OK).json({
        message: 'Delete task successfully',
        data: result
    })
}