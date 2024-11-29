import { checkSchema } from "express-validator";
import { TokenPayload } from "~/models/requests/users.requests";
import { validate } from "~/utils/validation.utils";
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import databaseServices from "~/services/database.service";
import { ErrorWithStatus } from "~/utils/errors";
import HTTP_STATUS from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/messages";

export const checkUserTasks = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload;

    const taskExists = await databaseServices.taskAssignments.findOne({
        user_id: new ObjectId(user_id),
    });

    if (!taskExists) {
        throw new ErrorWithStatus({
            message: 'No tasks found for this user',
            status: HTTP_STATUS.NOT_FOUND
        })
    }

    next();

}

export const createTaskValidation = validate(
    checkSchema({
        task_name: {
            isString: {
                errorMessage: 'Task name must be a string',
            },
            notEmpty: {
                errorMessage: 'Task name is required',
            },
        },
        description: {
            isString: {
                errorMessage: 'Description must be a string',
            },
            optional: true,
        },
        status: {
            isString: {
                errorMessage: 'Status must be a string',
            },
            isIn: {
                options: [['Planning', 'In Progress', 'Completed']],
                errorMessage: 'Status must be one of "Planning", "In Progress", or "Completed"',
            },
        },
        start_date: {
            isDate: {
                errorMessage: 'Start date must be a valid date',
            },
            optional: true,
        },
        due_date: {
            isDate: {
                errorMessage: 'Due date must be a valid date',
            },
            notEmpty: {
                errorMessage: 'Due date is required',
            },
        },
        start_time: {
            isString: {
                errorMessage: 'Start time must be a string in HH:mm format',
            },
            matches: {
                options: [/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/],
                errorMessage: 'Start time must be in HH:mm format',
            },
        },
        end_time: {
            isString: {
                errorMessage: 'End time must be a string in HH:mm format',
            },
            matches: {
                options: [/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/],
                errorMessage: 'End time must be in HH:mm format',
            },
        },
        priority: {
            isString: {
                errorMessage: 'Priority must be a string',
            },
            isIn: {
                options: [['Low', 'Medium', 'High', 'Urgent']],
                errorMessage: 'Priority must be one of Low, Medium, High, Urgent',
            },
            optional: true,
        },
        assignees: {
            isArray: {
                errorMessage: 'Assignees must be an array',
            },
            custom: {
                options: (value) => value.every((id: any) => typeof id === 'string'),
                errorMessage: 'Each user_id must be a string',
            },
            notEmpty: {
                errorMessage: 'Assignees are required',
            }
        },
        'assignees.*': {
            isString: {
                errorMessage: 'Assignee must be a valid string',
            },
            notEmpty: {
                errorMessage: 'Assignee is required',
            },
        },
    },
        ['body']

    )
);

export const updateTaskValidation = validate(
    checkSchema(
        {
            task_name: {
                isString: {
                    errorMessage: 'Task name must be a string'
                },
                notEmpty: {
                    errorMessage: 'Task name is required'
                }
            },
            description: {
                isString: {
                    errorMessage: 'Description must be a string'
                },
                optional: true
            },
            status: {
                isString: {
                    errorMessage: 'Status must be a string'
                },
                isIn: {
                    options: [['Planning', 'In Progress', 'Completed']],
                    errorMessage: 'Status must be one of "Planning", "In Progress", or "Completed'
                }
            },
            start_date: {
                isDate: {
                    errorMessage: 'Start date must be a valid date'
                },
                optional: true
            },
            due_date: {
                isDate: {
                    errorMessage: 'Due date must be a valid date'
                },
                notEmpty: {
                    errorMessage: 'Due date is required'
                }
            },
            start_time: {
                isString: {
                    errorMessage: 'Start time must be a string in HH:mm format',
                },
                matches: {
                    options: [/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/],
                    errorMessage: 'Start time must be in HH:mm format',
                },
            },
            end_time: {
                isString: {
                    errorMessage: 'End time must be a string in HH:mm format',
                },
                matches: {
                    options: [/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/],
                    errorMessage: 'End time must be in HH:mm format',
                },
            },
            priority: {
                isString: {
                    errorMessage: 'Priority must be a string'
                },
                isIn: {
                    options: [['Low', 'Medium', 'High']],
                    errorMessage: 'Priority must be one of "Low", "Medium", or "High'
                }
            },
            assignees: {
                isArray: {
                    errorMessage: 'Assignees must be an array'
                },
                custom: {
                    options: async (value: string[], { req }) => {
                        const users = await databaseServices.users.find({
                            _id: { $in: value.map((id) => new ObjectId(id)) }
                        }).toArray()
                        if (users.length !== value.length) {
                            throw new ErrorWithStatus({
                                message: USERS_MESSAGES.USER_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }
                        if (!value.includes(req.decoded_authorization.user_id)) {
                            value.push(req.decoded_authorization.user_id)
                        }
                    }
                }
            }
        },
        ['body']
    )
)

export const verifyUserTaskAccess = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload;
    const { task_id } = req.params;

    const assignee = await databaseServices.taskAssignments.findOne({
        task_id: new ObjectId(task_id),
        user_id: new ObjectId(user_id),
    });

    if (!assignee) {
        throw new ErrorWithStatus({
            message: 'Task not found or you do not have access to this task',
            status: HTTP_STATUS.FORBIDDEN,
        });
    }

    next();
}

export const verifyOwnerTask = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload;
    const { task_id } = req.params;

    const task = await databaseServices.tasks.findOne({
        _id: new ObjectId(task_id) as any,
        creatorId: new ObjectId(user_id),
    });

    if (!task) {
        throw new ErrorWithStatus({
            message: 'Task not found or you do not have access to this task',
            status: HTTP_STATUS.FORBIDDEN,
        });
    }

    next();
}