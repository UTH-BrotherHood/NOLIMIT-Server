import { Router } from 'express'
import { createTaskController, deleteTaskController, getTaskByIdController, getTasksController, updateTaskController } from '~/controllers/task.controller'
import { checkUserTasks, createTaskValidation, updateTaskValidation, verifyOwnerTask, verifyUserTaskAccess } from '~/middlewares/tasks.middlewares'
import { accessTokenValidation } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const tasksRouter = Router()

/*
Description: This route is used to get all tasks of the user
Path: /task/
Method: GET
*/
tasksRouter.get('/', accessTokenValidation, wrapRequestHandler(checkUserTasks), wrapRequestHandler(getTasksController))

/*
Description: This route is used to create a new task
Path: /task
Method: POST
*/
tasksRouter.post('/', accessTokenValidation, createTaskValidation, wrapRequestHandler(createTaskController))

/*
Description: This route is used to get a task by id
Path: /task/:task_id
Method: GET
*/
tasksRouter.get('/:task_id', accessTokenValidation, wrapRequestHandler(verifyUserTaskAccess), wrapRequestHandler(getTaskByIdController))

/*
Description: This route is used to update a task by id
Path: /task/:task_id
Method: PUT
Middleware: verifyUserTaskAccess
*/
tasksRouter.put('/:task_id', accessTokenValidation, updateTaskValidation, wrapRequestHandler(verifyUserTaskAccess), wrapRequestHandler(updateTaskController))

/*
Description: This route is used to delete a task
Path: /task
Method: DELETE
Body: { task_id: String }
Middleware: verify
*/
tasksRouter.delete('/:task_id', accessTokenValidation, wrapRequestHandler(verifyOwnerTask), wrapRequestHandler(deleteTaskController))

// /*
// Description: This route is used to get all tasks of a group
// Path: /task/group/:group_id
// Method: GET
// */
// tasksRouter.get('/group/:group_id', accessTokenValidation, wrapRequestHandler(getTasksByGroupController))

// /*
// Description: This route is used to get all tasks of a project
// Path: /task/project/:project_id
// Method: GET
// */
// tasksRouter.get('/project/:project_id', accessTokenValidation, wrapRequestHandler(getTasksByProjectController))
export default tasksRouter
